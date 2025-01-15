from flask import (
    Blueprint,
    current_app,
    render_template,
    session,
    redirect,
    url_for,
    request,
)
import uuid
import asyncio
from config import Config

bp = Blueprint("auth", __name__)


# @bp.route("/login", methods=["GET", "POST"])
# def login():
#     session["endpoint"] = Config.PUBLISHER_ENDPOINT
#     if request.method == "POST":
#         pass
#     return render_template("pages/auth/login.jinja", title=Config.APP_NAME)


# @bp.route("/did-auth", methods=["GET", "POST"])
# def did_auth():
#     session["endpoint"] = Config.PUBLISHER_ENDPOINT
#     oob_invitation_url = (
#         "https://publisher.orgbook.gov.bc.ca/workflows/invitations/exchanges/123"
#     )
#     if request.method == "POST":
#         pass
#     return render_template(
#         "pages/auth/did_auth.jinja",
#         title=Config.APP_NAME,
#         oob_invitation_url=oob_invitation_url,
#     )


@bp.route("/logout", methods=["GET"])
def logout():
    session.clear()
    return redirect(url_for("main.index"))
