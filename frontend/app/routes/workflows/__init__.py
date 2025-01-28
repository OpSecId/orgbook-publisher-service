from flask import Blueprint, current_app, request, session, url_for, render_template, redirect
from app.plugins.traction import TractionController
from config import Config
import requests
import json
import uuid

bp = Blueprint("workflows", __name__)


@bp.route("/workflows/dia-issuance", methods=["GET", "POST"])
def dbc_proof_exchange():
    page_title = "BC Verified"
    traction = TractionController()
    if session.get('registrationId') and request.method == "GET":
        r = requests.get(
            f"{Config.ORGBOOK_ENDPOINT}/api/v4/search/topic?q={session['registrationId']}&inactive=false&revoked=false"
        )
        entity = r.json()["results"][0]
        entity = {
            'id': f'{Config.ORGBOOK_ENDPOINT}',
            'name': entity["names"][0]["text"],
            'registeredId': entity["source_id"]
        }
        issuer = "did:web:registry.digitaltrust.gov.bc.ca:business-corporations-act:registrar-of-companies"
        credential_id = str(uuid.uuid4())
        session['dia'] = {
            "@context": [
                "https://www.w3.org/ns/credentials/v2",
                "https://test.uncefact.org/vocabulary/untp/dia/0.2.1/",
            ],
            "type": ["DigitalIdentityAnchor", "VerifiableCredential"],
            "id": f"urn:uuid:{credential_id}",
            "issuer": {
                "id": issuer,
                "name": "BC Corporate Registry",
            },
            "credentialSubject": {
                "type": ["RegisteredIdentity", "Identifier"],
                "name": entity["name"],
                "registerType": "Business",
                "registeredId": entity["registeredId"],
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
        
        
    elif request.method == "GET":
        pres_req = traction.create_pres_req(
            name='Orgbook Registration Proof Request',
            issuer='Mo2T76ZKcQvdYNPdgGbMFi',
            schema_id='Mo2T76ZKcQvdYNPdgGbMFi:2:Orgbook Registration Record:0.1',
            attributes=['registrationId', 'entityId']
        )
        session['pres_ex_id'] = pres_ex_id = pres_req.get('pres_ex_id')
        invitation = traction.create_oob_inv(
            client_id=session['client_id'],
            pres_ex_id=pres_ex_id
        )
        # invitation_payload = invitation['invitation_url'].split('?')[-1]
        exchange_url = f'{Config.PUBLISHER_ENDPOINT}/workflows/dia-issuance/exchanges/{pres_ex_id}'
        with open(f'app/static/workflows/{pres_ex_id}.json', 'w') as f:
            f.write(json.dumps(invitation, indent=2))

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
        "pages/workflows/dia_issuance/present_dbc.jinja",
        title=page_title,
        exchange_url=exchange_url
    )


@bp.route("/workflows/did-auth", methods=["GET", "POST"])
def did_auth_exchange():
    page_title = "BC Verified"
    traction = TractionController()
    if request.method == "GET":
        pres_req = traction.create_pres_req(
            name='Orgbook Registration Proof Request',
            issuer='Mo2T76ZKcQvdYNPdgGbMFi',
            schema_id='Mo2T76ZKcQvdYNPdgGbMFi:2:Orgbook Registration Record:0.1',
            attributes=['registrationId', 'entityId']
        )
        pres_ex_id = pres_req.get('pres_ex_id')
        invitation = traction.create_oob_inv(
            client_id=session['client_id'],
            pres_ex_id=pres_ex_id
        )
        # invitation_payload = invitation['invitation_url'].split('?')[-1]
        exchange_url = f'{Config.PUBLISHER_ENDPOINT}/workflows/dia-issuance/exchanges/{pres_ex_id}'
        with open(f'app/static/workflows/{pres_ex_id}.json', 'w') as f:
            f.write(json.dumps(invitation, indent=2))

    return render_template(
        "pages/workflows/dia_issuance/present_dbc.jinja",
        title=page_title,
        exchange_url=exchange_url
    )


@bp.route("/workflows/<workflow_id>/exchanges/<exchange_id>", methods=["POST"])
def workflow_exchange(workflow_id: str, exchange_id: str):
    with open(f'app/static/workflows/{exchange_id}.json', 'r') as f:
        exchange = json.loads(f.write())


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


@bp.route("/handler", methods=["GET"])
def wallet_handler():
    current_app.logger.warning("CHAPI handler()")
    # current_app.logger.warning(session['chapi'].get('client_id'))