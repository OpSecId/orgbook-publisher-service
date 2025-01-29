from flask_wtf import FlaskForm
from wtforms import (
    StringField,
    SubmitField,
    PasswordField,
    SelectField,
    EmailField,
    DateTimeField
)
from wtforms.validators import InputRequired

class AdminLoginForm(FlaskForm):
    tenant_id = StringField(
        "Traction Tenant Id", [InputRequired()]
    )
    api_key = PasswordField(
        "Traction API Key", [InputRequired()]
    )
    submit = SubmitField("Login")

class RegisterIssuerForm(FlaskForm):
    scope = StringField(
        "Scope", [InputRequired()]
    )
    name = StringField(
        "Name", [InputRequired()]
    )
    submit = SubmitField("Register")

class OfferAuthCredentialForm(FlaskForm):
    email = EmailField(
        "BCGov Email", [InputRequired()]
    )
    issuer = SelectField(
        "Delegated Issuer", [InputRequired()]
    )
    # expiration = DateTimeField(
    #     "Expiration", []
    # )
    submit = SubmitField("Offer")