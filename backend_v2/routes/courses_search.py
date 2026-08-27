import json
import os

from flask import Blueprint, jsonify, request

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(BASE_DIR, "data", "courses.json")

courses_search_bp = Blueprint("courses_search", __name__)


def read_courses():
    """courses.json を読み込む。ファイルが無ければ空リストを返す。"""
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


# GET /api/courses - 授業検索(キーワード・学部学科・曜日・時限で絞り込み)
@courses_search_bp.route("/api/courses", methods=["GET"])
def search_courses():
    courses = read_courses()

    keyword = request.args.get("keyword")
    faculty = request.args.get("faculty")  # 学部学科
    day = request.args.get("day")  # 曜日
    period = request.args.get("period")  # 時限

    if keyword:
        courses = [
            c
            for c in courses
            if keyword in (c.get("授業名") or "")
            or keyword in (c.get("担当教員") or "")
        ]
    if faculty:
        courses = [c for c in courses if c.get("学部学科") == faculty]
    if day:
        courses = [c for c in courses if c.get("曜日") == day]
    if period:
        try:
            period_int = int(period)
        except ValueError:
            period_int = None
        if period_int is not None:
            courses = [c for c in courses if c.get("時限") == period_int]

    return jsonify(courses)


# GET /api/courses/<course_id> - 授業詳細
@courses_search_bp.route("/api/courses/<course_id>", methods=["GET"])
def get_course(course_id):
    courses = read_courses()
    course = next((c for c in courses if c.get("id") == course_id), None)
    if not course:
        return jsonify({"error": "授業が見つかりません"}), 404
    return jsonify(course)
