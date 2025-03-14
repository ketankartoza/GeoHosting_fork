from django.http import HttpResponseBadRequest
from rest_framework import mixins, viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.api import FilteredAPI
from geohosting.forms.activity.terminate_instance import (
    TerminatingInstanceForm
)
from geohosting.models import (
    Instance, InstanceStatus
)
from geohosting.serializer.instance import InstanceSerializer


class InstanceViewSet(
    FilteredAPI,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
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

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(
            self.get_queryset().exclude(status=InstanceStatus.TERMINATED),
        )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def credential(self, request, pk=None):
        instance = self.get_object()
        credentials = {
            key: value for key,
            value in instance.credentials.items() if 'DATABASE' not in key
        }
        return Response(credentials)

    def destroy(self, request, *args, **kwargs):
        """Destroy an instance."""
        instance = self.get_object()
        form = TerminatingInstanceForm({'application': instance})
        form.user = self.request.user
        if form.is_valid():
            form.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            errors = []
            for key, value in form.errors.items():
                errors.append(str(value[0]))
            return HttpResponseBadRequest(f'{",".join(errors)}')
