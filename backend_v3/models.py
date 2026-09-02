import uuid

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def _safe_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


class Course(db.Model):
    __tablename__ = "courses"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    author = db.Column(db.String(100), default="匿名")
    poster_id = db.Column(db.String(100), default="")
    course_name = db.Column(db.String(255))
    instructor = db.Column(db.String(255))
    semester = db.Column(db.String(50))
    course_code = db.Column(db.String(50))
    faculty = db.Column(db.String(255))
    day_of_week = db.Column(db.String(10))
    period = db.Column(db.Integer)
    exam_type = db.Column(db.String(50))
    attendance_required = db.Column(db.Boolean, default=False)
    easiness = db.Column(db.Integer)
    comment = db.Column(db.Text)
    syllabus_url = db.Column(db.String(500))
    created_at = db.Column(db.String(64))

    # フロント側は今まで通り日本語キーのJSONを受け取る前提なので、
    # DBの英語カラム名 <-> 既存API JSON の日本語キーをここで変換する。
    def to_dict(self):
        return {
            "id": self.id,
            "投稿者": self.author or "匿名",
            "投稿者ID": self.poster_id or "",
            "授業名": self.course_name,
            "担当教員": self.instructor,
            "開講学期": self.semester,
            "授業コード": self.course_code,
            "学部学科": self.faculty,
            "曜日": self.day_of_week,
            "時限": self.period,
            "評価方法": self.exam_type,
            "出席確認": bool(self.attendance_required),
            "楽単度": self.easiness,
            "コメント": self.comment,
            "シラバスURL": self.syllabus_url,
            "投稿日時": self.created_at,
        }

    @staticmethod
    def from_json_record(record):
        """起動時の初期データ流し込み用。旧data/courses.jsonの1件分を変換する。"""
        return Course(
            id=record.get("id") or str(uuid.uuid4()),
            author=record.get("投稿者") or "匿名",
            poster_id=record.get("投稿者ID") or "",
            course_name=record.get("授業名"),
            instructor=record.get("担当教員"),
            semester=record.get("開講学期"),
            course_code=record.get("授業コード"),
            faculty=record.get("学部学科"),
            day_of_week=record.get("曜日"),
            period=_safe_int(record.get("時限")),
            exam_type=record.get("評価方法"),
            attendance_required=bool(record.get("出席確認")),
            easiness=_safe_int(record.get("楽単度")),
            comment=record.get("コメント"),
            syllabus_url=record.get("シラバスURL"),
            created_at=record.get("投稿日時"),
        )


class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sender = db.Column(db.String(100))
    receiver = db.Column(db.String(100))
    body = db.Column(db.Text)
    created_at = db.Column(db.String(64))

    def to_dict(self):
        return {
            "送信者": self.sender,
            "受信者": self.receiver,
            "本文": self.body,
            "送信日時": self.created_at,
        }

    @staticmethod
    def from_json_record(record):
        return Message(
            sender=record.get("送信者"),
            receiver=record.get("受信者"),
            body=record.get("本文"),
            created_at=record.get("送信日時"),
        )
