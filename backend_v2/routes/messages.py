import json
import os
import random
import string
import time
from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(BASE_DIR, "data", "messages.json")

messages_bp = Blueprint("messages", __name__)


def generate_id():
    timestamp_part = format(int(time.time() * 1000), "x")
    random_part = "".join(random.choices(string.ascii_lowercase + string.digits, k=5))
    return f"{timestamp_part}{random_part}"


def read_messages():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def write_messages(messages):
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(messages, f, ensure_ascii=False, indent=2)


# POST /api/messages - 学生同士のメッセージ送信
@messages_bp.route("/api/messages", methods=["POST"])
def send_message():
    body = request.get_json(silent=True) or {}
    sender = (body.get("送信者") or "").strip()
    receiver = (body.get("受信者") or "").strip()
    content = (body.get("内容") or "").strip()

    errors = []
    if not sender:
        errors.append("送信者は必須です")
    if not receiver:
        errors.append("受信者は必須です")
    if not content:
        errors.append("メッセージ内容は必須です")
    if sender and receiver and sender == receiver:
        errors.append("自分自身にはメッセージを送れません")

    if errors:
        return jsonify({"error": " / ".join(errors)}), 400

    new_message = {
        "id": generate_id(),
        "送信者": sender,
        "受信者": receiver,
        "内容": content,
        "既読": False,
        "送信日時": datetime.now(timezone.utc).isoformat(),
    }

    messages = read_messages()
    messages.append(new_message)
    write_messages(messages)
    return jsonify(new_message), 201


# GET /api/messages/conversation?user1=A&user2=B - 2人間のやり取りを時系列で取得
@messages_bp.route("/api/messages/conversation", methods=["GET"])
def get_conversation():
    user1 = request.args.get("user1")
    user2 = request.args.get("user2")
    messages = read_messages()

    conversation = [
        m
        for m in messages
        if {m.get("送信者"), m.get("受信者")} == {user1, user2}
    ]
    conversation.sort(key=lambda m: m.get("送信日時", ""))
    return jsonify(conversation)


# GET /api/messages/inbox/<user> - 自分宛メッセージ一覧(新しい順)
@messages_bp.route("/api/messages/inbox/<user>", methods=["GET"])
def get_inbox(user):
    messages = read_messages()
    inbox = [m for m in messages if m.get("受信者") == user]
    inbox.sort(key=lambda m: m.get("送信日時", ""), reverse=True)
    return jsonify(inbox)


# PATCH /api/messages/<message_id>/read - 既読にする
@messages_bp.route("/api/messages/<message_id>/read", methods=["PATCH"])
def mark_as_read(message_id):
    messages = read_messages()
    message = next((m for m in messages if m.get("id") == message_id), None)
    if not message:
        return jsonify({"error": "メッセージが見つかりません"}), 404
    message["既読"] = True
    write_messages(messages)
    return jsonify(message)
