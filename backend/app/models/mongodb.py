from typing import Dict, Any, Union
from pydantic import BaseModel, Field


class BaseModel(BaseModel):
    def model_dump(self, **kwargs) -> Dict[str, Any]:
        return super().model_dump(by_alias=True, exclude_none=True, **kwargs)


class IssuerRecord(BaseModel):
    id: str = Field()
    name: str = Field()
    secret_hash: str = Field(None)
    authorized_key: str = Field()


class CredentialTypeRecord(BaseModel):
    type: str = Field()
    version: str = Field()
    issuer: str = Field()
    context: dict = Field()
    template: dict = Field()
    oca_bundle: dict = Field()
    json_schema: dict = Field()
    core_paths: dict = Field()
    subject_type: str = Field()
    subject_paths: dict = Field()
    additional_type: Union[str, None] = Field(None)
    additional_paths: Union[dict, None] = Field(None)
    status_lists: list = Field()


class CredentialRecord(BaseModel):
    id: str = Field()
    type: str = Field()
    entity_id: str = Field()
    cardinality_id: str = Field()
    cardinality_hash: str = Field()
    refresh: bool = Field()
    revocation: bool = Field()
    suspension: bool = Field()
    vc: dict = Field()
    vc_jwt: str = Field()


class StatusListRecord(BaseModel):
    id: str = Field()
    type: str = Field(None)
    version: str = Field(None)
    active: bool = Field(None)
    indexes: list = Field()
    endpoint: str = Field()
    credential: dict = Field()
