import os
import re
import uuid
from datetime import datetime, timezone

import requests
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from sqlalchemy import inspect, text

from models import db, Course
from routes.courses_search import courses_search_bp
from routes.messages import messages_bp
from routes.admin import admin_bp
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
app.register_blueprint(admin_bp)

def migrate_schema():
    """db.create_all()は既存テーブルへのカラム追加/型変更はしないため、
    足りないカラムや古い型があれば手動で直す（簡易マイグレーション）。"""
    inspector = inspect(db.engine)
    table_names = inspector.get_table_names()

    if "messages" in table_names:
        columns = {col["name"] for col in inspector.get_columns("messages")}
        if "image" not in columns:
            db.session.execute(text("ALTER TABLE messages ADD COLUMN image TEXT"))
            db.session.commit()

    if "courses" in table_names and db.engine.dialect.name == "postgresql":
        # 2時間続きの授業を1件の授業として扱えるよう、periodをカンマ区切り
        # 文字列("3,4"など)で保持できるINTEGER→VARCHARへ変更する。
        # (SQLiteは型を厳密に強制しないため対応不要)
        columns = {col["name"]: col for col in inspector.get_columns("courses")}
        period_col = columns.get("period")
        if period_col is not None and "INT" in str(period_col["type"]).upper():
            db.session.execute(
                text("ALTER TABLE courses ALTER COLUMN period TYPE VARCHAR(20) USING period::varchar")
            )
            db.session.commit()


with app.app_context():
    db.create_all()
    migrate_schema()
    if os.environ.get("SEED_INITIAL_DATA") == "true":
        seed_if_empty()

PORT = int(os.environ.get("PORT", 3001))

評価方法一覧 = ["なし", "試験", "レポート", "試験とレポート"]
曜日一覧 = ["月", "火", "水", "木", "金", "土", "日"]
時限一覧 = [1, 2, 3, 4, 5, 6, 7]


def parse_periods(value):
    """「時限」の入力値を正規化する。2時間続きの授業などで複数時限
    (例: "3,4") が渡されても、1つの授業として扱えるようにパースする。
    不正な値が含まれる場合はNoneを返す。"""
    if value is None:
        return None

    if isinstance(value, (int, float)):
        raw_parts = [value]
    else:
        raw_parts = str(value).split(",")

    periods = []
    for part in raw_parts:
        try:
            p = int(part)
        except (TypeError, ValueError):
            return None
        if p not in 時限一覧:
            return None
        if p not in periods:
            periods.append(p)

    if not periods:
        return None

    periods.sort()
    return periods


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
    normalized_code = course_code.strip().upper()

    if (course_code, normalized_teacher) in EMERGENCY_CACHE:
        return EMERGENCY_CACHE[(course_code, normalized_teacher)]

    # 実際の検索フォームはGET+freeWord(授業コード)では機能しない。
    # ブラウザの開発者ツールで確認したところ、正しくは
    # 1) トップページに先にアクセスしてセッション(JSESSIONID)を確立し、
    # 2) syllabusSearch.doへPOSTで担当教員名(editorName)を送る
    # という手順が必要だった。授業コードで直接検索できる項目は無いため、
    # 教員名で検索したうえで、結果一覧の中から授業コードが完全一致する
    # 行を探す。年度を表すsyllabusTitleIDは毎年値が変わるため、
    # 検索フォームのページから都度取得する。
    base_url = "https://syllabus.aitech.ac.jp/ext_syllabus/"
    search_url = "https://syllabus.aitech.ac.jp/ext_syllabus/syllabusSearch.do"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }

    try:
        session = requests.Session()
        top_page = session.get(base_url, headers=headers, timeout=5)
        top_soup = BeautifulSoup(top_page.text, "html.parser")
        title_select = top_soup.find("select", attrs={"name": "syllabusTitleID"})
        selected_option = title_select.find("option", selected=True) if title_select else None
        syllabus_title_id = selected_option["value"] if selected_option else ""

        response = session.post(
            search_url,
            data={
                "syllabusTitleID": syllabus_title_id,
                "indexID": "",
                "subFolderFlag": "on",
                "syllabusCampus": "",
                "syllabusSemester": "",
                "syllabusWeek": "",
                "syllabusHour": "",
                "kamokuName": "",
                "editorName": teacher_name,
                "freeWord": "",
                "actionStatus": "search",
                "subFolderFlag2": "on",
                "bottonType": "search",
            },
            headers=headers,
            timeout=5,
        )
        soup = BeautifulSoup(response.text, "html.parser")

        for row in soup.find_all("tr"):
            cells = row.find_all("td")
            if not any(cell.get_text(strip=True).upper() == normalized_code for cell in cells):
                continue
            row_text = row.get_text()
            if normalized_teacher not in row_text.replace(" ", "").replace("　", ""):
                continue
            link = row.find("a", onclick=True)
            if link:
                match = re.search(r"subjectId=([0-9]+)", link["onclick"])
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
        period=",".join(str(p) for p in parse_periods(data.get("時限"))),
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

    if parse_periods(body.get("時限")) is None:
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
