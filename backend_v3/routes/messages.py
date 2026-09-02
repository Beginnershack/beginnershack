from flask import Blueprint, request, jsonify
import json
import os
from datetime import datetime, timezone

from moderation import find_ng_word

messages_bp = Blueprint('messages', __name__)

# メッセージを保存するファイルの場所
DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "messages.json")
COURSES_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "courses.json")

def read_messages():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def read_courses():
    if not os.path.exists(COURSES_FILE):
        return []
    with open(COURSES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def write_messages(messages):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(messages, f, ensure_ascii=False, indent=2)

# --- チャット履歴を見る (GET) ---
@messages_bp.route("/api/messages", methods=["GET"])
def get_messages():
    user1 = request.args.get("user1", "")
    user2 = request.args.get("user2", "")
    
    messages = read_messages()
    
    # 2人の間のやり取りだけを抜き出す
    chat_history = []
    for m in messages:
        if (m.get("送信者") == user1 and m.get("受信者") == user2) or \
           (m.get("送信者") == user2 and m.get("受信者") == user1):
            chat_history.append(m)
            
    return jsonify(chat_history), 200

# --- 自分宛に届いたメッセージの一覧 (GET) ---
# 自分が投稿した口コミ（授業）ごとに、質問してきた相手とのスレッドを
# 最新メッセージ付きでまとめて返す。
@messages_bp.route("/api/messages/inbox", methods=["GET"])
def get_inbox():
    my_id = request.args.get("myId", "").strip()
    if not my_id:
        return jsonify([]), 200

    courses = read_courses()
    my_courses = {c.get("id"): c for c in courses if c.get("投稿者ID") == my_id}
    if not my_courses:
        return jsonify([]), 200

    messages = read_messages()
    threads = {}  # (courseId, otherUserId) -> 最新メッセージ

    for m in messages:
        sender = m.get("送信者")
        receiver = m.get("受信者")

        if sender in my_courses:
            course_id, other_id = sender, receiver
        elif receiver in my_courses:
            course_id, other_id = receiver, sender
        else:
            continue

        key = (course_id, other_id)
        prev = threads.get(key)
        if not prev or (m.get("送信日時") or "") > (prev.get("送信日時") or ""):
            threads[key] = m

    inbox = []
    for (course_id, other_id), last_msg in threads.items():
        course = my_courses[course_id]
        inbox.append({
            "courseId": course_id,
            "courseName": course.get("授業名"),
            "otherUserId": other_id,
            "lastMessage": last_msg.get("本文"),
            "lastMessageAt": last_msg.get("送信日時"),
        })

    inbox.sort(key=lambda r: r["lastMessageAt"] or "", reverse=True)
    return jsonify(inbox), 200


# --- メッセージを送る (POST) ---
@messages_bp.route("/api/messages", methods=["POST"])
def post_message():
    body = request.get_json(silent=True) or {}
    
    sender = body.get("送信者", "").strip()
    receiver = body.get("受信者", "").strip()
    text = body.get("本文", "").strip()
    
    # 入力チェック
    if not sender or not receiver or not text:
        return jsonify({"error": "送信者、受信者、本文はすべて必要です"}), 400

    if find_ng_word(text):
        return jsonify({"error": "不適切な表現が含まれているため送信できません"}), 400

    messages = read_messages()
    
    new_message = {
        "送信者": sender,
        "受信者": receiver,
        "本文": text,
        "送信日時": datetime.now(timezone.utc).isoformat()
    }
    
    messages.append(new_message)
    write_messages(messages)
    
    return jsonify(new_message), 201