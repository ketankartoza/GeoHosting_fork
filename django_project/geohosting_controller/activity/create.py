# coding=utf-8
"""
GeoHosting Controller.

.. note:: Controller to the server
"""

from django.contrib.auth import get_user_model
from django.db.models import Q

from geohosting.models import (
    Activity, ActivityType, ActivityStatus, Cluster, Instance, Package
)
from geohosting.models.product import Product
from geohosting_controller.exceptions import (
    NoClusterException, ActivityException
)
from geohosting_controller.variables import ActivityTypeTerm

User = get_user_model()


def _post_data(
        activity_type, product: Product, app_name,
        subdomain: str, package_code
):
    """Refactor data."""
    # Update the data based on type
    if activity_type == ActivityTypeTerm.CREATE_INSTANCE.value:
        try:
            # TODO:
            #  Later fix using region input
            #  Change keys when API is universal
            Activity.test_name(app_name)  # noqa
            if Instance.objects.filter(name=app_name).count():
                raise ActivityException('Instance already exists')
            if Activity.objects.filter(
                    client_data__app_name=app_name
            ).exclude(
                Q(status=ActivityStatus.ERROR) |
                Q(status=ActivityStatus.SUCCESS)
            ):
                raise ActivityException('Some of activity is already running')

            return {
                'subdomain': subdomain,
                'k8s_cluster': product.cluster.code,
                'geonode_size': package_code,
                'geonode_name': app_name
            }
        except Cluster.DoesNotExist:
            raise NoClusterException()
    raise ActivityType.DoesNotExist()


def create(
        product: Product, price: Package, subdomain: str, user: User
) -> Activity:
    """Create an instance.

    :param product:
        Application name that will be created.
        e.g : Geonode
    :param price:
        The selected price that will be used to create the instance.
    :param subdomain:
        Subdomain that will be used to serve the new instance.
    :param user:
        user who trigger this activity.

    :return: Activity that is created.
    :rtype: int
    """
    request_type = ActivityTypeTerm.CREATE_INSTANCE.value
    app_name = subdomain
    data = {
        'product': product.name,
        'app_name': app_name,
        'subdomain': subdomain,
        'package_code': price.package_code
    }

    activity_type = ActivityType.objects.get(
        identifier=request_type
    )
    post_data = _post_data(
        request_type, product, app_name,
        subdomain, price.package_code
    )
    return Activity.objects.create(
        triggered_by=user,
        activity_type=activity_type,
        client_data=data,
        post_data=post_data
    )
