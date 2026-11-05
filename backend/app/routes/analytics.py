from flask import Blueprint, request, jsonify
from app.services.analytics_service import AnalyticsService

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")

@analytics_bp.route("/overview", methods=["GET"])
def get_overview():
    overview = AnalyticsService.get_analytics_overview()
    return jsonify(overview), 200

@analytics_bp.route("/clicks", methods=["GET"])
def get_clicks():
    period = request.args.get("period", "weekly")
    clicks_data = AnalyticsService.get_clicks_by_period(period)
    return jsonify(clicks_data), 200

@analytics_bp.route("/top-links", methods=["GET"])
def get_top_links():
    limit = request.args.get("limit", 5, type=int)
    top_links = AnalyticsService.get_top_links(limit)
    return jsonify(top_links), 200

@analytics_bp.route("/<int:url_id>", methods=["GET"])
def get_url_analytics(url_id):
    analytics, err, status_code = AnalyticsService.get_url_analytics(url_id)
    if err:
        return jsonify({"error": err}), status_code
    return jsonify(analytics), 200
