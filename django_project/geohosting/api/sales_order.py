from django.core.exceptions import ValidationError
from django.db.models import Q
from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.api import FilteredAPI
from geohosting.api.payment import (
    PaymentAPI, PaymentStripeSessionAPI, PaymentPaystackSessionAPI
)
from geohosting.models.activity import name_validator
from geohosting.models.sales_order import SalesOrder
from geohosting.serializer.sales_order import (
    SalesOrderSerializer, SalesOrderDetailSerializer
)
from geohosting.validators import app_name_validator


class SalesOrderSetView(
    FilteredAPI,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet
):
    """Sales order viewset."""

    permission_classes = (IsAuthenticated,)
    default_query_filter = []

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SalesOrderDetailSerializer
        return SalesOrderSerializer

    def get_queryset(self):
        """Return querysets."""
        query = SalesOrder.objects.filter(customer_id=self.request.user.id)
        q = self.request.GET.get('q')
        if q:
            query = query.filter(
                Q(erpnext_code__icontains=q) | Q(app_name__icontains=q)
            )
        return self.filter_query(self.request, query).order_by('-date')

    def get_object(self):
        """Get object."""
        obj = super().get_object()
        obj.update_payment_status()
        return obj


class SalesOrderPaymentAPI(PaymentAPI):
    """API checkout session."""

    def post(self, request, pk):
        """Post to create checkout session."""
        try:
            app_name = request.data['app_name']
            name_validator(app_name)
            app_name_validator(app_name)
        except (ValueError, ValidationError) as e:
            return HttpResponseBadRequest(e)
        order = get_object_or_404(SalesOrder, pk=pk)
        order.app_name = app_name
        order.payment_id = None
        order.payment_method = self.payment_method
        order.save()
        return self.get_post(order=order)


class SalesOrderPaymentStripeSessionAPI(
    PaymentStripeSessionAPI,
    SalesOrderPaymentAPI
):
    """API creating stripe checkout session."""

    pass


class SalesOrderPaymentPaystackSessionAPI(
    PaymentPaystackSessionAPI,
    SalesOrderPaymentAPI
):
    """API creating paystack checkout session."""

    pass


class CheckAppNameAPI(APIView):
    """Check validity of app name."""

    permission_classes = (IsAuthenticated,)

    def post(self, request):
        """Create token for logged in user."""
        try:
            app_name = request.data['app_name']
            name_validator(app_name)
            app_name_validator(app_name)
            return Response('OK')
        except (ValueError, ValidationError) as e:
            return HttpResponseBadRequest(e)
