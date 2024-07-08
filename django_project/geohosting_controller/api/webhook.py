"""
GeoHosting Controller.

.. note:: Webhooks.
"""
import json

from django.http import HttpResponseBadRequest
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from geohosting_controller.models import (
    Activity, ActivityStatus, Instance, Cluster, Product
)
from geohosting_controller_client.variables import ActivityType


class WebhookView(APIView):
    """Webhook receiver."""

    permission_classes = (IsAuthenticated, IsAdminUser)

    def post(self, request):
        """Create new instance."""
        data = request.data
        try:
            app_name = data['app_name']
            activity = Activity.objects.filter(
                status=ActivityStatus.BUILD_ARGO
            ).filter(client_data__app_name=app_name).first()
            activity.status = ActivityStatus.SUCCESS
            activity.note = json.dumps(data)
            if (
                    activity.activity_type.identifier ==
                    ActivityType.CREATE_INSTANCE.value
            ):
                cluster = Cluster.objects.get(
                    code=activity.post_data['k8s_cluster']
                )
                product = Product.objects.get(
                    name__iexact=activity.client_data['product']
                )
                Instance.objects.create(
                    name=activity.client_data['app_name'],
                    cluster=cluster,
                    product=product,
                    package_id=activity.client_data['package_id'],
                    owner_email=activity.client_data['user_email'],
                )
            activity.save()
        except (KeyError, Activity.DoesNotExist) as e:
            return HttpResponseBadRequest(f'{e}')

        return Response()
