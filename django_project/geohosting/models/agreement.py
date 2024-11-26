# coding=utf-8
"""
GeoHosting.

.. note:: Instance model.
"""
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from geohosting.models.sales_order import SalesOrder


class Agreement(models.Model):
    """Agreement model."""

    name = models.CharField(
        max_length=256
    )

    def __str__(self):
        """Return string representation."""
        return self.name


class AgreementDetail(models.Model):
    """Agreement model."""

    agreement = models.ForeignKey(
        Agreement, on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    template = models.TextField(
        blank=True, null=True
    )
    file = models.FileField(
        upload_to='agreements/',
        blank=True, null=True
    )
    version = models.IntegerField(
        default=1,
        help_text=(
            'The highest version will be used'
        )
    )

    class Meta:  # noqa
        ordering = ('agreement__name', '-version')
        unique_together = ('agreement', 'version')

    def __str__(self):
        """Return string representation."""
        return self.agreement.__str__()


class SalesOrderAgreement(models.Model):
    """Sales Order Agreement model."""

    sales_order = models.ForeignKey(
        SalesOrder, on_delete=models.CASCADE
    )
    agreement_detail = models.ForeignKey(
        AgreementDetail, on_delete=models.CASCADE
    )
    name = models.CharField(
        max_length=256, null=True, blank=True
    )
    created_at = models.DateTimeField(
        default=timezone.now
    )

    class Meta:  # noqa
        unique_together = ('sales_order', 'agreement_detail')

    def __str__(self):
        """Return string representation."""
        return self.name

    @property
    def content(self):
        """Return content of sales order agreement."""
        return self.agreement_detail.template


@receiver(post_save, sender=SalesOrderAgreement)
def create_name(sender, instance, created, **kwargs):
    if created:
        instance.name = (
            f'{instance.sales_order.erpnext_code} - '
            f'{instance.agreement_detail.__str__()}'
        )
        instance.save()
