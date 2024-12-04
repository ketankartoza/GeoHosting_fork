from core.celery import app
from geohosting.models import Instance


@app.task(name='check_instances')
def check_instances():
    """Check instances."""
    for instance in Instance.objects.all():
        instance.checking_server()
