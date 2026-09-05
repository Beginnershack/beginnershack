import hmac
import os

from flask import Blueprint, request, jsonify

from models import db, Course, Message

# 本番DBリセット用に一時的に追加したエンドポイント。
# 使い終わったら、このファイルとapp.pyでのblueprint登録を削除すること。
admin_bp = Blueprint("admin", __name__)


def _is_authorized():
    expected = os.environ.get("ADMIN_TOKEN")
    if not expected:
        return False
    provided = request.headers.get("X-Admin-Token", "")
    return hmac.compare_digest(provided, expected)


@admin_bp.route("/api/admin/reset", methods=["POST"])
def reset_all_data():
    if not _is_authorized():
        return jsonify({"error": "unauthorized"}), 403

    messages_deleted = Message.query.delete()
    courses_deleted = Course.query.delete()
    db.session.commit()
    return jsonify({"deleted": {"courses": courses_deleted, "messages": messages_deleted}}), 200
