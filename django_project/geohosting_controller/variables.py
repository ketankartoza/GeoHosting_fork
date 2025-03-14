# coding=utf-8
"""
GeoHosting Controller.

.. note:: Variables
"""

from enum import Enum


class ActivityTypeTerm(Enum):
    """Activity type."""

    CREATE_INSTANCE = 'INSTANCE.CREATE'
    DELETE_INSTANCE = 'INSTANCE.DELETE'
