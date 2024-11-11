from django.shortcuts import get_object_or_404
from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated

from geohosting.api.payment import (
    PaymentAPI, PaymentStripeSessionAPI, PaymentPaystackSessionAPI
)
from geohosting.models.sales_order import SalesOrder
from geohosting.serializer.sales_order import (
    SalesOrderSerializer, SalesOrderDetailSerializer
)


class SalesOrderSetView(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet
):
    """Sales order viewset."""

    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SalesOrderDetailSerializer
        return SalesOrderSerializer

    def get_queryset(self):
        """Return querysets."""
        return SalesOrder.objects.filter(customer_id=self.request.user.id)

    def get_object(self):
        """Get object."""
        obj = super().get_object()
        obj.update_payment_status()
        return obj


class SalesOrderPaymentAPI(PaymentAPI):
    """API checkout session."""

    def post(self, request, pk):
        """Post to create checkout session."""
        order = get_object_or_404(SalesOrder, pk=pk)
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
