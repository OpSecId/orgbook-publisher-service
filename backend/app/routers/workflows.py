from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from app.plugins.mongodb import MongoClient
from app.plugins.traction import TractionController
from app.models.workflows import ExchangeRequestBody
from config import settings
import uuid

router = APIRouter()

def create_exchange(query, service_endpoint):
    return {
        "challenge": str(uuid.uuid4()),
        "domain": settings.DOMAIN,
        "query": query,
        "interact": {
            "service": [
                {
                    "type": "UnmediatedHttpPresentationService2021",
                    "serviceEndpoint": service_endpoint
                }
            ]
        }
    }



@router.post("/workflows/{workflow_id}/exchanges", tags=["Workflows"])
async def create_workflow(workflow_id: str):
    exchange_id = str(uuid.uuid4())
    if workflow_id == 'did-auth':
        query = {
            "type": "DIDAuthentication", 
            "acceptedMethods": [
                {"method": "web"}
            ],
            "acceptedCryptosuites": [
                {"cryptosuite": "eddsa-jcs-2022"}
            ]
        }
        service_endpoint = f'https://{settings.DOMAIN}/workflows/{workflow_id}/exchanges/{exchange_id}'
        exchange = create_exchange(query, service_endpoint)
        MongoClient().insert("WorkflowExchangeRecord", {
            'id': exchange_id,
            'type': workflow_id,
            'initialExchange': exchange,
            'currentExchange': exchange,
            'state': {
                'verified': False,
                'did': None
            }
        })
        return JSONResponse(status_code=201, content={'serviceEndpoint': service_endpoint})
    raise HTTPException(
        status_code=400,
        detail="Unsupported Workflow",
    )

@router.post("/workflows/{workflow_id}/exchanges/{exchange_id}", tags=["Workflows"])
async def continue_exchange(workflow_id: str, exchange_id: str, request_body: ExchangeRequestBody):
    mongo = MongoClient()
    exchange_record = mongo.find_one(
        "WorkflowExchangeRecord", {"id": exchange_id, "type": workflow_id}
    )
    if not exchange_record:
        raise HTTPException(
            status_code=404,
            detail="Invalid exchange",
        )
        
    exchange = exchange_record.get('currentExchange')
    request_body = request_body.model()
    if request_body == {}: 
        return JSONResponse(status_code=200, content=exchange)
    
    if workflow_id == 'did-auth':
        vp = request_body.get('verifiablePresentation')
        if not vp:
            raise HTTPException(
                status_code=400,
                detail="Missing verifiable presentation",
            )
        proof = vp.get('proof')
        proof = proof if isinstance[proof, dict] else proof[0]
        
        methods = [entry['method'] for entry in exchange.get('query').get('acceptedMethods')]
        cryptosuites = [entry['cryptosuite'] for entry in exchange.get('query').get('acceptedCryptosuites')]
        
        try:
            assert proof.get('type') == 'DataIntegrityProof', 'Expected DataIntegrityProof type'
            assert proof.get('cryptosuite') in cryptosuites, f'Expected one of {cryptosuites} cryptosuites'
            assert proof.get('domain') == exchange.get('domain'), 'Domain mismatch'
            assert proof.get('challenge') == exchange.get('challenge'), 'Challenge mismatch'
            assert proof.get('proofPurpose') == 'authentication', 'Expected authentication proof purpose'
            assert proof.get('verificationMethod').split(':')[1] in methods, f'Expected one of {methods} methods'
        except AssertionError as e:
            raise HTTPException(
                status_code=400,
                detail=e,
            )
            
        verified = TractionController().verify_di_proof(vp)
        if verified:
            pass

            
        return JSONResponse(status_code=200, content=exchange)
    
    raise HTTPException(
        status_code=400,
        detail="Unsupported Workflow",
    )
