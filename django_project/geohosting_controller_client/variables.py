# coding=utf-8
"""
GeoHosting Controller.

.. note:: Variables
"""
from enum import Enum

CONTROLLER_SERVER_REQUEST_URL = '/api/request/'
CONTROLLER_SERVER_REQUEST_ACTIVITY_DETAIL = '/api/activities/<id>/'


class ActivityType(Enum):
    """Activity type."""

    CREATE_INSTANCE = 'INSTANCE.CREATE'
