from typing import Dict, Any, List
from pydantic import BaseModel, Field


class BaseModel(BaseModel):
    def model_dump(self, **kwargs) -> Dict[str, Any]:
        return super().model_dump(by_alias=True, exclude_none=True, **kwargs)


class RelatedResources(BaseModel):
    context: str = Field()
    legalAct: str = Field(None)
    governance: str = Field(None)


class CorePaths(BaseModel):
    entityId: str = Field()
    cardinalityId: str = Field()


class CredentialRegistration(BaseModel):
    type: str = Field()
    version: str = Field()
    issuer: str = Field()
    corePaths: Dict[str, str] = Field()
    subjectType: str = Field(None)
    subjectPaths: Dict[str, str] = Field()
    additionalType: str = Field(None)
    additionalPaths: Dict[str, str] = Field(None)
    relatedResources: Dict[str, str] = Field()
