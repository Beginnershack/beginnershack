import json
import os
import time
import random
import string
from datetime import datetime, timezone

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from routes.courses_search import courses_search_bp
from routes.messages import messages_bp

load_dotenv()

app = Flask(__name__)
CORS(app)

# 授業検索・メッセージ機能のAPIを登録
# (口コミ機能は POST /api/courses に統合されているため、専用APIは無し)
app.register_blueprint(courses_search_bp)
app.register_blueprint(messages_bp)

PORT = int(os.environ.get("PORT", 3001))

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "data", "courses.json")

評価方法一覧 = ["なし", "試験", "レポート", "試験とレポート"]
曜日一覧 = ["月", "火", "水", "木", "金", "土", "日"]
時限一覧 = [1, 2, 3, 4, 5, 6, 7]


def read_courses():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def write_courses(courses):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(courses, f, ensure_ascii=False, indent=2)


def generate_id():
    timestamp_part = format(int(time.time() * 1000), "x")
    random_part = "".join(random.choices(string.ascii_lowercase + string.digits, k=5))
    return f"{timestamp_part}{random_part}"


def create_course(data):
    courses = read_courses()
    new_course = {
        "id": generate_id(),
        "授業名": data.get("授業名"),
        "担当教員": data.get("担当教員"),
        "学部学科": data.get("学部学科"),
        "曜日": data.get("曜日"),
        "時限": int(data.get("時限")),
        "出席確認": bool(data.get("出席確認")),
        "評価方法": data.get("評価方法"),
        "コメント": (data.get("コメント") or "").strip(),
        "投稿者": (data.get("投稿者") or "").strip() or "匿名",
        "投稿日時": datetime.now(timezone.utc).isoformat(),
    }
    courses.append(new_course)
    write_courses(courses)
    return new_course


# 動作確認用エンドポイント
@app.route("/api/hello")
def hello():
    return jsonify({"message": "Hello from backend!"})


@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


# POST /api/courses - 授業の詳細を投稿
@app.route("/api/courses", methods=["POST"])
def post_course():
    body = request.get_json(silent=True) or {}

    errors = []
    if not (body.get("授業名") or "").strip():
        errors.append("授業名は必須です")
    if not (body.get("担当教員") or "").strip():
        errors.append("担当教員は必須です")
    if not (body.get("学部学科") or "").strip():
        errors.append("学部/学科は必須です")
    if body.get("曜日") not in 曜日一覧:
        errors.append("曜日は必須です")
    try:
        時限ok = int(body.get("時限")) in 時限一覧
    except (TypeError, ValueError):
        時限ok = False
    if not 時限ok:
        errors.append("何限かは必須です")
    if body.get("評価方法") not in 評価方法一覧:
        errors.append("評価方法は必須です")

    if errors:
        return jsonify({"error": " / ".join(errors)}), 400

    created = create_course(body)
    return jsonify(created), 201


if __name__ == "__main__":
    app.run(port=PORT, debug=True)
