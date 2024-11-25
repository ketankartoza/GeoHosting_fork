from django.db import models

from geohosting.models.erp_model import ErpModel
from geohosting.models.sales_order import SalesOrderPaymentMethod


class ErpCompany(ErpModel):
    """Company that is coming from ERP."""

    id_field_in_erpnext = 'name'
    name = models.CharField(max_length=255)
    default_currency = models.CharField(
        max_length=256,
        blank=True, null=True
    )
    email = models.EmailField(
        blank=True, null=True
    )

    # Based on payment
    payment_method = models.CharField(
        default=SalesOrderPaymentMethod.STRIPE,
        choices=(
            (
                SalesOrderPaymentMethod.STRIPE,
                SalesOrderPaymentMethod.STRIPE
            ),
            (
                SalesOrderPaymentMethod.PAYSTACK,
                SalesOrderPaymentMethod.PAYSTACK
            )
        ),
        max_length=256,
        help_text='The status of order.'
    )

    @property
    def doc_type(self):
        """Doctype for this model."""
        return 'Company'

    def __str__(self):
        return self.erpnext_code

    class Meta:  # noqa: D106
        ordering = ('name',)
        verbose_name_plural = 'Erp Companies'
