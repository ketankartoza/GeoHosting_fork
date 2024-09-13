from django.core.exceptions import ValidationError
from django.db.models import Q

from geohosting.models.activity import (
    Activity, ActivityStatus,
    Instance
)

app_name_exist_error_message = 'App name is already taken.'


def app_name_validator(app_name):
    """App name validator."""
    if app_name:
        if Instance.objects.filter(name=app_name).count():
            raise ValidationError(app_name_exist_error_message)

        if Activity.objects.filter(
                client_data__app_name=app_name
        ).exclude(
            Q(status=ActivityStatus.ERROR) |
            Q(status=ActivityStatus.SUCCESS)
        ):
            raise ValidationError(app_name_exist_error_message)
