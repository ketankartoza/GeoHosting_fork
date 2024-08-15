from datetime import timedelta

import stripe
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
from django.utils.timezone import now

from geohosting.models.user_profile import UserProfile
from geohosting.utils.erpnext import post_to_erpnext
from geohosting.utils.paystack import verify_paystack_payment
from geohosting.utils.stripe import get_checkout_detail

stripe.api_key = settings.STRIPE_SECRET_KEY

User = get_user_model()


def get_default_delivery_date():
    return now() + timedelta(days=1)


class SalesOrderStatus:
    """Order Status."""

    WAITING_PAYMENT = 'Waiting Payment'
    PAID = 'Paid'


class SalesOrderPaymentMethod:
    """Order payment method."""

    STRIPE = 'Stripe'
    PAYSTACK = 'Paystack'


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
    order_status = models.CharField(
        default=SalesOrderStatus.WAITING_PAYMENT,
        choices=(
            (
                SalesOrderStatus.WAITING_PAYMENT,
                SalesOrderStatus.WAITING_PAYMENT
            ),
            (SalesOrderStatus.PAID, SalesOrderStatus.PAID)
        ),
        max_length=256,
        help_text='The status of order.'
    )

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
    payment_id = models.CharField(
        blank=True,
        null=True,
        help_text='Checkout id on the payment gateway.'
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

    def update_payment_status(self):
        """Get checkout status."""
        if (
                self.order_status == SalesOrderStatus.WAITING_PAYMENT
                and self.payment_id
        ):
            if self.payment_method == SalesOrderPaymentMethod.STRIPE:
                detail = get_checkout_detail(self.payment_id)
                if detail.invoice:
                    self.order_status = SalesOrderStatus.PAID
                    self.post_to_erpnext()
                    self.save()
            elif self.payment_method == SalesOrderPaymentMethod.PAYSTACK:
                response = verify_paystack_payment(self.payment_id)
                if response['data']['status'] == 'success':
                    self.order_status = SalesOrderStatus.PAID
                    self.post_to_erpnext()
                    self.save()
