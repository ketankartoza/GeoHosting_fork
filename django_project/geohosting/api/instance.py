from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from geohosting.models import Instance
from geohosting.serializer.instance import InstanceSerializer


class InstanceViewSet(viewsets.ModelViewSet):
    """ViewSet for fetching user instances."""

    queryset = Instance.objects.all()
    serializer_class = InstanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return instances for the authenticated user."""
        return Instance.objects.filter(owner=self.request.user)

    @action(detail=False, methods=['get'])
    def my_instances(self, request):
        """Return instances for the current user."""
        user_instances = self.get_queryset()
        serializer = self.get_serializer(user_instances, many=True)
        return Response(serializer.data)
