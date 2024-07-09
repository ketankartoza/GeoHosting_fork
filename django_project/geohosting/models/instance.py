# coding=utf-8
"""
GeoHosting.

.. note:: Instance model.
"""

from django.contrib.auth import get_user_model
from django.db import models

from geohosting.models.cluster import Cluster
from geohosting.models.product import Package

User = get_user_model()


class Instance(models.Model):
    """Instance model."""

    name = models.CharField(
        max_length=256
    )
    price = models.ForeignKey(
        Package, on_delete=models.CASCADE,
    )
    cluster = models.ForeignKey(
        Cluster, on_delete=models.CASCADE,
    )
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE
    )

    def __str__(self):
        """Return activity type name."""
        return self.name

    class Meta:  # noqa
        unique_together = ('name', 'cluster')
