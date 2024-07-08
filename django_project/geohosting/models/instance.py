from django.db import models

from geohosting.models.cluster import Cluster
from geohosting.models.product import Product


class Instance(models.Model):
    """Instance model."""

    name = models.CharField(max_length=256)
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE,
    )
    cluster = models.ForeignKey(
        Cluster, on_delete=models.CASCADE,
    )
    package_id = models.CharField(max_length=256)
    owner_email = models.CharField(max_length=256)

    def __str__(self):
        """Return activity type name."""
        return self.name

    class Meta:  # noqa
        unique_together = ('name', 'cluster')
