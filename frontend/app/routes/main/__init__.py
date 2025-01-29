from flask import Blueprint, render_template
from config import Config
import json
import uuid

bp = Blueprint("main", __name__)


@bp.route("/", methods=["GET"])
def index():
    return render_template("pages/main/index.jinja", title=Config.APP_NAME)

@bp.route("/out-of-band/<oobid>", methods=["GET"])
def short_oob_url(oobid: str):
    try:
        uuid.UUID(oobid)
        with open(f'app/static/invitations/{oobid}.json', 'r') as f:
            invitation = json.loads(f.read())
        return invitation
    except:
        return {
            'detail': 'Invitation not found',
            'invitation_id': oobid
        }, 404
