from django.db import models

from geohosting.models.country import Country
from geohosting.models.erp_model import ErpModel


class BillingInformation(ErpModel):
    """Billing information model."""

    name = models.TextField(
        blank=True, null=True
    )
    address = models.TextField(
        blank=True, null=True
    )
    postal_code = models.CharField(
        max_length=256,
        blank=True, null=True
    )
    country = models.ForeignKey(
        Country,
        on_delete=models.SET_NULL, blank=True, null=True
    )
    city = models.CharField(
        max_length=256,
        blank=True, null=True
    )
    region = models.CharField(
        max_length=256,
        blank=True, null=True
    )
    tax_number = models.CharField(
        max_length=256,
        blank=True, null=True
    )

    class Meta:  # noqa: D106
        abstract = True

    def emptying(self):
        """Empty data."""
        self.name = None
        self.postal_code = None
        self.address = None
        self.country = None
        self.city = None
        self.region = None
        self.tax_number = None
        self.save()

    @property
    def country_name(self):
        """Return the country name."""
        try:
            return self.country.name
        except AttributeError:
            return ''

    @property
    def doc_type(self):
        """Doctype for this model."""
        return 'Address'

    @property
    def customer_name(self):
        """Return customer name."""
        raise NotImplemented

    @property
    def erp_payload_for_create(self):
        """ERP Payload for create request."""
        return {
            "doctype": self.doc_type,
            "address_title": self.name,
            "address_type": "Billing",
            "address_line1": self.address,
            "city": self.city,
            "state": self.region,
            "country": self.country_name,
            "pincode": self.postal_code,
            "is_primary_address": 1,
            "links": [
                {
                    "doctype": "Dynamic Link",
                    "link_doctype": "Customer",
                    "link_name": self.customer_name,
                    "parenttype": "Address"
                }
            ]
        }

    @property
    def erp_payload_for_edit(self):
        """ERP Payload for edit request."""
        return self.erp_payload_for_create
