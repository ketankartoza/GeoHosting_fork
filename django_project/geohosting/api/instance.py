from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated

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
        query = Instance.objects.filter(owner=self.request.user)
        return self.filter_query(self.request, query)
