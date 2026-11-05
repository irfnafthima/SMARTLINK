import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from app.config import config_by_name
from app.models import db

migrate = Migrate()

def create_app(config_name=None):
    if not config_name:
        config_name = os.getenv("FLASK_ENV", "production")

    app = Flask(__name__)
    config_obj = config_by_name.get(config_name, config_by_name["production"])
    app.config.from_object(config_obj)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app, resources={r"/api/*": {"origins": "*"}, r"/s/*": {"origins": "*"}}, supports_credentials=True)

    # Register blueprints
    from app.routes.urls import urls_bp
    from app.routes.redirect import redirect_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.analytics import analytics_bp
    from app.routes.health import health_bp

    app.register_blueprint(urls_bp)
    app.register_blueprint(redirect_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(health_bp)

    # Error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"error": "Bad request", "detail": str(error)}), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({"error": "Method not allowed"}), 405

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({"error": "Internal server error"}), 500

    with app.app_context():
        try:
            db.create_all()
        except Exception as e:
            app.logger.warning(f"Database tables could not be created at startup: {e}")

    return app
