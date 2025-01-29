from flask import Blueprint, render_template, request
from config import Config
import json
import uuid

bp = Blueprint("main", __name__)


@bp.route("/", methods=["GET"])
def index():
    return render_template("pages/main/index.jinja", title=Config.APP_NAME)

@bp.route("/out-of-band/<exchange_id>", methods=["GET"])
def short_oob_url(exchange_id: str):
    try:
        uuid.UUID(exchange_id)
        with open(f'app/static/invitations/{exchange_id}.json', 'r') as f:
            exchange = json.loads(f.read())
        invitation = exchange.get('invitation')
    except:
        return {
            'detail': 'Invitation not found',
            'invitation_id': exchange_id
        }, 404
    
    oob_id = exchange.get('oob_id')
    oob_id_param = request.args.get('_oobid')
    print(oob_id_param)
    if oob_id_param == oob_id:
        return invitation
    short_url = f'https://{Config.DOMAIN}/out-of-band/{exchange_id}?_oobid={oob_id}'
    return render_template(
        'pages/main/exchange.jinja',
        short_url=short_url
    )
