from flask import Blueprint, jsonify, request

from models import Course

courses_search_bp = Blueprint("courses_search", __name__)


# GET /api/courses - 授業検索(キーワード・学部学科・曜日・時限で絞り込み)
@courses_search_bp.route("/api/courses", methods=["GET"])
def search_courses():
    courses = Course.query.all()

    keyword = request.args.get("keyword")
    faculty = request.args.get("faculty")  # 学部学科
    day = request.args.get("day")  # 曜日
    period = request.args.get("period")  # 時限

    if keyword:
        courses = [
            c
            for c in courses
            if keyword in (c.course_name or "")
            or keyword in (c.instructor or "")
        ]
    if faculty:
        courses = [c for c in courses if c.faculty == faculty]
    if day:
        courses = [c for c in courses if c.day_of_week == day]
    if period:
        try:
            period_int = int(period)
        except ValueError:
            period_int = None
        if period_int is not None:
            courses = [c for c in courses if c.period == period_int]

    return jsonify([c.to_dict() for c in courses])


# GET /api/courses/<course_id> - 授業詳細
@courses_search_bp.route("/api/courses/<course_id>", methods=["GET"])
def get_course(course_id):
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "授業が見つかりません"}), 404
    return jsonify(course.to_dict())
