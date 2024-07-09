# coding=utf-8
"""
GeoHosting.

.. note:: Instance model.
"""

from django.db import models
from django.utils import timezone


class WebhookEvent(models.Model):
    """WebhookEvent model."""

    triggered_at = models.DateTimeField(
        default=timezone.now,
        editable=False
    )
    data = models.JSONField()

    class Meta:  # noqa
        ordering = ('-triggered_at',)

    def __str__(self):
        """Return string representation."""
        return str(self.triggered_at)
