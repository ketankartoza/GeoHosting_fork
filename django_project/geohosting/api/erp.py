"""
GeoHosting Controller.

.. note:: ERP Api View.
"""
from django.apps import apps
from django.contrib import messages
from django.http import HttpResponseBadRequest
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from geohosting.tasks.erp import sync_erp_data


class ERPApiView(APIView):
    """ERP API."""

    permission_classes = (IsAuthenticated, IsAdminUser)

    def get(self, request):
        """Create new instance."""
        try:
            class_name = request.GET.get('class-name')
            if class_name:
                apps.get_model('geohosting', class_name)
                sync_erp_data.delay(class_name)

                messages.add_message(
                    request,
                    messages.SUCCESS,
                    'Initiated syncing data from fetch in the background.'
                )
            else:
                messages.add_message(
                    request,
                    messages.ERROR,
                    'class-name cannot be empty.'
                )
            return Response()
        except Exception as e:
            messages.add_message(
                request,
                messages.ERROR,
                f'{e}'
            )
            return HttpResponseBadRequest(e)
