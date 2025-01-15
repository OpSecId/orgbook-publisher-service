from config import Config
import requests


class OrgbookPublisher:
    def __init__(self):
        self.api = Config.ORGBOOK_ENDPOINT
        self.publisher_server = Config.PUBLISHER_SERVER
        self.publisher_api_key = Config.PUBLISHER_API_KEY
        
    def get_issuers(self):
        r = requests.get(
            f'{self.publisher_server}/registrations/issuers',
            headers={'X-API-KEY': self.publisher_api_key}
        )
        return r.json()

    def fetch_buisness_info(self, identifier):
        r = requests.get(
            f"{Config.ORGBOOK_API_URL}/search/topic?q={identifier}&inactive=false&revoked=false"
        )
        return r.json()["results"][0]
