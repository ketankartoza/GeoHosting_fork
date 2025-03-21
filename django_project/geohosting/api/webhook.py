"""
GeoHosting Controller.

.. note:: Webhooks.
"""
import json
import re

from django.http import HttpResponseBadRequest, HttpResponseServerError
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from geohosting.models import Activity, ActivityStatus, Instance, Package
from geohosting.models.webhook import WebhookStatus, WebhookEvent


class WebhookView(APIView):
    """Webhook receiver."""

    permission_classes = (IsAuthenticated, IsAdminUser)
    ARGO_CD = 'argocd'

    def post(self, request):
        """Create new instance."""
        data = request.data
        webhook = WebhookEvent.objects.create(data=data)
        try:
            status = data.get('Status', data.get('status'))
            if status is None:
                raise KeyError(
                    "Neither 'Status' nor 'status' key found in data"
                )
            status = status.lower()

            source = data.get('Source', data.get('source'))
            if source is None:
                raise KeyError(
                    "Neither 'Source' nor 'source' key found in data"
                )
            source = source.lower()

            # Don't do anything if it is still running
            if status in [WebhookStatus.RUNNING]:
                return Response()
            if source != self.ARGO_CD:
                return Response()

            app_name = re.sub(
                r'^(devops-|gsh-)', '', data['app_name']
            )
            webhook.app_name = app_name
            webhook.save()
            instance = Instance.objects.get(name=app_name)

            # Get the activity
            activity = Activity.objects.filter(
                instance=instance, status=ActivityStatus.BUILD_ARGO
            ).first()
            if not activity:
                activity = Activity.objects.filter(
                    instance=instance, status=ActivityStatus.ERROR
                ).last()
            if not activity:
                raise Activity.DoesNotExist()
            webhook.activity = activity
            webhook.save()

            # If error
            if status in [
                WebhookStatus.ERROR, WebhookStatus.FAILED,
                WebhookStatus.OUT_OF_SYNC, WebhookStatus.UNKNOWN
            ]:
                activity.note = data.get('Message', 'Error on Argo CD')
                activity.update_status(ActivityStatus.ERROR)
                return Response()

            # If it is synced
            if status not in [
                WebhookStatus.SUCCESS, WebhookStatus.SUCCEEDED,
                WebhookStatus.SYNCED, WebhookStatus.DELETED
            ]:
                raise KeyError('Status does not found')

            # This is for deployment
            if activity.is_deletion and status != WebhookStatus.DELETED:
                return Response()
            activity.note = json.dumps(data)
            activity.update_status(ActivityStatus.SUCCESS)
            activity.save()

        except (
                KeyError, Instance.DoesNotExist, Activity.DoesNotExist,
                Package.DoesNotExist
        ) as e:
            webhook.note = f'{e}'
            webhook.save()
            return HttpResponseBadRequest(f'{e}')
        except Exception as e:
            print(e)
            webhook.note = f'{e}'
            webhook.save()
            return HttpResponseServerError(f'{e}')

        return Response()
