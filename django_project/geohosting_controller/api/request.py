"""
GeoHosting Controller.

.. note:: Config App.
"""

import copy

from django.db.models import Q
from django.http import HttpResponseServerError, HttpResponseBadRequest
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from geohosting_controller.exceptions import NoClusterException
from geohosting.models import (
    Activity, ActivityType, ActivityStatus, Cluster, Product, Instance
)
from geohosting_controller.serializer.activity import ActivitySerializer
from geohosting_controller_client.variables import (
    ActivityType as VarActivityType
)


class RequestView(APIView):
    """Request new instance."""

    permission_classes = (IsAuthenticated, IsAdminUser)

    def refactor_data(self, activity_type, product: Product, data):
        """Refactor data."""
        # Update the data based on type
        if activity_type == VarActivityType.CREATE_INSTANCE.value:
            try:
                # TODO:
                #  Later fix using region input
                #  Change keys when API is universal
                app_name = data['app_name']
                if not Activity.is_valid(app_name):
                    raise ValueError(
                        'App name just contains letter, number and dash'
                    )
                if Instance.objects.filter(name=app_name).count():
                    raise ValueError('Instance already exists')
                if Activity.objects.filter(
                        client_data__app_name=app_name
                ).exclude(
                    Q(status=ActivityStatus.ERROR) |
                    Q(status=ActivityStatus.SUCCESS)
                ):
                    raise ValueError('Instance already exists')

                return {
                    'subdomain': data['subdomain'],
                    'k8s_cluster': product.cluster.code,
                    'geonode_size': data['package_id'],
                    'geonode_name': data['app_name']
                }
            except Cluster.DoesNotExist:
                raise NoClusterException()
        raise ActivityType.DoesNotExist()

    def post(self, request):
        """Create new instance."""
        data = copy.deepcopy(request.data)

        # Create new activity and return unique id
        try:
            request_type = data['request_type']
        except KeyError:
            return HttpResponseBadRequest(
                '`request_type` is required on payload.'
            )
        try:
            product = Product.objects.get(name__iexact=data['product'])
        except KeyError:
            return HttpResponseBadRequest(
                '`product` is required on payload.'
            )
        except Product.DoesNotExist:
            return HttpResponseBadRequest(
                'Product name does not exist.'
            )

        try:
            activity_type = ActivityType.objects.get(
                identifier=request_type
            )
            activity = Activity.objects.create(
                activity_type=activity_type,
                client_data=data,
                post_data=self.refactor_data(request_type, product, data),
                product=product,
            )
        except ActivityType.DoesNotExist:
            return HttpResponseBadRequest(
                f'{request_type} for product {product.name} does not exist.'
            )
        except KeyError as e:
            return HttpResponseBadRequest(f'{e} is required')
        except ValueError as e:
            return HttpResponseBadRequest(f'{e}')
        except Exception as e:
            return HttpResponseServerError(f'{e}')

        return Response(ActivitySerializer(activity).data)
