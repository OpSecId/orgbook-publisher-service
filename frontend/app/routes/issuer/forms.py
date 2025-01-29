from flask_wtf import FlaskForm
from wtforms import (
    StringField,
    SubmitField,
    FileField,
    SelectField,
    EmailField,
    DateTimeField
)
from wtforms.validators import InputRequired

class IssuerLoginForm(FlaskForm):
    submit = SubmitField("Verify")

class RegisterCredentialForm(FlaskForm):
    csv_file = FileField(
        "CSV File", [InputRequired()]
    )
    description = StringField(
        "Description", [InputRequired()]
    )
    credential_name = StringField(
        "Credential Name", [InputRequired()]
    )
    credential_type = StringField(
        "Credential Type", [InputRequired()]
    )
    source_id = StringField(
        "Document Id Attribute", [InputRequired()]
    )
    registration_id = StringField(
        "Registration Id Attribute", [InputRequired()]
    )
    # Advanced
    context = StringField(
        "Context URI", []
    )
    oca_bundle = StringField(
        "OCA Bundle URI", []
    )
    submit = SubmitField("Register")

class IssuerCredentialForm(FlaskForm):
    csv_file = FileField(
        "CSV File", [InputRequired()]
    )
    credential_type = SelectField(
        "Credential Type", [InputRequired()]
    )
    submit = SubmitField("Issue")