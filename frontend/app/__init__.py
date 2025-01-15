from flask import Flask, jsonify, url_for, render_template
from flask_cors import CORS
from flask_qrcode import QRcode
# from flask_session import Session

from config import Config

from app.routes.errors import bp as errors_bp
from app.routes.auth import bp as auth_bp
from app.routes.main import bp as main_bp
from app.routes.admin import bp as admin_bp
from app.routes.dashboard import bp as dashboard_bp
from app.routes.wallet import bp as wallet_bp
# from app.routes.main import bp as main_bp

import json


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    @app.route("/manifest.webmanifest")
    @app.route("/manifest.json")
    def manifest():
        return jsonify({
            "name": "BC Orgbook Publisher Service",
            "short_name": "BC-OPS",
            "scope": f"https://{Config.PUBLISHER_DOMAIN}",
            "credential_handler": {
                "url": "/wallet/handler",
                "enabledTypes": ["VerifiablePresentation"]
            },
            "icons": [
                {
                "src": "static/img/bcgov-logo.png",
                "sizes": "48x48 64x64",
                "type": "image/png"
                }
            ]
        })

    @app.route("/wallet-workers")
    def workers():
        with open(url_for("static", filename="manifest.json")) as f:
            wallet_workers = json.loads(f.read())
        return jsonify(wallet_workers)
    
    @app.route("/install")
    def install():
        return render_template("pages/install.jinja", title="OpSecId")


    CORS(app)
    QRcode(app)
    # Session(app)

    app.register_blueprint(errors_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(dashboard_bp, url_prefix='/dashboard')
    app.register_blueprint(wallet_bp, url_prefix='/wallet')

    return app
