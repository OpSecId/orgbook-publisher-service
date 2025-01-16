# import redis
import os
from dotenv import load_dotenv


class Config(object):
    load_dotenv()
    APP_NAME = "Orgbook Publisher Frontend"

    SECRET_KEY = os.getenv("SECRET_KEY", "unsecured")

    PUBLISHER_DOMAIN = os.getenv("DOMAIN", "localhost:5000")
    PUBLISHER_ENDPOINT = f"https://{PUBLISHER_DOMAIN}"

    ORGBOOK_ENDPOINT = os.getenv("ORGBOOK_URL")

    # PUBLISHER_NAME = 'Orgbook Publisher Service'
    # PUBLISHER_LOGO = 'https://avatars.githubusercontent.com/u/151191942'
    # PUBLISHER_MULTIKEY = os.getenv('ISSUER_MULTIKEY')
    # PUBLISHER_DID_WEB = f'did:web:{PUBLISHER_DOMAIN}'
    # PUBLISHER_DID_KEY = f'did:key:{PUBLISHER_MULTIKEY}'

    TRACTION_API_URL = os.getenv("TRACTION_API_URL")
    TRACTION_API_KEY = os.getenv("TRACTION_API_KEY")
    TRACTION_TENANT_ID = os.getenv("TRACTION_TENANT_ID")
    
    PUBLISHER_SERVER = os.getenv("PUBLISHER_SERVER", None)
    PUBLISHER_API_KEY = TRACTION_API_KEY

    # SESSION_TYPE = 'redis'
    # SESSION_REDIS = redis.from_url(os.getenv('REDIS_URL'))
    # SESSION_COOKIE_NAME  = 'bcgov-orgbook-publisher-service'

    SESSION_COOKIE_SAMESITE = "Strict"
    SESSION_COOKIE_HTTPONLY = "True"
