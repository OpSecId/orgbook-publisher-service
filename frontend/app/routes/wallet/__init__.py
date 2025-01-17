from flask import Blueprint, render_template, url_for, current_app, session, redirect, jsonify, request
import asyncio
import json
import uuid
# from app.services import AskarStorage, WorkflowManager, AgentController
# from app.services.vc_playground import CredentialHandler
# from app.utils import return_list_if_object
from config import Config

bp = Blueprint("wallet", __name__)


@bp.before_request
def before_request_callback():
    session['endpoint'] = Config.PUBLISHER_ENDPOINT
    # if "chapi" not in session:
    #     session['chapi'] = {
    #         'auth': WorkflowManager().create_did_auth()
    #     }
    #     exchange_id = session['chapi']['auth'].split('/')[-1]
    #     current_app.logger.warning(f"Created DID Auth: {exchange_id}")
    # else:
    #     exchange_id = session['chapi']['auth'].split('/')[-1]
    #     current_app.logger.warning(f"Current DID Auth: {exchange_id}")


@bp.route("/invitation/<exchange_id>", methods=["GET"])
def fetch_invitation(exchange_id: str):
    # try:
    with open(f'app/static/invitations/{exchange_id}.json', 'r') as f:
        invitation = json.loads(f.read())
    # print(invitation)
    return invitation['invitation']
    # invitation_payload = invitation['invitation_url'].split('?')[-1]
    # redirect_url = f'https://didcomm.link/?{invitation_payload}'
    # return redirect(redirect_url)
    # except:
    #     return 404

@bp.route("/handler", methods=["GET"])
def wallet_handler():
    current_app.logger.warning("CHAPI handler()")
    # current_app.logger.warning(session['chapi'].get('client_id'))
    return render_template(
        # "pages/wallet/handler.jinja",
        "components/chapi/handler.jinja",
        title=current_app.config['APP_NAME'],
        page_title='Wallet'
    )


# @bp.route("/login", methods=["POST"])
# def login():
#     current_app.logger.warning("CHAPI login()")
#     exchange_id = session['chapi']['auth'].split('/')[-1]
#     current_app.logger.warning(f"Checking DID Auth: {exchange_id}")
#     storage = AskarStorage()
#     exchange_state = asyncio.run(
#         storage.fetch('workflow/authentication', exchange_id)
#     )
#     session['chapi']['did'] = exchange_state.get('holder')
#     session['did'] = exchange_state.get('holder')
#     current_app.logger.warning(session['chapi']['did'])
#     session['chapi']['client_id'] = asyncio.run(
#         storage.fetch_name_by_tag('wallet', {
#             "dids": session['chapi']['did']
#         })
#     )
#     session['client_id'] = session['chapi']['client_id']
#     if session['chapi'].get('client_id'):
#         current_app.logger.warning(session['chapi'].get('client_id'))
#         return jsonify({'client_id': session['chapi'].get('client_id')})
#     return "Login failed", 400


# @bp.route("/logout", methods=["POST"])
# def logout():
#     current_app.logger.warning("CHAPI logout()")
#     session.clear()
#     return "Logged out", 200


# @bp.route("/get", methods=["GET", "POST"])
# def get():
#     current_app.logger.warning("CHAPI get()")
#     if request.method == "POST":
#         current_app.logger.warning("POST")
#         current_app.logger.warning(request.form['client_id'])
#         current_app.logger.warning(session['chapi'].get('client_id'))
#         if request.form['client_id'] != session['chapi'].get('client_id'):
#             current_app.logger.warning('Wrong Client Id')
#             return jsonify({'status': 'failed'})
#         handler = CredentialHandler()
#         query = json.loads(request.form['payload'])
#         vp = asyncio.run(handler.query_response(query))
#         return jsonify(vp)
#     return render_template(
#         # "pages/wallet/get.jinja",
#         "components/chapi/get.jinja",
#         title=current_app.config['APP_NAME'],
#         page_title='Wallet'
#     )


# @bp.route("/store", methods=["GET", "POST"])
# def store():
#     current_app.logger.warning("CHAPI store()")
#     if request.method == "POST":
#         current_app.logger.warning("POST")
#         current_app.logger.warning(request.form['client_id'])
#         current_app.logger.warning(session['chapi'].get('client_id'))
#         if request.form['client_id'] != session['chapi'].get('client_id'):
#             current_app.logger.warning('Wrong Client Id')
#             return jsonify({'status': 'failed'})
#         client_id = session['chapi'].get('client_id')
#         vp = json.loads(request.form['payload'])
#         vp['verifiableCredential'] = return_list_if_object(vp['verifiableCredential'])
#         current_app.logger.warning("Storing a credential")
#         for vc in vp['verifiableCredential']:
#             # session['credentials'].append(vc)
#             agent = AgentController()
#             asyncio.run(agent.request_token(client_id))
#             asyncio.run(agent.store_vc(vc))
#             # stored_vc = asyncio.run(agent.get_vc())
#             # storage = AskarStorage()
#             # asyncio.run(storage.append('credentials', client_id, vc))
#     current_app.logger.warning("GET")
#     return render_template(
#         # "pages/wallet/store.jinja",
#         "components/chapi/store.jinja",
#         title=current_app.config['APP_NAME'],
#         page_title='Wallet'
#     )


# @bp.route("/credentials", methods=["POST"])
# def credentials():
#     current_app.logger.warning("CHAPI credentials()")
#     current_app.logger.warning(request.form['payload'])
#     if request.form['client_id'] != session['chapi'].get('client_id'):
#         current_app.logger.warning('Wrong Client Id')
#         return jsonify({'status': 'failed'})
#     client_id = session['chapi'].get('client_id')
#     storage = AskarStorage()
#     credential_choices = {}
#     credentials = asyncio.run(storage.fetch('credentials', client_id))
#     for credential in credentials:
#         credential_id = credential.get('id') or str(uuid.uuid4())
#         credential_choices[credential_id] = credential
    
#     current_app.logger.warning('Credentials count: ' + str(len(credentials)))
#     return jsonify(credential_choices)


# @bp.route("/contacts", methods=["GET"])
# def contacts():
#     return render_template(
#         "pages/contacts.jinja",
#         title=current_app.config['APP_NAME'],
#         page_title='Contacts'
#     )