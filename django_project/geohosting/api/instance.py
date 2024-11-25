from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.api import FilteredAPI
from geohosting.models import Instance
from geohosting.serializer.instance import InstanceSerializer


class InstanceViewSet(
    FilteredAPI,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet
):
    """ViewSet for fetching user instances."""

    serializer_class = InstanceSerializer
    permission_classes = [IsAuthenticated]
    default_query_filter = ['name__icontains']

    def get_queryset(self):
        """Return instances for the authenticated user."""
        query = Instance.objects.filter(owner=self.request.user).order_by(
            'name'
        )
        return self.filter_query(self.request, query)

    @action(detail=True, methods=["get"])
    def credential(self, request, pk=None):
        instance = self.get_object()
        credentials = {
            key: value for key,
            value in instance.credentials.items() if 'DATABASE' not in key
        }
        return Response(credentials)
