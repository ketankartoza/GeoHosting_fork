# coding=utf-8
"""
GeoHosting.

.. note:: Instance model.
"""

from django.db import models
from django.utils import timezone

from geohosting.models.activity import Activity


class WebhookStatus:
    """Webhook Status."""

    # Running status
    RUNNING = 'running'

    # Error statuses
    ERROR = 'error'
    FAILED = 'failed'
    OUT_OF_SYNC = 'outofsync'
    UNKNOWN = 'unknown'

    # Success statuses
    SUCCESS = 'success'
    SUCCEEDED = 'succeeded'
    SYNCED = 'synced'
    DELETED = 'deleted'


class WebhookEvent(models.Model):
    """WebhookEvent model."""

    triggered_at = models.DateTimeField(
        default=timezone.now,
        editable=False
    )
    data = models.JSONField()
    note = models.TextField(
        blank=True, null=True
    )
    app_name = models.CharField(
        max_length=256, null=True, blank=True
    )
    activity = models.ForeignKey(
        Activity, on_delete=models.CASCADE,
        null=True, blank=True
    )

    class Meta:  # noqa
        ordering = ('-triggered_at',)

    def __str__(self):
        """Return string representation."""
        return str(self.triggered_at)
