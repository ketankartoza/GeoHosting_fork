"""Checkout API."""

from django.http import HttpResponseServerError
from django.shortcuts import get_object_or_404

from geohosting.api.payment import (
    PaymentAPI, PaymentStripeSessionAPI, PaymentPaystackSessionAPI
)
from geohosting.models import Package
from geohosting.models.sales_order import SalesOrder


class CheckoutAPI(PaymentAPI):
    """API checkout session."""

    def post(self, request, pk):
        """Post to create checkout session."""
        package = get_object_or_404(Package, pk=pk)
        try:
            order = SalesOrder.objects.create(
                package=package,
                customer=request.user
            )
            return self.get_post(order=order)
        except Exception as e:
            return HttpResponseServerError(f'{e}')


class CheckoutStripeSessionAPI(PaymentStripeSessionAPI, CheckoutAPI):
    """API creating stripe checkout session."""

    pass


class CheckoutPaystackSessionAPI(PaymentPaystackSessionAPI, CheckoutAPI):
    """API creating paystack checkout session."""

    pass
