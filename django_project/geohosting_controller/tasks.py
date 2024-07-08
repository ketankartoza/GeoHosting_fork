# coding=utf-8
"""
Tomorrow Now GAP.

.. note:: Tasks.
"""

from celery.utils.log import get_task_logger
from django.core.management import call_command

from core.celery import app

logger = get_task_logger(__name__)


@app.task
def sync_with_jenkins():
    """Sync with jenkins."""
    call_command('sync_with_jenkins')
