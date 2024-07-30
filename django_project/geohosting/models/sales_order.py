from django.contrib.auth import get_user_model
from django.db import models
from django.utils.timezone import now

User = get_user_model()


class SalesOrder(models.Model):
    package = models.ForeignKey(
        'geohosting.Package',
        null=False,
        blank=False,
        on_delete=models.CASCADE,
        related_name='sales_orders',
        verbose_name='Package'
    )

    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sales_orders',
        verbose_name='Customer'
    )

    date = models.DateTimeField(
        default=now,
        verbose_name='Order Date'
    )

    class Meta:
        verbose_name = 'Sales Order'
        verbose_name_plural = 'Sales Orders'

    def __str__(self):
        return (
            f"SalesOrder {self.id} for "
            f"{self.customer.username} - "
            f"{self.package.name}"
        )
