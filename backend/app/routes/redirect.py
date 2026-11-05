from flask import Blueprint, redirect, request, jsonify, render_template_string
from app.services.url_service import UrlService

redirect_bp = Blueprint("redirect", __name__)

NOT_FOUND_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - SmartLink Not Found</title>
    <style>
        body {
            background-color: #121210;
            color: #f4efe5;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
        }
        .card {
            background: #191917;
            border: 1px solid #38352f;
            border-radius: 12px;
            padding: 40px;
            max-width: 480px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        h1 {
            color: #c6a66b;
            font-size: 2.2rem;
            margin-top: 0;
            margin-bottom: 12px;
        }
        p {
            color: #b7ad9d;
            line-height: 1.6;
            margin-bottom: 24px;
        }
        .code {
            font-family: monospace;
            background: #151513;
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid #38352f;
            color: #c6a66b;
        }
        a {
            display: inline-block;
            background: #c6a66b;
            color: #171611;
            padding: 10px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            transition: transform 0.2s;
        }
        a:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>Link Not Found</h1>
        <p>The short link <span class="code">{{ short_code }}</span> does not exist or has expired.</p>
        <a href="/">Return to SmartLink</a>
    </div>
</body>
</html>
"""

@redirect_bp.route("/s/<short_code>", methods=["GET"])
def redirect_to_url(short_code):
    url_obj = UrlService.get_url_by_code(short_code)
    if not url_obj:
        if request.accept_mimetypes.accept_json and not request.accept_mimetypes.accept_html:
            return jsonify({"error": "Short link not found"}), 404
        return render_template_string(NOT_FOUND_HTML, short_code=short_code), 404

    # Extract client metadata
    referrer = request.referrer or request.headers.get("Referer")
    user_agent = request.user_agent.string if request.user_agent else request.headers.get("User-Agent")

    # Record click event & increment count
    UrlService.record_click(url_obj, referrer=referrer, user_agent=user_agent)

    # Perform redirect to original destination
    return redirect(url_obj.original_url, code=302)
