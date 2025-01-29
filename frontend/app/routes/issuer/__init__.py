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
from app.plugins.publisher import PublisherController
from app.plugins.traction import TractionController
from .forms import (
    IssuerLoginForm, 
    RegisterCredentialForm, 
    IssuerCredentialForm
)

import time
import json

bp = Blueprint("issuer", __name__)


# @bp.before_request
# def before_request_callback():
#     if not session.get('pres_req'):
#         session['pres_req'] = {}


def create_presentation_request():
    traction = TractionController()
    session['access_token'] = traction.admin_login(
        Config.TRACTION_TENANT_ID,
        Config.TRACTION_API_KEY
    )
    traction.set_headers(session['access_token'])
    pres_ex_id, pres_req_ex = traction.request_presentation(
        name='Authorized Publisher',
        issuer=Config.AUTH_CRED_DEF_ID.split(':')[0],
        schema_id=Config.AUTH_SCHEMA_ID,
        attributes=['id', 'email', 'target']
    )
    oob_id = pres_req_ex.get('oob_id')
    invitation = pres_req_ex.get('invitation')
    with open(f'app/static/invitations/{oob_id}.json', 'w+') as f:
        f.write(json.dumps(invitation, indent=2))
    session['pres_ex_url'] = f'https://{Config.DOMAIN}/out-of-band/{oob_id}'
    session['pres_ex_id'] = pres_ex_id


def get_credentials():
    publisher = PublisherController()
    credentials = publisher.get_credentials()
    return credentials



@bp.route("/", methods=["GET", "POST"])
def index():
    if not session.get('issuer_id'):
        return redirect(url_for("issuer.logout"))
    
    credential_types = []
    
    form_credential_registration = RegisterCredentialForm()
    form_credential_issuance = IssuerCredentialForm()
    form_credential_issuance.credential_type.choices = [("", "")] + [
        (entry['type'], entry['type']) for entry in credential_types
    ]
    if form_credential_registration.validate() and request.method == "POST":
        publisher = PublisherController()
        return redirect(url_for('issuer.index'))
    
    elif form_credential_issuance.validate() and request.method == "POST":
        
        traction = TractionController()
        traction.set_headers(session['access_token'])
        return redirect(url_for('issuer.index'))

    return render_template(
        'pages/issuer/index.jinja',
        credential_types=credential_types,
        form_credential_registration=form_credential_registration,
        form_credential_issuance=form_credential_issuance
    )


@bp.route("/logout", methods=["GET"])
def logout():
    session.clear()
    session['issuer_id'] = None
    return redirect(url_for('issuer.login'))


@bp.route("/login", methods=["GET", "POST"])
def login():
    form_login = IssuerLoginForm()
    if request.method == "GET" and not session.get('pres_req_url'):
        create_presentation_request()
        
    if request.method == "POST" and form_login.validate():
        traction = TractionController()
        traction.set_headers(session['access_token'])
        verification = traction.verify_presentation(session['pres_ex_id'])
        if verification.get('verified'):
            session['issuer_id'] = ''
        return redirect(url_for('issuer.index'))
        
    return render_template(
        'pages/issuer/login.jinja',
        form_login=form_login
    )