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
        
    def create_pres_req(self):
        endpoint = f'{self.endpoint}/present-proof-2.0/create-request'
        pres_req = {
            'auto_remove': False,
            'auto_verify': True,
            'presentation_request': {
                'indy': {
                    'name': 'Orgbook registration ID proof request',
                    'version': '1.0',
                    'nonce': str(randint(1, 99999999)),
                    'requested_attributes': {
                        'registrationId': {
                            'names': [
                                'registrationId',
                                'entityId'
                            ],
                            'restrictions':[
                                {
                                    'issuer_did': 'Mo2T76ZKcQvdYNPdgGbMFi',
                                    'schema_id': 'Mo2T76ZKcQvdYNPdgGbMFi:2:Orgbook Registration Record:0.1'
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
        
    def create_oob_inv(self, attachement=None, handshake=False):
        endpoint = f'{self.endpoint}/out-of-band/create-invitation?auto_accept=true'
        invitation = {
            "accept": [
                "didcomm/aip1",
                "didcomm/aip2;env=rfc19"
            ],
            # "alias": "Barry",
            # "attachments": [attachement],
            "goal": "To request an Orgbook registration ID.",
            "goal_code": "request-vp",
            # "handshake_protocols": [],
            "my_label": "Orgbook Publisher Service",
            "protocol_version": "1.1"
        }
        if attachement:
            invitation['attachments'] = [attachement]
        if handshake:
            invitation['handshake_protocols'] = ["https://didcomm.org/didexchange/1.0"]
        r = requests.post(
            endpoint,
            headers=self.headers,
            json=invitation
        )
        return r.json()
        
    def check_pres_ex(self, pres_ex_id):
        endpoint = f'{self.endpoint}/present-proof-2.0/records/{pres_ex_id}/verify-presentation'
        r = requests.post(
            endpoint,
            headers=self.headers
        )
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