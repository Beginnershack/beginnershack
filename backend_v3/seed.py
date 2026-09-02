import json
import os

from models import db, Course, Message

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
COURSES_FILE = os.path.join(BASE_DIR, "data", "courses.json")
MESSAGES_FILE = os.path.join(BASE_DIR, "data", "messages.json")


def seed_if_empty():
    """テーブルが空のときだけ、旧JSONファイルの中身をDBに流し込む。"""
    if Course.query.count() == 0 and os.path.exists(COURSES_FILE):
        with open(COURSES_FILE, "r", encoding="utf-8") as f:
            records = json.load(f)
        for record in records:
            db.session.add(Course.from_json_record(record))
        db.session.commit()

    if Message.query.count() == 0 and os.path.exists(MESSAGES_FILE):
        with open(MESSAGES_FILE, "r", encoding="utf-8") as f:
            records = json.load(f)
        for record in records:
            db.session.add(Message.from_json_record(record))
        db.session.commit()
