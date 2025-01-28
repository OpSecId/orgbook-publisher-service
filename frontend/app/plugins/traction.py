from flask import current_app
from config import Config
import requests
import secrets
from random import randint


class TractionControllerError(Exception):
    """Generic TractionController Error."""


class TractionController:
    def __init__(self):
        self.endpoint = Config.TRACTION_API_URL
        self.tenant_id = Config.TRACTION_TENANT_ID
        self.api_key = Config.TRACTION_API_KEY
        r = requests.post(
            f'{self.endpoint}/multitenancy/tenant/{self.tenant_id}/token',
            json={
                'api_key': self.api_key
            }
        )
        access_token = r.json()['token']
        self.headers = {
            'Authorization': f'Bearer {access_token}'
        }
        
    def create_pres_req(self, name, issuer, schema_id, attributes):
        endpoint = f'{self.endpoint}/present-proof-2.0/create-request'
        pres_req = {
            'auto_remove': False,
            'auto_verify': True,
            'presentation_request': {
                'indy': {
                    'name': name,
                    'version': '1.0',
                    'nonce': str(randint(1, 99999999)),
                    'requested_attributes': {
                        'requestedAttributes': {
                            'names': attributes,
                            'restrictions':[
                                {
                                    'issuer_did': issuer,
                                    'schema_id': schema_id
                                }
                            ]
                        }
                    },
                    'requested_predicates': {}
                }
            }
        }
        r = requests.post(
            endpoint,
            headers=self.headers,
            json=pres_req
        )
        return r.json()
        
    def create_oob_inv(self, client_id, cred_ex_id=None, pres_ex_id=None, handshake=False):
        endpoint = f'{self.endpoint}/out-of-band/create-invitation?auto_accept=true'
        invitation = {
            # "accept": [
            #     "didcomm/aip1",
            #     "didcomm/aip2;env=rfc19"
            # ],
            "my_label": "Orgbook Publisher Service",
            "alias": client_id,
            "attachments": [],
            # "goal": "To request an Orgbook registration ID.",
            # "goal_code": "request-vp",
            "handshake_protocols": [],
            "protocol_version": "1.1"
        }
        if pres_ex_id:
            invitation['attachments'].append({
                "id":   pres_ex_id,
                "type": "present-proof"
            })
        if handshake:
            invitation['handshake_protocols'].append(
                "https://didcomm.org/didexchange/1.0"
            )
        r = requests.post(
            endpoint,
            headers=self.headers,
            json=invitation
        )
        return r.json()
        
    def check_pres_ex(self, pres_ex_id):
        endpoint = f'{self.endpoint}/present-proof-2.0/records/{pres_ex_id}'
        r = requests.get(
            endpoint,
            headers=self.headers
        )
        current_app.logger.debug(r.text)
        return r.json()
        
    def remove_pres_req(self, pres_ex_id):
        endpoint = f'{self.endpoint}/present-proof-2.0/records/{pres_ex_id}'
        requests.delete(
            endpoint,
            headers=self.headers
        )

    def remove_oob_inv(self, oob_inv_id):
        endpoint = f'{self.endpoint}/out-of-band/invitations/{oob_inv_id}'
        requests.delete(
            endpoint,
            headers=self.headers
        )