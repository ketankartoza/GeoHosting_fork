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
    Activity, ActivityStatus, Package, WebhookEvent
)


class WebhookView(APIView):
    """Webhook receiver."""

    permission_classes = (IsAuthenticated, IsAdminUser)
    ARGO_CD = 'argocd'

    def post(self, request):
        """Create new instance."""
        data = request.data
        webhook = WebhookEvent.objects.create(data=data)
        try:
            # Check the data
            try:
                status = data['Status'].lower()
            except KeyError:
                status = data['status'].lower()
            try:
                source = data['Source'].lower()
            except KeyError:
                source = data['source'].lower()

            # Don't do anything if it is still running
            if status in ['running']:
                return Response()

            # Get the activities
            app_name = data['app_name'].replace('devops-', '')
            activities = Activity.objects.filter(
                client_data__app_name=app_name
            )
            # If source is argocd
            if source == self.ARGO_CD:
                activity = activities.filter(
                    status=ActivityStatus.BUILD_ARGO
                ).first()
            else:
                return Response()

            if not activity:
                raise Activity.DoesNotExist('Activity does not exist')

            if status in ['error', 'failed', 'outofsync', 'unknown']:
                activity.note = data.get('message', 'Error on Argo CD')
                activity.update_status(ActivityStatus.ERROR)
                return Response()

            if status not in ['success', 'succeeded', 'synced']:
                raise KeyError('Status does not found')

            # This is for deployment
            if source == self.ARGO_CD:
                activity.note = json.dumps(data)
                activity.update_status(ActivityStatus.SUCCESS)
                activity.save()

        except (KeyError, Activity.DoesNotExist, Package.DoesNotExist) as e:
            webhook.note = f'{e}'
            webhook.save()
            return HttpResponseBadRequest(f'{e}')
        except Exception as e:
            print(e)
            webhook.note = f'{e}'
            webhook.save()
            return HttpResponseServerError(f'{e}')

        return Response()
