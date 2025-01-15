from flask import (
    Blueprint,
    render_template,
    url_for,
    session,
    redirect,
    jsonify,
    request,
)
from config import Config
from app.plugins.orgook import OrgbookPublisher

bp = Blueprint("admin", __name__)


@bp.before_request
def before_request_callback():
    session["endpoint"] = Config.PUBLISHER_ENDPOINT
    if "client_id" not in session:
        pass
        # return redirect(url_for("auth.logout"))


@bp.route("/", methods=["GET"])
def index():
    orgbook = OrgbookPublisher()
    issuers = orgbook.get_issuers()
    print(issuers)
    return render_template(
        'pages/admin/index.jinja',
        issuers=issuers
    )