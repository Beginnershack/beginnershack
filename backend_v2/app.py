import json
import os
import time
import random
import string
import re
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timezone

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from routes.courses_search import courses_search_bp
from routes.messages import messages_bp

load_dotenv()

app = Flask(__name__)
CORS(app)

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

# --- 究極の裏技：ハイブリッド方式（事前データ＋GET検索） ---
def scrape_subject_id(course_code, teacher_name):
    # 【事前準備データ】画像から抽出した無敵のリスト
    # ※入力揺れを防ぐため、先生の名前はスペースを抜いた状態で登録しています
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
    
    # 入力された先生の名前からスペース（全角・半角）を消して照合する
    normalized_teacher = teacher_name.replace(" ", "").replace(" ", "")
    
    if (course_code, normalized_teacher) in EMERGENCY_CACHE:
        print("-> 【裏技発動！】事前データから一瞬でIDを取得しました！安全・爆速です！")
        return EMERGENCY_CACHE[(course_code, normalized_teacher)]

    print("-> 辞書にないため、大学のサーバーへGET検索を試みます...")
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
            # 検索結果もスペース無視でマッチング
            if normalized_teacher in row_text.replace(" ", "").replace(" ", ""):
                link = row.find('a', href=True)
                if link and 'subjectId=' in link['href']:
                    match = re.search(r'subjectId=([0-9]+)', link['href'])
                    if match:
                        print(f"-> 検索成功！ID: {match.group(1)}")
                        return match.group(1)
                        
        print("-> 検索しましたが、該当する行が見つかりませんでした。")
        return None
    except Exception as e:
        print(f"スクレイピングエラー（スキップしました）: {e}")
        return None
# ----------------------------------------------------

def create_course(data):
    courses = read_courses()
    
    course_code = (data.get("授業コード") or "").strip()
    teacher_name = (data.get("担当教員") or "").strip()
    
    final_syllabus_url = ""
    if course_code and teacher_name:
        extracted_id = scrape_subject_id(course_code, teacher_name)
        
        if extracted_id:
            final_syllabus_url = f"https://syllabus.aitech.ac.jp/ext_syllabus/referenceDirect.do?nologin=on&subjectID={extracted_id}&formatCD=1"

    new_course = {
        "授業名": data.get("授業名"),
        "担当教員": teacher_name,
        "開講学期": data.get("開講学期"),
        "授業コード": course_code,
        "学部学科": data.get("学部学科"),
        "曜日": data.get("曜日"),
        "時限": int(data.get("時限")),
        "評価方法": data.get("評価方法"),
        "出席確認": bool(data.get("出席確認")),
        "楽単度": int(data.get("楽単度")),
        "コメント": (data.get("コメント") or "").strip(),
        "シラバスURL": final_syllabus_url,
        "投稿日時": datetime.now(timezone.utc).isoformat()
    }
    courses.append(new_course)
    write_courses(courses)
    return new_course


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

    if errors:
        return jsonify({"error": " / ".join(errors)}), 400

    created = create_course(body)
    return jsonify(created), 201


if __name__ == "__main__":
    app.run(port=PORT, debug=True)