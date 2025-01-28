from typing import Union, List, Dict, Any
from pydantic import Field, BaseModel, field_validator
from pydantic.json_schema import SkipJsonSchema
from config import settings
from app.utils import valid_datetime_string, valid_uri
from app.models.credential import VerifiableCredential
from app.models.proof import DataIntegrityProof

class BaseModel(BaseModel):
    def model_dump(self, **kwargs) -> Dict[str, Any]:
        return super().model_dump(by_alias=True, exclude_none=True, **kwargs)
    
class Presentation(BaseModel):
    context: List[str] = Field(alias="@context")
    id: str = Field(None)
    type: Union[str, List[str]] = Field()
    holder: str = Field(None)
    verifiableCredential: List[VerifiableCredential] = Field(None)

    @field_validator("context")
    @classmethod
    def validate_context(cls, value):
        assert value[0] == "https://www.w3.org/ns/credentials/v2"
        return value

    @field_validator("type")
    @classmethod
    def validate_type(cls, value):
        asserted_value = value if isinstance(value, list) else [value]
        assert "VerifiablePresentation" in asserted_value
        return value
    
class VerifiablePresentation(Presentation):
    proof: Union[DataIntegrityProof, List[DataIntegrityProof]] = Field()
