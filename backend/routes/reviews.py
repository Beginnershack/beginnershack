import json
import os
import random
import string
import time
from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(BASE_DIR, "data", "reviews.json")

reviews_bp = Blueprint("reviews", __name__)

# 注意: 口コミの詳細な評価項目(中身)は別途決定・実装予定。
# ここでは「口コミ作成ページ」からAPIを呼び出せるようにするための
# 最低限の項目(評価・コメント・投稿者)のみ用意している。
# 項目が増える場合はここに追記すればOK。


def generate_id():
    timestamp_part = format(int(time.time() * 1000), "x")
    random_part = "".join(random.choices(string.ascii_lowercase + string.digits, k=5))
    return f"{timestamp_part}{random_part}"


def read_reviews():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def write_reviews(reviews):
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(reviews, f, ensure_ascii=False, indent=2)


# GET /api/courses/<course_id>/reviews - 指定授業の口コミ一覧
@reviews_bp.route("/api/courses/<course_id>/reviews", methods=["GET"])
def list_reviews(course_id):
    reviews = read_reviews()
    course_reviews = [r for r in reviews if r.get("授業ID") == course_id]
    return jsonify(course_reviews)


# POST /api/courses/<course_id>/reviews - 口コミ投稿
@reviews_bp.route("/api/courses/<course_id>/reviews", methods=["POST"])
def create_review(course_id):
    body = request.get_json(silent=True) or {}

    new_review = {
        "id": generate_id(),
        "授業ID": course_id,
        "投稿者": (body.get("投稿者") or "").strip() or "匿名",
        "評価": body.get("評価"),
        "コメント": (body.get("コメント") or "").strip(),
        "投稿日時": datetime.now(timezone.utc).isoformat(),
    }

    reviews = read_reviews()
    reviews.append(new_review)
    write_reviews(reviews)
    return jsonify(new_review), 201
