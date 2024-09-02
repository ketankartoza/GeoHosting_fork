"""Payment API."""

import stripe
from django.conf import settings
from django.http import HttpResponseServerError, JsonResponse
from django.shortcuts import get_object_or_404
from paystackapi.paystack import Paystack
from paystackapi.plan import Plan
from paystackapi.transaction import Transaction
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from geohosting.models import Package
from geohosting.models.sales_order import SalesOrder, SalesOrderPaymentMethod

paystack = Paystack(secret_key=settings.PAYSTACK_SECRET_KEY)


class PaymentAPI(APIView):
    """API checkout session."""

    permission_classes = (IsAuthenticated,)

    @property
    def payment_method(self):
        """Return payment method."""
        raise NotImplemented

    def create_payload(
            self, email, package: Package, callback_url
    ) -> (int, str):
        """Create payload of data from gateway.

        Return id of payment and string of challenge.
        """
        raise NotImplemented

    def get_post(self, order: SalesOrder):
        """Get post response."""
        domain = self.request.build_absolute_uri('/')
        try:
            callback_url = f'{domain}#/orders/{order.id}/configuration'
            _id, payload = self.create_payload(
                self.request.user.email, order.package, callback_url
            )
            order.payment_id = _id
            order.payment_method = self.payment_method
            order.save()
            return JsonResponse({
                "key": payload,
                "success_url": callback_url
            })
        except Exception as e:
            return HttpResponseServerError(f'{e}')

    def post(self, request, pk):
        """Post to create checkout session."""
        package = get_object_or_404(Package, pk=pk)
        domain = request.build_absolute_uri('/')
        try:
            order = SalesOrder.objects.create(
                package=package,
                customer=request.user
            )
            callback_url = f'{domain}#/orders/{order.id}/configuration'
            _id, payload = self.create_payload(
                request.user.email, package, callback_url
            )
            order.payment_id = _id
            order.payment_method = self.payment_method
            order.save()
            return JsonResponse({
                "key": payload,
                "success_url": callback_url
            })
        except Exception as e:
            return HttpResponseServerError(f'{e}')


class PaymentStripeSessionAPI:
    """API creating stripe checkout session."""

    payment_method = SalesOrderPaymentMethod.STRIPE

    def create_payload(
            self, email, package: Package, callback_url
    ) -> (int, str):
        """Create payload of data from gateway.

        Return id of payment and string of challenge.
        """
        price_id = package.get_stripe_price_id()
        checkout = stripe.checkout.Session.create(
            ui_mode='embedded',
            customer_email=email,
            line_items=[
                {
                    'price': price_id,
                    'quantity': 1,
                },
            ],
            mode='subscription',
            return_url=callback_url
        )
        return checkout.id, checkout.client_secret


class PaymentPaystackSessionAPI:
    """API creating paystack checkout session."""

    payment_method = SalesOrderPaymentMethod.PAYSTACK

    def create_payload(
            self, email, package: Package, callback_url
    ) -> (int, str):
        """Create payload of data from gateway.

        Return id of payment and string of challenge.
        """
        plan = Plan.get(package.get_paystack_price_id())['data']
        transaction = Transaction.initialize(
            email=email,
            amount=float(package.price * 100),
            plan=plan['plan_code']
        )['data']
        return transaction['reference'], transaction['access_code']
