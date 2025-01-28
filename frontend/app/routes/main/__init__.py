from flask import (
    Blueprint,
    render_template,
    url_for,
    current_app,
    session,
    redirect,
    jsonify,
    request,
)
import asyncio
from app.plugins.traction import TractionController
from config import Config
import requests
import json
import uuid

bp = Blueprint("main", __name__)


@bp.before_request
def before_request_callback():
    session["endpoint"] = Config.PUBLISHER_ENDPOINT
    if "client_id" not in session:
        pass
        # return redirect(url_for("auth.logout"))


@bp.route("/", methods=["GET"])
def index():
    return render_template("pages/main/index.jinja", title=Config.APP_NAME)


@bp.route("/dia-issuance/dbc", methods=["GET", "POST"])
def dia_issuance_dbc():
    page_title = "BC Verified"
    traction = TractionController()
    if request.method == "GET":
        pres_req = traction.create_pres_req()
        session['pres_ex_id'] = pres_ex_id = pres_req.get('pres_ex_id')
        invitation = traction.create_oob_inv(
            attachement={
                "id": pres_ex_id,
                "type": "present-proof"
            },
            handshake=False
        )
        invitation_payload = invitation['invitation_url'].split('?')[-1]
        invitation_url = f'https://didcomm.link/?{invitation_payload}'
        with open(f'app/static/invitations/{pres_ex_id}.json', 'w') as f:
            f.write(json.dumps(invitation, indent=2))
        invitation_short_url = Config.PUBLISHER_ENDPOINT + url_for('wallet.fetch_invitation', exchange_id=pres_ex_id)

    if request.method == "POST":
        pres_ex = traction.check_pres_ex(session['pres_ex_id'])
        current_app.logger.debug(pres_ex)
        current_app.logger.debug(pres_ex.get('verified'))
        if pres_ex.get('verified'):
            values = pres_ex['by_format']['pres']['indy']['requested_proof']['revealed_attr_groups']['registrationId']['values']
            session["entityId"] = values['entityId']['raw']
            session["registrationId"] = values['registrationId']['raw']
            current_app.logger.debug(session["registrationId"])
        
        return redirect(url_for("main.dia_issuance_info"))
    return render_template(
        "pages/dia_issuance/present_dbc.jinja",
        title=page_title,
        oob_invitation_url=invitation_url,
        oob_invitation_short_url=invitation_short_url,
    )


@bp.route("/dia-issuance/info", methods=["GET"])
def dia_issuance_info():
    page_title = "BC Verified"
    r = requests.get(
        f"{Config.ORGBOOK_ENDPOINT}/api/v4/search/topic?q={session['registrationId']}&inactive=false&revoked=false"
    )
    entity = r.json()["results"][0]
    issuer = {
        "id": "did:web:uncefact.github.io:project-vckit:test-and-development",
        "name": "BC Corporate Registry",
    }
    credential_id = str(uuid.uuid4())
    session['dia'] = {
        "@context": [
            "https://www.w3.org/ns/credentials/v2",
            "https://test.uncefact.org/vocabulary/untp/dia/0.2.1/",
        ],
        "type": ["DigitalIdentityAnchor", "VerifiableCredential"],
        "id": f"urn:uuid:{credential_id}",
        "issuer": issuer,
        "credentialSubject": {
            "type": ["RegisteredIdentity", "Identifier"],
            "name": entity["names"][0]["text"],
            "registerType": "Business",
            "registeredId": entity["source_id"],
            "idScheme": {
                "type": ["IdentifierScheme"],
                "id": "https://www.bcregistry.gov.bc.ca/",
                "name": "BC Registries and Online Services",
            },
        },
    }
    return render_template(
        "pages/dia_issuance/business_info.jinja",
        title=page_title,
        credential=session['dia'],
    )


@bp.route("/dia-issuance/did-auth", methods=["GET", "POST"])
def dia_issuance_did_auth():
    page_title = "BC Verified"
    exchange_url = ''
    if request.method == "POST":
        return redirect(url_for("main.dia_issuance_dia_credential"))
    return render_template(
        "pages/dia_issuance/did_auth.jinja",
        title=page_title,
        exchange_url=exchange_url,
    )


@bp.route("/dia-issuance/dia-credential", methods=["GET"])
def dia_issuance_dia_credential():
    page_title = "BC Verified"
    return render_template(
        "pages/dia_issuance/dia_credential.jinja",
        title=page_title,
        credential=session['dia'],
    )
