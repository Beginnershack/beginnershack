import os
import re
import uuid
from datetime import datetime, timezone

import requests
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from models import db, Course
from routes.courses_search import courses_search_bp
from routes.messages import messages_bp
from moderation import find_ng_word
from seed import seed_if_empty

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def get_database_uri():
    url = os.environ.get("DATABASE_URL")
    if url:
        # Renderはpostgres://形式で渡してくるが、SQLAlchemyはpostgresql://を要求する
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url
    return f"sqlite:///{os.path.join(BASE_DIR, 'local.db')}"


app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = get_database_uri()
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

frontend_url = os.environ.get("FRONTEND_URL")
if frontend_url:
    CORS(app, origins=[frontend_url])
else:
    CORS(app)

app.register_blueprint(courses_search_bp)
app.register_blueprint(messages_bp)

with app.app_context():
    db.create_all()
    seed_if_empty()

PORT = int(os.environ.get("PORT", 3001))

評価方法一覧 = ["なし", "試験", "レポート", "試験とレポート"]
曜日一覧 = ["月", "火", "水", "木", "金", "土", "日"]
時限一覧 = [1, 2, 3, 4, 5, 6, 7]


def scrape_subject_id(course_code, teacher_name):
    EMERGENCY_CACHE = {
        ("v1007000", "高木淳"): "002400055907",
        ("v1010000", "矢野良和"): "002400055913",
        ("v1015000", "水嶋大輔"): "002400055931",
        ("G1829000", "ウォルシュナイアルマーク"): "002400054414",
        ("v1013000", "桑原竜弥"): "002400055923",
        ("v1001000", "松本耕二"): "002400055900",
        ("v1017000", "青木道宏"): "002400055938",
        ("v1016000", "宮路祐一"): "002400055936",
        ("v2001000", "真島一成"): "002400055971",
        ("v2005000", "釘宮慎一"): "002400055974",
    }

    normalized_teacher = teacher_name.replace(" ", "").replace("　", "")

    if (course_code, normalized_teacher) in EMERGENCY_CACHE:
        return EMERGENCY_CACHE[(course_code, normalized_teacher)]

    search_url = f"https://syllabus.aitech.ac.jp/ext_syllabus/syllabusSearch.do?freeWord={course_code}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }

    try:
        response = requests.get(search_url, headers=headers, timeout=3)
        soup = BeautifulSoup(response.text, 'html.parser')
        rows = soup.find_all('tr')

        for row in rows:
            row_text = row.get_text()
            if normalized_teacher in row_text.replace(" ", "").replace("　", ""):
                link = row.find('a', href=True)
                if link and 'subjectId=' in link['href']:
                    match = re.search(r'subjectId=([0-9]+)', link['href'])
                    if match:
                        return match.group(1)

        return None
    except Exception:
        return None


def create_course(data):
    course_code = (data.get("授業コード") or "").strip()
    teacher_name = (data.get("担当教員") or "").strip()

    final_syllabus_url = ""
    if course_code and teacher_name:
        extracted_id = scrape_subject_id(course_code, teacher_name)

        if extracted_id:
            final_syllabus_url = f"https://syllabus.aitech.ac.jp/ext_syllabus/referenceDirect.do?nologin=on&subjectID={extracted_id}&formatCD=1"

    new_course = Course(
        id=str(uuid.uuid4()),  # ← システム用の秘密ID
        author="匿名",  # ← 画面にはこれが出ます
        poster_id=(data.get("投稿者ID") or "").strip(),  # ← 誰が投稿したかの匿名ID（メッセージの宛先特定に使う）
        course_name=data.get("授業名"),
        instructor=teacher_name,
        semester=data.get("開講学期"),
        course_code=course_code,
        faculty=data.get("学部学科"),
        day_of_week=data.get("曜日"),
        period=int(data.get("時限")),
        exam_type=data.get("評価方法"),
        attendance_required=bool(data.get("出席確認")),
        easiness=int(data.get("楽単度")),
        comment=(data.get("コメント") or "").strip(),
        syllabus_url=final_syllabus_url,
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    db.session.add(new_course)
    db.session.commit()
    return new_course.to_dict()


@app.route("/api/hello")
def hello():
    return jsonify({"message": "Hello from backend!"})

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/api/courses", methods=["POST"])
def post_course():
    body = request.get_json(silent=True) or {}

    errors = []

    if not (body.get("授業名") or "").strip():
        errors.append("授業名は必須です")
    if not (body.get("担当教員") or "").strip():
        errors.append("担当教員は必須です")
    if not (body.get("開講学期") or "").strip():
        errors.append("開講学期は必須です")
    if not (body.get("授業コード") or "").strip():
        errors.append("授業コードは必須です")
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

    if "出席確認" not in body:
        errors.append("出席の有無は必須です")

    try:
        rakutan = int(body.get("楽単度", 0))
        if rakutan < 1 or rakutan > 5:
            errors.append("楽単度は1〜5の星で評価してください")
    except (TypeError, ValueError):
        errors.append("楽単度は数値で入力してください")

    for field in ("授業名", "コメント"):
        ng = find_ng_word(body.get(field) or "")
        if ng:
            errors.append(f"{field}に不適切な表現が含まれています")

    if errors:
        return jsonify({"error": " / ".join(errors)}), 400

    created = create_course(body)
    return jsonify(created), 201


if __name__ == "__main__":
    app.run(port=PORT, debug=True)
