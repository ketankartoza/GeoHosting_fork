# coding=utf-8
"""
GeoHosting.

.. note:: Log tracker.
"""
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models


class LogTracker(models.Model):
    """Log tracker."""

    ERROR = 'error'
    SUCCESS = 'success'
    TYPE_CHOICES = [
        (ERROR, 'Error'),
        (SUCCESS, 'Success'),
    ]

    content_type = models.ForeignKey(
        ContentType, on_delete=models.CASCADE
    )
    object_id = models.PositiveIntegerField()
    object = GenericForeignKey(
        'content_type', 'object_id'
    )

    type = models.CharField(
        max_length=20, choices=TYPE_CHOICES
    )
    note = models.TextField(
        blank=True, null=True
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ['-created_at']

    @staticmethod
    def _create_log(instance, log_type, note=""):
        """Create log tracker."""
        content_type = ContentType.objects.get_for_model(instance)
        LogTracker.objects.create(
            content_type=content_type,
            object_id=instance.pk,
            type=log_type,
            note=note
        )

    @staticmethod
    def success(instance, note=''):
        """Create log for failed process."""
        LogTracker._create_log(instance, LogTracker.SUCCESS, note)

    @staticmethod
    def error(instance, note):
        """Create log for failed process."""
        LogTracker._create_log(instance, LogTracker.ERROR, note)
