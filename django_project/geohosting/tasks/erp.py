from celery import shared_task
from django.apps import apps


@shared_task
def sync_erp_data(class_name):
    """Sync erp data from ERPNEXT API."""
    if class_name:
        Model = apps.get_model('geohosting', class_name)
        Model.sync_data()
