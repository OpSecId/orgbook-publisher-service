from config import Config

lob_query = {
    'type': "QueryByExample",
    'credentialQuery': {
        'reason': "Please present your Authorization Credential to access the Orgbook Publisher Service.",
        'example': {
            "@context": [
                "https:/www.w3.org/ns/credentials/v2",
                "https:/www.w3.org/ns/credentials/example/v2"
            ],
            'type': ["AuthorizationCredential"],
            'credentialSubject': {
                "id": "",
                "email": "",
                "target": Config.ORGBOOK_ENDPOINT,
                "roleName": "admin",
            }
        }
    }
}