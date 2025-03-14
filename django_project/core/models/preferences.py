# coding=utf-8
"""
GeoHosting.

.. note:: Preferences

"""

import os

from django.conf import settings
from django.contrib.gis.db import models
from django.utils.translation import gettext_lazy as _

from core.models.singleton import SingletonModel
from geohosting.utils.erpnext import test_connection
from geohosting.utils.paystack import test_connection as paystack_connection
from geohosting.utils.stripe import test_connection as strip_connection
from geohosting.utils.vault import get_token as vault_connection
from geohosting_controller.connection import get_jenkins_crumb


class SiteType(models.TextChoices):
    """Choices of site type."""

    STAGING = 'Staging', _('Staging')
    PRODUCTION = 'Production', _('Production')


class Preferences(SingletonModel):
    """Preference settings specifically for gap."""

    site_type = models.CharField(
        max_length=255,
        choices=SiteType.choices,
        default=SiteType.STAGING
    )
    support_email = models.EmailField(
        max_length=255,
        default='info@kartoza.com'

    )

    class Meta:  # noqa: D106
        verbose_name_plural = "preferences"

    def __str__(self):
        return 'Preferences'

    @property
    def erp_base_url(self):
        """Erp base url."""
        return settings.ERPNEXT_BASE_URL

    @property
    def erp_next_test(self):
        """Erp next test."""
        if not settings.ERPNEXT_BASE_URL:
            return 'ERPNEXT_BASE_URL is not setup yet'
        elif not settings.ERPNEXT_API_KEY:
            return 'ERPNEXT_API_KEY is not setup yet'
        elif not settings.ERPNEXT_API_SECRET:
            return 'ERPNEXT_API_SECRET is not setup yet'
        else:
            try:
                response = test_connection()
                if response.status_code == 200:
                    return 'OK'
                return response.status_code
            except Exception as e:
                return f'{e}'

    @property
    def proxy_base_url(self):
        """Erp base url."""
        proxy_base_url = os.environ.get('PROXY_BASE_URL', None)
        return proxy_base_url

    @property
    def proxy_test(self):
        """Proxy test."""
        proxy_base_url = os.environ.get('PROXY_BASE_URL', None)
        if not proxy_base_url:
            return 'PROXY_BASE_URL is not setup yet'
        try:
            get_jenkins_crumb(proxy_base_url)
            return 'OK'
        except Exception as e:
            return f'{e}'

    @property
    def stripe_test(self):
        """Stripe test."""
        try:
            strip_connection()
            return 'OK'
        except Exception as e:
            return f'{e}'

    @property
    def paystack_test(self):
        """Paystack test."""
        try:
            paystack_connection()
            return 'OK'
        except Exception as e:
            return f'{e}'

    @property
    def vault_test(self):
        """Vaule test."""
        try:
            vault_connection()
            return 'OK'
        except Exception as e:
            return f'{e}'
