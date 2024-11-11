# coding=utf-8
"""
GeoHosting.

.. note:: Model for ERP.
"""

from django.db import models

from geohosting.utils.erpnext import post_to_erpnext, put_to_erpnext


class ErpModel(models.Model):
    """Abstract erp model."""

    erpnext_code = models.CharField(
        max_length=100, blank=True, null=True
    )

    class Meta:  # noqa: D106
        abstract = True

    @property
    def doc_type(self):
        """Doctype for this model."""
        raise NotImplemented

    @property
    def erp_payload_for_create(self):
        """ERP Payload for create request."""
        raise NotImplemented

    @property
    def erp_payload_for_edit(self):
        """ERP Payload for edit request."""
        raise NotImplemented

    def post_to_erpnext(self):
        """Post data to erpnext."""
        if not self.erpnext_code:
            result = post_to_erpnext(
                self.erp_payload_for_create,
                self.doc_type
            )
            if result['status'] == 'success':
                self.erpnext_code = result['id']
                self.save()
        else:
            result = put_to_erpnext(
                self.erp_payload_for_edit,
                self.doc_type,
                self.erpnext_code
            )
        return result
