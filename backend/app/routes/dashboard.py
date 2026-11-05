from flask import Blueprint, jsonify
from app.services.analytics_service import AnalyticsService

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")

@dashboard_bp.route("/stats", methods=["GET"])
def get_dashboard_stats():
    stats = AnalyticsService.get_dashboard_stats()
    return jsonify(stats), 200

@dashboard_bp.route("/recent", methods=["GET"])
def get_dashboard_recent():
    recent = AnalyticsService.get_recent_links(limit=5)
    return jsonify(recent), 200
