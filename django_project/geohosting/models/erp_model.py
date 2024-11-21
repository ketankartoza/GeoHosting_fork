# coding=utf-8
"""
GeoHosting.

.. note:: Model for ERP.
"""

from django.db import models

from geohosting.utils.erpnext import (
    fetch_erpnext_data, post_to_erpnext, put_to_erpnext
)


class ErpModel(models.Model):
    """Abstract erp model."""

    id_field_in_erpnext = 'id'

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
                self.erpnext_code = result[self.id_field_in_erpnext]
                self.save()
        else:
            result = put_to_erpnext(
                self.erp_payload_for_edit,
                self.doc_type,
                self.erpnext_code
            )
        return result

    @classmethod
    def sync_data(cls):
        """Sync data from erpnext to django that has erpnext code."""
        try:
            data = fetch_erpnext_data(cls().doc_type)
            field_names = [
                field.name for field in cls._meta.get_fields() if
                field.editable and not field.auto_created
                and field.name != 'erpnext_code'
            ]
            for _data in data:
                cls.objects.update_or_create(
                    erpnext_code=_data[cls.id_field_in_erpnext],
                    defaults={
                        key: value for key, value in _data.items() if
                        key in field_names
                    }
                )
        except Exception as e:
            print(e)
            pass
