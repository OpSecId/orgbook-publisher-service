from typing import Dict, Any
from pydantic import BaseModel, Field
from app.models.credential import VerifiableCredential
from app.models.presentation import VerifiablePresentation

class BaseModel(BaseModel):
    def model_dump(self, **kwargs) -> Dict[str, Any]:
        return super().model_dump(by_alias=True, exclude_none=True, **kwargs)
    
class ExchangeRequestBody(BaseModel):
    verifiableCredential: VerifiableCredential = Field(None)
    verifiablePresentation: VerifiablePresentation = Field(None)