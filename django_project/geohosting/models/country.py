# coding=utf-8
"""
GeoHosting.

.. note:: Cluster model.
"""

from django.db import models

from geohosting.models.erp_model import ErpModel


class Country(ErpModel):
    """Country model."""

    id_field_in_erpnext = 'name'

    name = models.CharField(
        max_length=256
    )
    code = models.CharField(
        max_length=256, null=True, blank=True
    )
    time_zones = models.TextField(
        null=True, blank=True
    )
    country_name = models.CharField(
        max_length=256, null=True, blank=True
    )

    class Meta:  # noqa: D106
        ordering = ('name',)
        verbose_name_plural = 'Countries'

    def __str__(self):
        """Return country name."""
        return f'{self.name}'

    @property
    def doc_type(self):
        """Doctype for this model."""
        return 'Country'

    @property
    def erp_payload_for_create(self):
        """ERP Payload for create request."""
        return {
            "doctype": self.doc_type,
            "name": self.name,
            "code": self.code,
            "country_name": self.country_name
        }

    @property
    def erp_payload_for_edit(self):
        """ERP Payload for edit request."""
        return {
            "name": self.name,
            "code": self.code,
            "country_name": self.country_name
        }
