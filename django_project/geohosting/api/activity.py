"""
GeoHosting Controller.

.. note:: Activity.
"""

from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.viewsets import mixins, GenericViewSet

from geohosting.models import Activity, ActivityType
from geohosting.serializer.activity import (
    ActivitySerializer, ActivityTypeSerializer
)


class ActivityViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    GenericViewSet
):
    """Activity ViewSet."""

    permission_classes = (IsAuthenticated, IsAdminUser)
    serializer_class = ActivitySerializer
    queryset = Activity.objects.all()


class ActivityTypeViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    GenericViewSet
):
    """Activity ViewSet."""

    permission_classes = (IsAuthenticated, IsAdminUser)
    serializer_class = ActivityTypeSerializer
    queryset = ActivityType.objects.all()
