from datetime import datetime, timezone
from flask import Blueprint, jsonify
from sqlalchemy import text
from app.models import db

health_bp = Blueprint("health", __name__, url_prefix="/api/health")

@health_bp.route("", methods=["GET"])
def check_health():
    db_status = "connected"
    status_code = 200
    try:
        db.session.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"disconnected: {str(e)}"
        status_code = 503

    return jsonify({
        "status": "healthy" if status_code == 200 else "degraded",
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "SmartLink REST API"
    }), status_code
