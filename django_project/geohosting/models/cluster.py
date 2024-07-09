# coding=utf-8
"""
GeoHosting.

.. note:: Cluster model.
"""

from django.db import models

from geohosting.models.region import Region


class Cluster(models.Model):
    """Cluster model."""

    code = models.CharField(
        max_length=256
    )
    region = models.ForeignKey(
        Region,
        on_delete=models.CASCADE
    )
    domain = models.CharField(
        max_length=256,
        null=True,
        blank=True,
        help_text='Domain url of the cluster'
    )

    def __str__(self):
        """Return region name."""
        return f'{self.code} - {self.region}'

    class Meta:  # noqa
        unique_together = ('code', 'region')
