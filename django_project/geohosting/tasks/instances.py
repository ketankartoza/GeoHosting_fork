from core.celery import app
from geohosting.models import Instance, InstanceStatus


@app.task(name='check_instances')
def check_instances():
    """Check instances."""
    for instance in Instance.objects.exclude(
            status=InstanceStatus.DELETED
    ):
        instance.checking_server()
