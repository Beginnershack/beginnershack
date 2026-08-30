from flask import Blueprint, request, jsonify
import json
import os
from datetime import datetime, timezone

messages_bp = Blueprint('messages', __name__)

# メッセージを保存するファイルの場所
DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "messages.json")

def read_messages():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
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