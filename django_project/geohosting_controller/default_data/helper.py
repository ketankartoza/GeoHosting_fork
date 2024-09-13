import json

from core.settings.utils import absolute_path
from geohosting.models.cluster import Cluster
from geohosting.models.region import Region


def get_jenkin_activity_types() -> dict:
    """Return jenkins activity types by product name."""
    return json.loads(
        open(
            absolute_path(
                'geohosting_controller', 'default_data',
                'jenkins_activity_type.json'
            )
        ).read()
    )


def get_regions() -> dict:
    """Return regions."""
    return json.loads(
        open(
            absolute_path(
                'geohosting_controller', 'default_data',
                'region.json'
            )
        ).read()
    )


def generate_regions():
    """Generate regions data."""
    regions = get_regions()
    for region in regions:
        Region.objects.update_or_create(
            code=region['code'],
            defaults={
                'name': region['name'],
            }
        )


def get_clusters() -> dict:
    """Return clusters."""
    return json.loads(
        open(
            absolute_path(
                'geohosting_controller', 'default_data',
                'cluster.json'
            )
        ).read()
    )


def generate_cluster():
    """Generate clusters data."""
    clusters = get_clusters()
    for cluster in clusters:
        try:
            Cluster.objects.update_or_create(
                code=cluster['code'],
                region=Region.objects.get(code=cluster['region']),
                defaults={
                    'domain': cluster['domain'],
                }
            )
        except Region.DoesNotExist:
            pass


def get_product_clusters() -> dict:
    """Return product_clusters."""
    return json.loads(
        open(
            absolute_path(
                'geohosting_controller', 'default_data',
                'product_cluster.json'
            )
        ).read()
    )
