# coding=utf-8
"""
GeoHosting.

.. note:: Region model.
"""

from django.db import models


class Region(models.Model):
    """Region model."""

    name = models.CharField(
        max_length=256)
    code = models.CharField(
        unique=True, max_length=256)

    def __str__(self):
        """Return region name."""
        return self.name

    @staticmethod
    def default_region():
        """Return default region."""
        region, _ = Region.objects.get_or_create(
            code='global',
            defaults={
                'name': 'Global'
            }
        )
        return region
