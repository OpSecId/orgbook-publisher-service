from typing import Union, List, Dict, Any
from pydantic import Field, BaseModel, field_validator
from pydantic.json_schema import SkipJsonSchema
from config import settings
from app.utils import valid_datetime_string, valid_uri
from app.models.credential import Credential

class BaseModel(BaseModel):
    def model_dump(self, **kwargs) -> Dict[str, Any]:
        return super().model_dump(by_alias=True, exclude_none=True, **kwargs)
    
class DataIntegrityProof(BaseModel):
    id: str = Field(None)
    type: str = Field()
    domain: str = Field(None)
    challenge: str = Field(None)
    cryptosuite: str = Field()
    proofValue: str = Field()
    proofPurpose: str = Field()
    verificationMethod: str = Field()
    expires: str = Field(None)
    created: str = Field(None)
    previousProof: str = Field(None)