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
from app.models.credential_type import CredentialRegistration
from .forms import (
    IssuerLoginForm, 
    RegisterCredentialForm, 
    IssuerCredentialForm
)

import time
import json
import os
from werkzeug.utils import secure_filename

bp = Blueprint("issuer", __name__)

UPLOAD_FOLDER = os.path.join('staticFiles', 'uploads')
ALLOWED_EXTENSIONS = {'csv'}
# @bp.before_request
# def before_request_callback():
#     if not session.get('pres_req'):
#         session['pres_req'] = {}

def sanitize_csv_data_entries(data_entries):
    for entry_idx, entry_data in enumerate(data_entries):
        data_entries[entry_idx] = [item.strip() for item in entry_data.split(',')]
    return data_entries

def update_json_with_pointers(credential, pointers):
    for pointer, value in pointers.items():
        keys = pointer.strip("/").split("/")
        temp = credential
        
        for key in keys[:-1]:  # Navigate through existing or create missing dictionaries
            if key not in temp or not isinstance(temp[key], dict):
                temp[key] = {}  # Ensure key exists and is a dictionary
            temp = temp[key]
        
        # Assign the new value at the final key
        temp[keys[-1]] = value

def get_default_pointers(attributes):
    pointers = {}
    for attribute in attributes:
        pointers[attribute] = f'/credentialSubject/{attribute}'
    return pointers

def get_default_paths(attributes):
    pointers = {}
    for attribute in attributes:
        pointers[attribute] = f'$.credentialSubject.{attribute}'
    return pointers

def create_presentation_request():
    traction = TractionController()
    session['access_token'] = traction.admin_login(
        Config.TRACTION_TENANT_ID,
        Config.TRACTION_API_KEY
    )
    traction.set_headers(session['access_token'])
    pres_ex_id, pres_req_ex = traction.request_presentation(
        name='Authorized Publisher',
        cred_def_id=Config.AUTH_CRED_DEF_ID,
        attributes=['issuer', 'email', 'target']
    )
    oob_id = pres_req_ex.get('oob_id')
    with open(f'app/static/invitations/{pres_ex_id}.json', 'w+') as f:
        f.write(json.dumps(pres_req_ex, indent=2))
    session['pres_ex_url'] = f'https://{Config.DOMAIN}/out-of-band/{pres_ex_id}/{oob_id}'
    session['pres_ex_id'] = pres_ex_id


def get_credential_types():
    credential_types = []
    credential_types += [
        {
            'type': 'MinesActPermit',
            'extendedType': 'DigitalConformityCredential',
            'context': 'https://',
            'version': '1.0',
            'count': 73
        }
    ]
    return credential_types


def get_credentials(credential_type):
    publisher = PublisherController()
    credentials = publisher.get_credentials()
    return credentials



@bp.route("/", methods=["GET", "POST"])
def index():
    if not session.get('issuer_id'):
        return redirect(url_for("issuer.logout"))
    
    session['issuer'] = {
        'id': 'did:web:traceability.site:test:11',
        'name': session['issuer_id']
    }
    
    form_credential_registration = RegisterCredentialForm()
    form_credential_issuance = IssuerCredentialForm()
    
    credential_types = get_credential_types()
    
    form_credential_issuance.credential_type.choices = [("", "")] + [
        (entry['type'], entry['type']) for entry in credential_types
    ]
    if request.method == "POST":
        # if form_credential_registration.validate():
        if form_credential_registration.submit_register.data:
            publisher = PublisherController()
            
            credential_name = form_credential_registration.credential_name.data
            subject_type = ''.join(credential_name.title().split())
            version = '1.0'
            
            csv_file = form_credential_registration.csv_file_register.data
            csv_data = csv_file.read().decode("utf-8").split('\n')
                
            
            header_row = [item.strip() for item in csv_data[0].split(',')]
            document_id = form_credential_registration.source_id.data
            registration_id = form_credential_registration.registration_id.data
            if document_id not in header_row or registration_id not in header_row:
                return redirect(url_for('issuer.index'))
            
            subject_paths = get_default_paths(header_row)
            core_paths = {
                'entityId': subject_paths[registration_id],
                'cardinalityId': subject_paths[document_id]
            }
            registration = publisher.register_credential(
                subject_type,
                version,
                session['issuer']['id'],
                subject_paths,
                core_paths
            )
            print(registration)
            
            return redirect(url_for('issuer.index'))
    
        elif form_credential_issuance.submit_issue.data:
            csv_file = form_credential_issuance.csv_file_issue.data
            csv_data = csv_file.read().decode("utf-8").split('\n')
            
            header_row = [item.strip() for item in csv_data[0].split(',')]
            pointers = get_default_pointers(header_row)
                
            data_entries = sanitize_csv_data_entries(csv_data[1:])
            claims = {}
            for entry_idx, entry_data in enumerate(data_entries):
                credential = {
                    '@context': [
                        'https://www.w3.org/ns/credentials/v2',
                        'https://www.w3.org/ns/credentials/examples/v2'
                    ],
                    'type': ['VerifiableCredential'],
                    'issuer': session['issuer']
                }
                for attribute_idx, attribute in enumerate(data_entries[entry_idx]):
                    claims[pointers[header_row[attribute_idx]]] = attribute
                    
                update_json_with_pointers(credential, claims)
                
                
            return redirect(url_for('issuer.index'))

    return render_template(
        'pages/issuer/index.jinja',
        credential_types=credential_types,
        form_credential_registration=form_credential_registration,
        form_credential_issuance=form_credential_issuance
    )



@bp.route("/credential-types/<credential_type>", methods=["GET", "POST"])
def manage_credential_type(credential_type: str):
    if not session.get('issuer_id'):
        return redirect(url_for("issuer.logout"))
    
    credential_types = get_credential_types()
    if credential_type not in [credential_type.get('type') for credential_type in credential_types]:
        return redirect(url_for('issuer.index'))
    credentials = [
        {
            "validFrom": "",
            "validUntil": "",
            "credentialSubject": {
                "permitNo": "",
                "issuedToParty": {
                    "registeredId"
                }
            },
            "credentialStatus": [
                {
                    "statusPurpose": "revocation"
                },
                {
                    "statusPurpose": "suspension"
                },
                {
                    "statusPurpose": "refresh"
                },
            ],
        }
    ]
    attribute_paths = {
    }
    credential_records = [{
        'sourceId': 'C-112',
        'registeredId': 'A0493A',
        'validFrom': '2024-01-01T00:00:00Z',
        'validUntil': '2024-01-02T00:00:00Z',
        'latest': True,
        'revoked': False,
        'suspended': False,
    }]
    

    return render_template(
        'pages/issuer/credentials.jinja',
        credential_type=credential_type,
        credentials=credential_records
    )


@bp.route("/logout", methods=["GET"])
def logout():
    session.clear()
    session['issuer_id'] = None
    return redirect(url_for('main.index'))


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
            values = verification['by_format']['pres']['indy']['requested_proof']['revealed_attr_groups']['requestedAttributes']['values']
            if values['target']['raw'] == Config.PUBLISHER_API_URL:
                session['issuer_id'] = values['issuer']['raw']
                session['email'] = values['email']['raw']
                return redirect(url_for('issuer.index'))

        return redirect(url_for('issuer.logout'))
        
    return render_template(
        'pages/issuer/login.jinja',
        form_login=form_login
    )