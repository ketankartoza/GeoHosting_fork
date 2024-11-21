from rest_framework import mixins, viewsets

from core.api import FilteredAPI
from geohosting.models.country import Country
from geohosting.serializer.country import CountrySerializer


class CountryViewSet(
    FilteredAPI,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet
):
    """Sales order viewset."""

    serializer_class = CountrySerializer
    default_query_filter = ['name__icontains']

    def get_queryset(self):
        """Return querysets."""
        query = Country.objects.all()
        return self.filter_query(self.request, query).filter(
            code__isnull=False
        )
