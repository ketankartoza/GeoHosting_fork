"""
GeoHosting Controller.

.. note:: Webhooks.
"""
import json

from django.http import HttpResponseBadRequest, HttpResponseServerError
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from geohosting.models import (
    Activity, ActivityStatus, Instance, Cluster, Package, WebhookEvent
)
from geohosting_controller.variables import ActivityTypeTerm


class WebhookView(APIView):
    """Webhook receiver."""

    permission_classes = (IsAuthenticated, IsAdminUser)
    JENKINS = 'jenkins'
    ARGO_CD = 'argocd'

    def post(self, request):
        """Create new instance."""
        data = request.data
        try:
            WebhookEvent.objects.create(
                data=data,
            )
            app_name = data['app_name']
            activities = Activity.objects.filter(
                client_data__app_name=app_name
            )

            # Check the data
            status = data['status'].lower()
            try:
                source = data['Source'].lower()
            except KeyError:
                source = data['source'].lower()

            # Don't do anything if it is still running
            if status in ['running']:
                return Response()

            # If source is argocd
            if source == self.JENKINS:
                activity = activities.filter(
                    status=ActivityStatus.BUILD_JENKINS
                ).first()
            elif source == self.ARGO_CD:
                activity = activities.filter(
                    status=ActivityStatus.BUILD_ARGO
                ).first()
            else:
                return Response()

            if not activity:
                raise Activity.DoesNotExist()

            if status in ['error', 'failed']:
                activity.note = data.get('message', 'Error')
                activity.update_status(ActivityStatus.ERROR)
                return Response()

            if status not in ['succeeded']:
                return HttpResponseBadRequest('Status does not found')

            if source == self.JENKINS:
                activity.update_status(ActivityStatus.BUILD_ARGO)
                activity.save()
            elif source == self.ARGO_CD:
                price = Package.objects.filter(
                    package_group__package_code=activity.client_data[
                        'package_code'
                    ]
                ).first()
                if activity.sales_order:
                    price = activity.sales_order.package
                if (
                        activity.activity_type.identifier ==
                        ActivityTypeTerm.CREATE_INSTANCE.value
                ):
                    cluster = Cluster.objects.get(
                        code=activity.post_data['k8s_cluster']
                    )
                    Instance.objects.create(
                        name=activity.client_data['app_name'],
                        price=price,
                        cluster=cluster,
                        owner=activity.triggered_by
                    )
                activity.note = json.dumps(data)
                activity.update_status(ActivityStatus.SUCCESS)
                activity.save()

        except (KeyError, Activity.DoesNotExist, Package.DoesNotExist) as e:
            return HttpResponseBadRequest(f'{e}')
        except Exception as e:
            return HttpResponseServerError(f'{e}')

        return Response()
