"""Checkout API."""

import json

from django.core.exceptions import ValidationError
from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404

from geohosting.api.payment import (
    PaymentAPI, PaymentStripeSessionAPI, PaymentPaystackSessionAPI
)
from geohosting.models import Package
from geohosting.models.activity import name_validator
from geohosting.models.agreement import AgreementDetail, SalesOrderAgreement
from geohosting.models.company import Company
from geohosting.models.sales_order import SalesOrder
from geohosting.validators import app_name_validator


class CheckoutAPI(PaymentAPI):
    """API checkout session."""

    def post(self, request, pk):
        """Post to create checkout session."""
        try:
            app_name = request.data['app_name']
            company_name = request.data['company_name']
            agreement_ids = json.loads(request.data['agreement_ids'])
            if company_name:
                company = Company.objects.get(name=company_name)
            else:
                company = None
            name_validator(app_name)
            app_name_validator(app_name)
        except (ValueError, ValidationError) as e:
            return HttpResponseBadRequest(e)
        package = get_object_or_404(Package, pk=pk)

        # Create order
        order = SalesOrder.objects.create(
            package=package,
            customer=request.user,
            app_name=app_name,
            company=company,
            payment_method=self.payment_method
        )
        for agreement_id in agreement_ids:
            SalesOrderAgreement.objects.create(
                agreement_detail=AgreementDetail.objects.get(pk=agreement_id),
                sales_order=order
            )
        return self.get_post(order=order)


class CheckoutStripeSessionAPI(PaymentStripeSessionAPI, CheckoutAPI):
    """API creating stripe checkout session."""

    pass


class CheckoutPaystackSessionAPI(PaymentPaystackSessionAPI, CheckoutAPI):
    """API creating paystack checkout session."""

    pass
