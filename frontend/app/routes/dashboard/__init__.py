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
from .forms import lob_query

bp = Blueprint("dashboard", __name__)


@bp.before_request
def before_request_callback():
    session["endpoint"] = Config.PUBLISHER_ENDPOINT
    if "client_id" not in session:
        pass
        # return redirect(url_for("auth.logout"))


@bp.route("/", methods=["GET"])
def index():
    
    return render_template(
        'pages/dashboard/index.jinja',
        lob_query=lob_query
    )


@bp.route("/credentials", methods=["GET"])
def credentials_management():
    issuer = {
        'name': 'Chief Permitting Officer',
        'namespace': 'mines-act',
        'identifier': 'chief-permitting-officer'
    }
    oca_bundle = {
        'paths': {
            'name': ''
        }
    }
    credentials = [
        {
            'id': '',
            'name': 'Mines Act Permit',
            'type': 'BCMinesActPermitCredential',
            'additionalType': 'DigitalConformityCredential',
            'scope': {
                'type': 'GovernanceDocument',
                'id': 'https://bcgov.github.io/digital-trust-toolkit/docs/governance/mining/bc-mines-act-permit/governance-json-ld',
                'name': 'BC Mines Act Permit'
            },
            'regulation': {
                'type': 'LegalAct',
                'id': 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/96293_01',
                'name': 'Mines Act'
            },
            'authority': {
                'type': 'Regulator',
                'id': 'https://dir.gov.bc.ca/gtds.cgi?searchString=Chief+Inspector+of+Mines',
                'name': 'Chief Inspector of Mines',
                'authorizedParty': {
                    'type': 'DelegatedParty',
                    'id': 'https://dir.gov.bc.ca/gtds.cgi?searchString=Chief+Permitting+Officer',
                    'name': 'Chief Permitting Officer'
                }
            },
            'records': [
                {
                    'permitNumber': 'C-129',
                    'evidence': [
                        {
                            'type': 'Permit',
                            'id': r'https://nrs.objectstore.gov.bc.ca/lteczn/66cef532c33ff70022455666/1200003-2020-01%20Permit%2020240823.pdf',
                            'name': 'Latest Permit Amendment'
                        }
                    ],
                    'issuedToParty': {
                        'type': 'MineOperator',
                        'id': 'https://dev.orgbook.gov.bc.ca/entity/A0061056/type/registration.registries.ca',
                        'name': 'TECK COAL LIMITED',
                    },
                    'facility': {
                        'type': 'MiningSite',
                        'id': 'https://mines.nrs.gov.bc.ca/mine/5f17e48e44fa55001bf96686/overview',
                        'name': 'Line Creek Mine',
                        'plusCode': 'https://plus.codes/85X7X5XR+FP'
                    },
                    'products': [{
                        'type': 'Commodity',
                        'id': 'https://www.hs-codes.com/?a=27011200',
                        'name': 'Coal'
                    }]
                }
            ]
        }
    ]
    sample = credentials[0] | credentials[0]['records'][0]
    # credentials = [credential | credential['records'] for credential in credentials]
    
    return render_template(
        'pages/dashboard/credential.jinja',
        credentials=credentials,
        credential=sample,
    )












