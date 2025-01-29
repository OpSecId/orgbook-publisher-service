import os
from dotenv import load_dotenv

load_dotenv()

class Config(object):
    APP_NAME = "Orgbook Publisher UI"
    
    DOMAIN = os.getenv("DOMAIN")

    SECRET_KEY = os.getenv("SECRET_KEY", "unsecured")
    WITNESS_KEY = os.getenv("WITNESS_KEY")
    
    ISSUER_REGISTRY = os.getenv("ISSUER_REGISTRY")
    
    TRACTION_API_URL = os.getenv("TRACTION_API_URL")
    TRACTION_API_KEY = os.getenv("TRACTION_API_KEY")
    TRACTION_TENANT_ID = os.getenv("TRACTION_TENANT_ID")
    
    PUBLISHER_API_URL = os.getenv("PUBLISHER_API_URL")
    PUBLISHER_API_KEY = TRACTION_API_KEY
    
    # SESSION_TYPE = 'redis'
    # SESSION_REDIS = redis.from_url(os.getenv('REDIS_URL'))
    # SESSION_COOKIE_NAME  = 'publisher'
    # SESSION_COOKIE_SAMESITE = "Strict"
    # SESSION_COOKIE_HTTPONLY = "True"
    
    RESTRICTED_EMAIL = "gov.bc.ca"
    AUTH_CRED_DEF_ID = os.getenv("AUTH_CRED_DEF_ID")
    AUTH_SCHEMA_ID = os.getenv("AUTH_SCHEMA_ID")
    
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
