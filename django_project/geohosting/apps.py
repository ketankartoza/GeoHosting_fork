"""
GeoHosting.

.. note:: Config App.
"""

from __future__ import absolute_import, unicode_literals

from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class Config(AppConfig):
    """Config App."""

    name = 'geohosting'
    verbose_name = _('GeoHosting')
