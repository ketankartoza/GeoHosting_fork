"""
GeoHosting Controller.

.. note:: Ticket.
"""

from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny

from core.api import FilteredAPI
from geohosting.models.support import Ticket, Attachment
from geohosting.serializer.support import (
    TicketSerializer, AttachmentSerializer
)


class TicketSetView(
    FilteredAPI,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet
):
    """Sales order viewset."""

    serializer_class = TicketSerializer

    def get_queryset(self):
        """Return querysets."""
        try:
            user_email = self.request.user.email
            # TODO:
            #  Need to put this on a ticket level
            # Ticket.fetch_ticket_from_erp(user_email)
            query = Ticket.objects.filter(customer=user_email)
        except AttributeError:
            query = Ticket.objects.none()
        return self.filter_query(self.request, query)


class AttachmentSetView(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet
):
    """Sales order viewset."""

    serializer_class = AttachmentSerializer
    authentication_classes = []
    permission_classes = (AllowAny,)

    # TODO: We need to enable this after the frontend has been paginated
    pagination_class = None

    def get_serializer(self, *args, **kwargs):
        """Return serializer."""
        try:
            kwargs['data'] = self.request.data.copy()
            kwargs['data']['ticket'] = self.kwargs.get('tickets_pk')
        except KeyError:
            pass
        return super().get_serializer(*args, **kwargs)

    def get_queryset(self):
        """Return querysets."""
        user_email = self.request.user.email
        return Attachment.objects.filter(
            ticket___customer=user_email
        )
