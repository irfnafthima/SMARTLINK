from flask import Blueprint, request, jsonify, current_app
from app.services.url_service import UrlService

urls_bp = Blueprint("urls", __name__, url_prefix="/api/urls")

@urls_bp.route("", methods=["POST"])
def create_url():
    data = request.get_json(silent=True) or {}
    original_url = data.get("url") or data.get("original_url")
    custom_alias = data.get("custom_alias") or data.get("alias")

    if not original_url:
        return jsonify({"error": "Destination URL is required"}), 400

    base_url = current_app.config.get("BASE_URL", request.host_url.rstrip("/"))
    url_obj, err_msg, status_code = UrlService.create_url(
        original_url=original_url,
        custom_alias=custom_alias,
        base_url=base_url
    )

    if err_msg:
        return jsonify({"error": err_msg}), status_code

    return jsonify(url_obj.to_dict()), 201


@urls_bp.route("", methods=["GET"])
def get_all_urls():
    search_query = request.args.get("q") or request.args.get("search")
    urls = UrlService.get_all_urls(search_query)
    return jsonify([u.to_dict() for u in urls]), 200


@urls_bp.route("/<int:url_id>", methods=["GET"])
def get_url(url_id):
    url_obj = UrlService.get_url_by_id(url_id)
    if not url_obj:
        return jsonify({"error": "URL not found"}), 404
    return jsonify(url_obj.to_dict()), 200


@urls_bp.route("/<int:url_id>", methods=["PUT"])
def update_url(url_id):
    data = request.get_json(silent=True) or {}
    new_original_url = data.get("url") or data.get("original_url")
    new_short_code = data.get("short_code") or data.get("custom_alias") or data.get("alias")

    if not new_original_url and not new_short_code:
        return jsonify({"error": "At least one field (url or short_code) must be provided"}), 400

    base_url = current_app.config.get("BASE_URL", request.host_url.rstrip("/"))
    url_obj, msg, status_code = UrlService.update_url(
        url_id=url_id,
        new_original_url=new_original_url,
        new_short_code=new_short_code,
        base_url=base_url
    )
    if msg:
        return jsonify({"error": msg}), status_code
    return jsonify(url_obj.to_dict()), 200


@urls_bp.route("/<int:url_id>", methods=["DELETE"])
def delete_url(url_id):
    success, msg, status_code = UrlService.delete_url(url_id)
    if not success:
        return jsonify({"error": msg}), status_code
    return jsonify({"message": msg}), 200


@urls_bp.route("/<int:url_id>/regenerate", methods=["POST"])
def regenerate_url(url_id):
    base_url = current_app.config.get("BASE_URL", request.host_url.rstrip("/"))
    url_obj, msg, status_code = UrlService.regenerate_code(url_id, base_url)
    if msg:
        return jsonify({"error": msg}), status_code
    return jsonify(url_obj.to_dict()), 200
