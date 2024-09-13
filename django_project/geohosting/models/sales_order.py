from datetime import timedelta

import stripe
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
from django.utils.timezone import now

from geohosting.models.activity import name_validator
from geohosting.models.region import Region
from geohosting.models.user_profile import UserProfile
from geohosting.utils.erpnext import (
    post_to_erpnext, put_to_erpnext, add_erp_next_comment
)
from geohosting.utils.paystack import verify_paystack_payment
from geohosting.utils.stripe import get_checkout_detail
from geohosting.validators import app_name_validator

stripe.api_key = settings.STRIPE_SECRET_KEY
User = get_user_model()


def get_default_delivery_date():
    return now() + timedelta(days=1)


class _SalesOrderStatusObject:
    """SalesOrderStatus."""

    def __init__(self, key, billing_status, erp_status, percent_billed):
        """Initiate SalesOrderStatusObject."""
        self.key = key
        self.billing_status = billing_status
        self.erp_status = erp_status
        self.percent_billed = percent_billed


class SalesOrderStatus:
    """Order Status."""

    WAITING_PAYMENT = _SalesOrderStatusObject(
        'Waiting Payment',
        'Not Billed',
        'To Bill',
        0
    )
    WAITING_CONFIGURATION = _SalesOrderStatusObject(
        'Waiting Configuration',
        'Fully Billed',
        'On Hold',
        100
    )
    WAITING_DEPLOYMENT = _SalesOrderStatusObject(
        'Waiting Deployment',
        'Fully Billed',
        'To Deliver',
        100
    )
    DEPLOYED = _SalesOrderStatusObject(
        'Deployed',
        'Fully Billed',
        'Completed',
        100
    )

    @staticmethod
    def sales_order_status_object_attributes() -> list[
        _SalesOrderStatusObject
    ]:
        output = []
        for prop in dir(SalesOrderStatus):
            attr = getattr(SalesOrderStatus, prop)
            if isinstance(attr, _SalesOrderStatusObject):
                output.append(attr)
        return output

    @staticmethod
    def obj_by_key(key: str) -> _SalesOrderStatusObject:
        """Return object status from key."""
        for attr in SalesOrderStatus.sales_order_status_object_attributes():
            if attr.key == key:
                return attr
        return SalesOrderStatus.WAITING_PAYMENT

    @staticmethod
    def key_in_tuple() -> tuple:
        output = ()
        for attr in SalesOrderStatus.sales_order_status_object_attributes():
            output += ((attr.key, attr.key),)
        return output


class SalesOrderPaymentMethod:
    """Order payment method."""

    STRIPE = 'Stripe'
    PAYSTACK = 'Paystack'


class SalesOrder(models.Model):
    """Sales Order."""

    doctype = "Sales Order"
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

    # For checkout status
    order_status = models.CharField(
        default=SalesOrderStatus.WAITING_PAYMENT.key,
        choices=SalesOrderStatus.key_in_tuple(),
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

    # This is configuration for create
    app_name = models.CharField(
        blank=True,
        null=True,
        help_text=(
            'App name that would be used for instance.'
            'It will also be used for sub domain.'
        ),
        validators=[name_validator, app_name_validator]
    )

    class Meta:
        verbose_name = 'Sales Order'
        verbose_name_plural = 'Sales Orders'

    def save(self, *args, **kwargs):
        """Save model."""
        super(SalesOrder, self).save(*args, **kwargs)
        # Push to erp
        self.post_to_erpnext()

        # Check if order status is waiting configuration
        order_status_obj = self.sales_order_status_obj
        if order_status_obj == SalesOrderStatus.WAITING_CONFIGURATION:
            self.auto_deploy()

    def add_comment(self, comment):
        """Add comment."""
        if self.erpnext_code:
            add_erp_next_comment(
                self.customer, self.doctype, self.erpnext_code, comment
            )

    def __str__(self):
        return (
            f"SalesOrder {self.id} for "
            f"{self.customer.username} - "
            f"{self.package.name}"
        )

    def post_to_erpnext(self):
        """Create the sales order to erpnext."""
        user_profile = UserProfile.objects.get(
            user=self.customer
        )
        doctype = self.doctype
        order_status_obj = self.sales_order_status_obj
        data = {
            # status is not billed
            'billing_status': order_status_obj.billing_status,
            # Status waiting bill
            'status': order_status_obj.erp_status,
            # Percent billed
            'per_billed': order_status_obj.percent_billed
        }

        # If not have erpnext_code, we post it to create the sales order
        if not self.erpnext_code:
            data.update(
                {
                    "doctype": doctype,
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
                }
            )
            result = post_to_erpnext(data, doctype)
            if result['status'] == 'success':
                self.erpnext_code = result['id']
                self.save()
        else:
            # If have erpnext_code, update the existing sales order on erp next
            result = put_to_erpnext(data, doctype, self.erpnext_code)
        return result

    @property
    def sales_order_status_obj(self) -> _SalesOrderStatusObject:
        """Return sales order status object."""
        return SalesOrderStatus.obj_by_key(self.order_status)

    def set_order_status(self, new: _SalesOrderStatusObject):
        """Set order status from _SalesOrderStatusObject."""
        self.order_status = new.key
        self.save()

    def update_payment_status(self):
        """Update payment status based on the checkout detail from payment."""
        order_status_obj = self.sales_order_status_obj
        if (
                order_status_obj == SalesOrderStatus.WAITING_PAYMENT
                and self.payment_id
        ):
            if self.payment_method == SalesOrderPaymentMethod.STRIPE:
                detail = get_checkout_detail(self.payment_id)
                if detail.invoice:
                    self.set_order_status(
                        SalesOrderStatus.WAITING_CONFIGURATION
                    )
            elif self.payment_method == SalesOrderPaymentMethod.PAYSTACK:
                response = verify_paystack_payment(self.payment_id)
                if response['data']['status'] == 'success':
                    self.set_order_status(
                        SalesOrderStatus.WAITING_CONFIGURATION
                    )

    @property
    def invoice_url(self):
        """Return invoice url when the status is not payment anymore."""
        if self.sales_order_status_obj != SalesOrderStatus.WAITING_PAYMENT:
            return (
                f"{settings.ERPNEXT_BASE_URL}/printview?doctype=Sales%20Order"
                f"&name={self.erpnext_code}&format=Standard"
            )

    def auto_deploy(self):
        """Change status to deployment and do deployment."""
        from geohosting.forms.activity.create_instance import (
            CreateInstanceForm
        )
        # Check if order status is waiting configuration
        if self.app_name and self.erpnext_code:
            if self.order_status != SalesOrderStatus.WAITING_CONFIGURATION:
                self.add_comment(f"App name : {self.app_name}")
            self.set_order_status(SalesOrderStatus.WAITING_DEPLOYMENT)

            # TODO:
            #  When we have multi region, we will change below
            #  Link region to sales order

            form = CreateInstanceForm(
                {
                    'region': Region.default_region(),
                    'app_name': self.app_name,
                    'package': self.package,
                    'sales_order': self
                }
            )
            form.user = self.customer
            if not form.is_valid():
                errors = []
                for key, val in form.errors.items():
                    errors += val
                self.add_comment(', '.join(errors))
            else:
                form.save()
