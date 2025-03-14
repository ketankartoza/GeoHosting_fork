from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator

app_name_exist_error_message = 'App name is already taken.'


def app_name_validator(app_name):
    """App name validator."""
    from geohosting.models.activity import Activity
    from geohosting.models.instance import Instance, InstanceStatus
    if app_name:
        if Instance.objects.filter(
                name=app_name
        ).exclude(status=InstanceStatus.DELETED).count():
            raise ValidationError(app_name_exist_error_message)

        if Activity.running_activities(app_name).count():
            raise ValidationError(app_name_exist_error_message)


regex_name = r'^[a-z0-9-]*$'
regex_name_error = (
    'Name may only contain lowercase letters, numbers or dashes.'
)
name_validator = RegexValidator(regex_name, regex_name_error)
