from django.contrib.auth import get_user_model
from django.db import models
from datetime import timedelta
from django.utils.timezone import now

from geohosting.models.user_profile import UserProfile
from geohosting.utils.erpnext import post_to_erpnext

User = get_user_model()


def get_default_delivery_date():
    return now() + timedelta(days=1)


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

    delivery_date = models.DateTimeField(
        default=get_default_delivery_date,
        verbose_name='Delivery Date'
    )

    erpnext_code = models.CharField(
        default='',
        blank=True
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

    def post_to_erpnext(self):
        user_profile = UserProfile.objects.get(
            user=self.customer
        )
        result = post_to_erpnext(
            {
                "doctype": "Sales Order",
                'customer': user_profile.erpnext_code,
                'date': self.date.strftime('%Y-%m-%d'),
                'items': [
                    {
                        'name': self.package.erpnext_code,
                        'item_code': self.package.erpnext_item_code,
                        'delivery_date': (
                            self.delivery_date.strftime('%Y-%m-%d')
                        ),
                        'qty': 1.0,
                    }
                ]
            },
            'Sales Order'
        )
        if result['status'] == 'success':
            self.erpnext_code = result['id']
            self.save()

        return result
