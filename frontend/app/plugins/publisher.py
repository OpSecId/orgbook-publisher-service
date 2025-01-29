from flask import current_app
from config import Config
import requests
import secrets
from random import randint


class PublisherControllerError(Exception):
    """Generic PublisherController Error."""


class PublisherController:
    def __init__(self):
        self.endpoint = Config.PUBLISHER_API_URL
        self.api_key = Config.PUBLISHER_API_KEY
        self.headers = None
        
    def admin_login(self):
        self.headers = {
            {'X-API-KEY': self.api_key}
        }
        
    def get_issuers(self):
        r = requests.get(
            f'{self.endpoint}/registrations/issuers',
            headers={'X-API-KEY': self.api_key}
        )
        print(r.text)
        try:
            return r.json()
        except:
            raise PublisherControllerError()
        
    def get_registry(self):
        r = requests.get(Config.ISSUER_REGISTRY)
        print(r.text)
        try:
            registry = r.json().get('registry')
            if not isinstance(registry, list):
                registry = r.json().get('issuers')
            return registry
        except:
            raise PublisherControllerError()
        
    def register_issuer(self, scope, name, description):
        r = requests.post(
            f'{self.endpoint}/registrations/issuers',
            headers={'X-API-KEY': self.api_key},
            json={
                'scope': scope,
                'name': name,
                'description': description
            }
        )
        print(r.text)
        try:
            return r.json()
        except:
            raise PublisherControllerError()
        
    def get_credentials(self):
        r = requests.get(
            f'{self.endpoint}/credentials/issuers',
            headers={'X-API-KEY': self.api_key}
        )
        try:
            return r.json()
        except:
            raise PublisherControllerError()