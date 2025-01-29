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
    AdminLoginForm, 
    RegisterIssuerForm, 
    OfferAuthCredentialForm
)

import time
import json

bp = Blueprint("admin", __name__)


# @bp.before_request
# def before_request_callback():
#     if not session.get('tenant_id'):
#         return redirect(url_for("admin.logout"))


def get_issuers():
    publisher = PublisherController()
    issuers = publisher.get_issuers()
    issuers += [{
        'id': 'did:web:example.com:mines-act:chief-permitting-officer',
        'name': 'Chief Permitting Officer'
    },{
        'id': 'did:web:example.com:petroleum-and-natural-gas-act:director-of-petroleum-lands',
        'name': 'Director of Petroleum Lands'
    }]
    
    registry = publisher.get_registry()
    registry += [{
        'id': 'did:web:example.com:mines-act:chief-permitting-officer',
        'name': 'Chief Permitting Officer'
    }]

    for issuer in issuers:
        issuer['active'] = True if issuer['id'] in [
            entry['id'] for entry in registry
        ] else False

    return issuers



@bp.route("/", methods=["GET", "POST"])
def index():
    if not session.get('tenant_id'):
        return redirect(url_for("admin.logout"))

    issuers = get_issuers()
    
    form_issuer_registration = RegisterIssuerForm()
    form_credential_offer = OfferAuthCredentialForm()
    form_credential_offer.issuer.choices = [("", "")] + [
        (issuer['id'], issuer['name']) for issuer in issuers if issuer['active']
    ]
    if form_issuer_registration.validate() and request.method == "POST":
        publisher = PublisherController()
        issuer_registration = publisher.register_issuer(
            request.form.get('scope'),
            request.form.get('name'),
        )
        return redirect(url_for('admin.index'))
    elif form_credential_offer.validate() and request.method == "POST":
        
        email = request.form.get('email')
        
        if email.split('@')[-1] != Config.RESTRICTED_EMAIL:
            pass
        
        
        traction = TractionController()
        traction.set_headers(session['access_token'])
        
        # TODO, timestamp in future
        cred_offer = traction.offer_credential(
            email,
            Config.AUTH_CRED_DEF_ID,
            {
                'id': request.form.get('issuer'),
                'role': 'issuer',
                'email': email,
                'target': Config.PUBLISHER_API_URL,
                'expiration': str(time.time()),
            }
        )
        oob_id = cred_offer.get('oob_id')
        invitation = cred_offer.get('invitation')
        with open(f'app/static/invitations/{oob_id}.json', 'w+') as f:
            f.write(json.dumps(invitation, indent=2))
        session['short_url'] = f'https://{Config.DOMAIN}/out-of-band/{oob_id}'
        return redirect(url_for('admin.index'))

    return render_template(
        'pages/admin/index.jinja',
        issuers=issuers,
        form_issuer_registration=form_issuer_registration,
        form_credential_offer=form_credential_offer
    )


@bp.route("/logout", methods=["GET"])
def logout():
    session.clear()
    session['tenant_id'] = None
    return redirect(url_for('admin.login'))


@bp.route("/login", methods=["GET", "POST"])
def login():
    form_login = AdminLoginForm()
    if form_login.validate() and request.method == "POST":
        traction = TractionController()
        session['access_token'] = traction.admin_login(
            request.form.get("tenant_id"),
            request.form.get("api_key"),
        )
        session['tenant_id'] = request.form.get("tenant_id")
        return redirect(url_for('admin.index'))
        
    return render_template(
        'pages/admin/login.jinja',
        form_login=form_login
    )