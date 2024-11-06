# coding=utf-8
"""
GeoHosting.

.. note:: Model for ERP.
"""

from django.db import models
from django.utils.timezone import now


class RequestMethod:
    """Request method."""

    GET = 'GET'
    POST = 'POST'
    PUT = 'PUT'


class ErpRequestLog(models.Model):
    """Log for erp request."""

    url = models.TextField()
    method = models.CharField(
        choices=(
            (RequestMethod.GET, RequestMethod.GET),
            (RequestMethod.POST, RequestMethod.POST),
            (RequestMethod.PUT, RequestMethod.PUT),
        )
    )
    data = models.JSONField(
        null=True, blank=True
    )
    request_at = models.DateTimeField(
        default=now,
        verbose_name='Order Date'
    )
    response_code = models.IntegerField(
        null=True, blank=True
    )
    response_text = models.TextField(
        null=True, blank=True
    )
