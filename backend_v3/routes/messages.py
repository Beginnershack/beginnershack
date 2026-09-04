import base64
import binascii
import re

from flask import Blueprint, request, jsonify
from datetime import datetime, timezone

from moderation import find_ng_word, check_image_moderation
from models import db, Course, Message

messages_bp = Blueprint('messages', __name__)

# data:image/png;base64,.... の形式だけを許可する
IMAGE_DATA_URL_RE = re.compile(r"^data:image/(png|jpe?g|gif|webp);base64,(.+)$", re.DOTALL)
MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5MB


def _validate_image(image):
    """画像のdata URLを検証する。問題があればエラーメッセージを返す。"""
    match = IMAGE_DATA_URL_RE.match(image)
    if not match:
        return "画像の形式が正しくありません"

    try:
        decoded = base64.b64decode(match.group(2), validate=True)
    except (binascii.Error, ValueError):
        return "画像データを読み取れませんでした"

    if len(decoded) > MAX_IMAGE_BYTES:
        return "画像は5MB以下にしてください"

    return None


# --- チャット履歴を見る (GET) ---
@messages_bp.route("/api/messages", methods=["GET"])
def get_messages():
    user1 = request.args.get("user1", "")
    user2 = request.args.get("user2", "")

    # 2人の間のやり取りだけを抜き出す
    messages = Message.query.filter(
        db.or_(
            db.and_(Message.sender == user1, Message.receiver == user2),
            db.and_(Message.sender == user2, Message.receiver == user1),
        )
    ).order_by(Message.id.asc()).all()

    return jsonify([m.to_dict() for m in messages]), 200


# --- 自分宛に届いたメッセージの一覧 (GET) ---
# 自分が投稿した口コミ（授業）ごとに、質問してきた相手とのスレッドを
# 最新メッセージ付きでまとめて返す。
@messages_bp.route("/api/messages/inbox", methods=["GET"])
def get_inbox():
    my_id = request.args.get("myId", "").strip()
    if not my_id:
        return jsonify([]), 200

    my_courses = {c.id: c for c in Course.query.filter_by(poster_id=my_id).all()}
    if not my_courses:
        return jsonify([]), 200

    messages = Message.query.all()
    threads = {}  # (courseId, otherUserId) -> 最新メッセージ

    for m in messages:
        sender = m.sender
        receiver = m.receiver

        if sender in my_courses:
            course_id, other_id = sender, receiver
        elif receiver in my_courses:
            course_id, other_id = receiver, sender
        else:
            continue

        key = (course_id, other_id)
        prev = threads.get(key)
        if not prev or (m.created_at or "") > (prev.created_at or ""):
            threads[key] = m

    inbox = []
    for (course_id, other_id), last_msg in threads.items():
        course = my_courses[course_id]
        inbox.append({
            "courseId": course_id,
            "courseName": course.course_name,
            "otherUserId": other_id,
            "lastMessage": last_msg.body,
            "lastMessageAt": last_msg.created_at,
        })

    inbox.sort(key=lambda r: r["lastMessageAt"] or "", reverse=True)
    return jsonify(inbox), 200


# --- メッセージを送る (POST) ---
@messages_bp.route("/api/messages", methods=["POST"])
def post_message():
    body = request.get_json(silent=True) or {}

    sender = (body.get("送信者") or "").strip()
    receiver = (body.get("受信者") or "").strip()
    text = (body.get("本文") or "").strip()
    image = (body.get("画像") or "").strip()

    # 入力チェック（本文か画像のどちらかがあればよい）
    if not sender or not receiver or (not text and not image):
        return jsonify({"error": "送信者、受信者、本文または画像は必要です"}), 400

    if text and find_ng_word(text):
        return jsonify({"error": "不適切な表現が含まれているため送信できません"}), 400

    if image:
        error = _validate_image(image)
        if error:
            return jsonify({"error": error}), 400

        if check_image_moderation(image) is True:
            return jsonify({"error": "不適切な画像が含まれているため送信できません"}), 400

    new_message = Message(
        sender=sender,
        receiver=receiver,
        body=text,
        image=image or None,
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    db.session.add(new_message)
    db.session.commit()

    return jsonify(new_message.to_dict()), 201
