from config import settings
import requests
from fastapi import HTTPException
from app.utils import verkey_to_multikey, timestamp
from app.plugins.mongodb import MongoClient
import httpx
from app.models.mongodb import IssuerRecord


class TractionControllerError(Exception):
    """Generic TractionController Error."""


class TractionController:
    def __init__(self):
        self.default_kid = "key-01"
        self.publisher_multikey = settings.PUBLISHER_MULTIKEY
        self.endpoint = settings.TRACTION_API_URL
        self.tenant_id = settings.TRACTION_TENANT_ID
        self.api_key = settings.TRACTION_API_KEY
        self.headers = {}

    def _try_response(self, response, response_key=None):
        try:
            return response.json()[response_key]
        except ValueError:
            settings.LOGGER.info("Traction response error:")
            settings.LOGGER.info(response)
            return None

    async def provision(self):
        self.authorize()
        settings.LOGGER.info("Fetching issuer registry.")
        issuers = httpx.get(settings.ISSUER_REGISTRY_URL).json()["issuers"]
        settings.LOGGER.info(f"Found {len(issuers)} entries in registry.")
        # mongo = MongoClient()
        # mongo.provision()
        for issuer in issuers:
            settings.LOGGER.info(issuer["name"])

            settings.LOGGER.info("Resolving DID document.")
            did_document = self.resolve(issuer.get("id"))
            if not did_document:
                settings.LOGGER.info("Could not resolve DID document.")

            settings.LOGGER.info("Looking up traction wallet.")
            authorized_key = self.get_multikey(issuer.get("id"))
            if not authorized_key:
                settings.LOGGER.info("No wallet key found.")

            # settings.LOGGER.info("Looking up local issuer record.")
            # issuer_record = mongo.find_one("IssuerRecord", {"id": issuer["id"]})
            # if not issuer_record:
            #     settings.LOGGER.info("No local record found.")

            # if did_document and authorized_key and issuer_record:
            #     if issuer_record["authorized_key"] != authorized_key:
            #         settings.LOGGER.info("Authorized key mismatch.")
            #     else:
            #         settings.LOGGER.info("All records check OK!")
                    
            # elif did_document and authorized_key and not issuer_record:
            #     issuer_record = IssuerRecord(
            #         id=issuer.get("id"),
            #         name=issuer.get("name"),
            #         authorized_key=authorized_key,
            #     ).model_dump()
            #     mongo.insert("IssuerRecord", issuer_record)
            #     settings.LOGGER.info("Local issuer record created.")
            # else:
            #     settings.LOGGER.info("Admin action required.")

    def authorize(self):
        r = requests.post(
            f"{self.endpoint}/multitenancy/tenant/{self.tenant_id}/token",
            json={"api_key": self.api_key},
        )
        token = self._try_response(r, "token")
        self.headers = {"Authorization": f"Bearer {token}"}

    def resolve(self, did):
        r = requests.get(
            f"{self.endpoint}/resolver/resolve/{did}",
            headers=self.headers,
        )
        did_document = self._try_response(r, "did_document")
        return did_document

    def create_did_key(self):
        r = requests.post(
            f"{self.endpoint}/wallet/did/create",
            headers=self.headers,
            json={"method": "key", "options": {"key_type": "ed25519"}},
        )
        did_info = self._try_response(r, "result")
        return did_info["did"].split(":")[-1]

    def get_multikey(self, did):
        r = requests.get(f"{self.endpoint}/wallet/did?did={did}", headers=self.headers)
        did_info = self._try_response(r, "results")
        if len(did_info) == 0:
            return None
        return verkey_to_multikey(did_info[0]["verkey"])

    def create_did_web(self, did):
        r = requests.post(
            f"{self.endpoint}/wallet/did/create",
            headers=self.headers,
            json={"method": "web", "options": {"did": did, "key_type": "ed25519"}},
        )
        did_info = self._try_response(r, "result")
        return verkey_to_multikey(did_info["verkey"])

    def create_key(self, kid=None):
        r = requests.post(
            f"{self.endpoint}/wallet/keys",
            headers=self.headers,
            json={"kid": kid} if kid else {},
        )
        return self._try_response(r, "multikey")

    def bind_key(self, multikey, kid):
        r = requests.put(
            f"{self.endpoint}/wallet/keys",
            headers=self.headers,
            json={"multikey": multikey, "kid": kid},
        )
        return self._try_response(r, "kid")

    def sign_vc_jwt(self, document):
        did = document.get('issuer') if isinstance(document.get('issuer'), str) else document.get('issuer').get('id')
        verification_method = f"{did}#{self.default_kid}-jwk"
        r = requests.post(
            f"{self.endpoint}/wallet/jwt/sign",
            headers=self.headers,
            json={
                "did": did,
                "verificationMethod": verification_method,
                "headers": {"typ": "vc+jwt"},
                "payload": document,
            },
        )
        return r.json()

    def issue_vc(self, credential):
        settings.LOGGER.info("Issuing Credential")
        did = credential.get('issuer') if isinstance(credential.get('issuer'), str) else credential.get('issuer').get('id')
        if did.startswith('did:web:'):
            verification_method = f"{did}#{self.default_kid}-multikey"
        elif did.startswith('did:key:'):
            verification_method = f"{did}#{settings.PUBLISHER_MULTIKEY}"
        proof_options = {
            "type": "DataIntegrityProof",
            "cryptosuite": "eddsa-jcs-2022",
            "proofPurpose": "assertionMethod",
            "verificationMethod": verification_method,
            "created": timestamp(),
        }
        return self.add_di_proof(credential, proof_options)

    def create_vp(self, vc):
        settings.LOGGER.info("Creating Presentation")
        did = vc["issuer"]["id"]
        if did.startswith('did:web:'):
            verification_method = f"{did}#{self.default_kid}-multikey"
        elif did.startswith('did:key:'):
            verification_method = f"{did}#{settings.PUBLISHER_MULTIKEY}"
        presentation = {
            '@context': [
                'https://www.w3.org/ns/credentials/v2'
            ],
            'type': ['VerifiablePresentation'],
            'verifiableCredential': [vc]
        }
        proof_options = {
            "type": "DataIntegrityProof",
            "cryptosuite": "eddsa-jcs-2022",
            "proofPurpose": "authentication",
            "verificationMethod": verification_method,
            "created": timestamp(),
        }
        return self.add_di_proof(presentation, proof_options)

    def add_di_proof(self, document, options):
        r = requests.post(
            f"{self.endpoint}/vc/di/add-proof",
            headers=self.headers,
            json={
                "document": document,
                "options": options,
            },
        )
        return self._try_response(r, "securedDocument")

    def endorse(self, document, options):
        options["verificationMethod"] = (
            f"did:key:{self.publisher_multikey}#{self.publisher_multikey}"
        )
        r = requests.post(
            f"{self.endpoint}/vc/di/add-proof",
            headers=self.headers,
            json={
                "document": document,
                "options": options,
            },
        )
        return self._try_response(r, "securedDocument")

    def verify_di_proof(self, secured_document):
        r = requests.post(
            f"{self.endpoint}/vc/di/verify",
            headers=self.headers,
            json={
                "securedDocument": secured_document,
            },
        )
        return self._try_response(r, "verified")
