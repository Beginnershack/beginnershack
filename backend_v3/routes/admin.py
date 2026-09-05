import hmac
import os

from flask import Blueprint, request, jsonify

from models import db, Course, Message

# 本番のテストデータ削除用に一時的に追加したエンドポイント。
# 削除作業が終わったら、このファイルとapp.pyでのblueprint登録を削除すること。
admin_bp = Blueprint("admin", __name__)


def _is_authorized():
    expected = os.environ.get("ADMIN_TOKEN")
    if not expected:
        return False
    provided = request.headers.get("X-Admin-Token", "")
    return hmac.compare_digest(provided, expected)


@admin_bp.route("/api/admin/courses/<course_id>", methods=["DELETE"])
def delete_course(course_id):
    if not _is_authorized():
        return jsonify({"error": "unauthorized"}), 403

    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "course not found"}), 404

    db.session.delete(course)
    db.session.commit()
    return jsonify({"deleted": course_id}), 200


@admin_bp.route("/api/admin/messages/<int:message_id>", methods=["DELETE"])
def delete_message(message_id):
    if not _is_authorized():
        return jsonify({"error": "unauthorized"}), 403

    message = Message.query.get(message_id)
    if not message:
        return jsonify({"error": "message not found"}), 404

    db.session.delete(message)
    db.session.commit()
    return jsonify({"deleted": message_id}), 200


@admin_bp.route("/api/admin/reset", methods=["POST"])
def reset_all_data():
    if not _is_authorized():
        return jsonify({"error": "unauthorized"}), 403

    messages_deleted = Message.query.delete()
    courses_deleted = Course.query.delete()
    db.session.commit()
    return jsonify({"deleted": {"courses": courses_deleted, "messages": messages_deleted}}), 200
