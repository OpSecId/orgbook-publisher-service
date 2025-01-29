from pydantic_settings import BaseSettings
from typing import Union
import os
import logging
from logging import Logger
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, ".env"))


class Settings(BaseSettings):
    PROJECT_TITLE: str = "Orgbook Publisher"
    PROJECT_VERSION: str = "v0"

    LOG_LEVEL: int = logging.INFO
    LOG_FORMAT: str = "%(asctime)s | %(levelname)-8s | %(module)s:%(funcName)s:%(lineno)d | %(message)s"
    LOGGER: Logger = logging.getLogger(__name__)
    logging.basicConfig(level=LOG_LEVEL, format=LOG_FORMAT)

    # DOMAIN: str = os.getenv("DOMAIN")

    TRACTION_API_URL: str = os.getenv("TRACTION_API_URL")
    TRACTION_API_KEY: str = os.getenv("TRACTION_API_KEY")
    TRACTION_TENANT_ID: str = os.getenv("TRACTION_TENANT_ID")

    ORGBOOK_URL: str = os.getenv("ORGBOOK_URL")
    ORGBOOK_API_URL: str = f"{ORGBOOK_URL}/api/v4"
    ORGBOOK_VC_SERVICE: str = f"{ORGBOOK_URL}/api/vc"
    ORGBOOK_SYNC: bool = os.getenv("ORGBOOK_SYNC", False)

    DID_WEB_SERVER_URL: str = os.getenv("DID_WEB_SERVER_URL")

    ISSUER_REGISTRY_URL: str = os.getenv("ISSUER_REGISTRY_URL")
    WITNESS_KEY: str = os.getenv("WITNESS_KEY")

    # SECRET_KEY: str = TRACTION_API_KEY
    # JWT_SECRET: str = TRACTION_API_KEY
    # JWT_ALGORITHM: str = "HS256"

    # MONGO_HOST: str = os.getenv("MONGO_HOST", 'mongo')
    # MONGO_PORT: str = os.getenv("MONGO_PORT", '8080')
    # MONGO_USER: str = os.getenv("MONGO_USER", 'mongo')
    # MONGO_PASSWORD: str = os.getenv("MONGO_PASSWORD", 'mongo')
    # MONGO_DB: str = os.getenv("MONGO_DB", 'mongo')
    MONGO_URI: Union[str, None] = os.getenv("MONGO_URI")

settings = Settings()
