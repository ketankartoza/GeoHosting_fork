from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated

from geohosting.models.agreement import AgreementDetail
from geohosting.serializer.agreement import AgreementDetailSerializer


class AgreementViewSet(
    mixins.ListModelMixin,
    viewsets.GenericViewSet
):
    """Sales order viewset."""

    permission_classes = [IsAuthenticated]
    serializer_class = AgreementDetailSerializer

    def get_queryset(self):
        """Return instances for the authenticated user."""
        return AgreementDetail.objects.select_related(
            'agreement'
        ).order_by('agreement', '-version').distinct(
            'agreement'
        )
