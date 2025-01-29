from flask import Flask
from flask_cors import CORS
from flask_qrcode import QRcode
from flask_session import Session
# from flask_bootstrap import Bootstrap
# from flask_colorpicker import colorpicker

from config import Config
import logging

from app.routes.errors import bp as errors_bp
from app.routes.main import bp as main_bp
from app.routes.admin import bp as admin_bp
from app.routes.issuer import bp as issuer_bp


def create_app(config_class=Config):
    logging.basicConfig(level=logging.DEBUG)
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(app)
    QRcode(app)
    # Session(app)
    # Bootstrap(app)
    # colorpicker(app)

    app.register_blueprint(errors_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(issuer_bp, url_prefix='/issuer')

    return app
