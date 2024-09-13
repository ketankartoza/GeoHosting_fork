# coding=utf-8
"""
GeoHosting.

.. note:: Activity model.
"""

import re

from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator
from django.db import models
from django.utils import timezone

from geohosting.models.instance import Instance
from geohosting.models.product import Product
from geohosting_controller.connection import request_post, request_get
from geohosting_controller.exceptions import (
    ConnectionErrorException, ActivityException
)

User = get_user_model()


class ActivityType(models.Model):
    """Activity type contains URL."""

    identifier = models.CharField(
        unique=True,
        max_length=256,
        help_text='Activity type.'
    )
    jenkins_url = models.CharField(
        max_length=256,
        help_text=(
            'Jenkins URL based on identifier and product (optional).'
        )
    )
    product = models.ForeignKey(
        Product, on_delete=models.SET_NULL,
        null=True, blank=True
    )

    @property
    def url(self):
        """Return jenkins URL."""
        return self.jenkins_url

    def __str__(self):
        """Return activity type name."""
        return self.identifier

    class Meta:  # noqa
        verbose_name = 'Jenkins Activity Type'

    def mapping_data(self, data: dict):
        """Map data."""
        new_data = {}
        for key, value in data.items():
            try:
                jenkins_key = self.activitytypemapping_set.get(
                    geohosting_key=key
                ).jenkins_key
                new_data[jenkins_key] = value
            except ActivityTypeMapping.DoesNotExist:
                pass
        return new_data


class ActivityTypeMapping(models.Model):
    """Mapping between GeoHosting json to jenkins payload."""

    activity_type = models.ForeignKey(
        ActivityType, on_delete=models.CASCADE
    )
    geohosting_key = models.CharField(
        max_length=256
    )
    jenkins_key = models.CharField(
        max_length=256
    )


class ActivityStatus:
    """Activity Status."""

    RUNNING = 'RUNNING'
    BUILD_JENKINS = 'BUILD_JENKINS'
    BUILD_ARGO = 'BUILD_ARGO'
    SUCCESS = 'SUCCESS'
    ERROR = 'ERROR'


regex_name = r'^[a-zA-Z0-9-]*$'
regex_name_error = 'Instance name just contains letter, number and dash'
name_validator = RegexValidator(regex_name, regex_name_error)


class Activity(models.Model):
    """Activity of instance."""

    activity_type = models.ForeignKey(
        ActivityType, on_delete=models.CASCADE,
    )
    instance = models.ForeignKey(
        Instance, on_delete=models.SET_NULL,
        null=True, blank=True, editable=False
    )

    # Creation metadata
    triggered_at = models.DateTimeField(
        default=timezone.now,
        editable=False
    )
    triggered_by = models.ForeignKey(
        User, on_delete=models.CASCADE, editable=False
    )

    # Data metadata
    client_data = models.JSONField(
        null=True, blank=True,
        help_text='Data received from client.', editable=False
    )
    post_data = models.JSONField(
        null=True, blank=True,
        help_text='Data posted to jenkins.', editable=False
    )

    # Jenkins metadata
    status = models.CharField(
        default=ActivityStatus.RUNNING,
        choices=(
            (ActivityStatus.RUNNING, ActivityStatus.RUNNING),
            (ActivityStatus.BUILD_JENKINS, ActivityStatus.BUILD_JENKINS),
            (ActivityStatus.BUILD_ARGO, ActivityStatus.BUILD_ARGO),
            (ActivityStatus.ERROR, ActivityStatus.ERROR),
            (ActivityStatus.SUCCESS, ActivityStatus.SUCCESS),
        ),
        max_length=256,
        help_text='The status of activity.'
    )
    note = models.TextField(
        null=True, blank=True,
        help_text='Note about activity.', editable=False
    )
    jenkins_queue_url = models.CharField(
        max_length=256,
        null=True, blank=True, editable=False
    )
    jenkins_build_url = models.CharField(
        max_length=256,
        null=True, blank=True, editable=False
    )

    # The sales order of the activity
    sales_order = models.ForeignKey(
        'geohosting.SalesOrder',
        on_delete=models.SET_NULL,
        null=True, blank=True
    )

    class Meta:  # noqa
        verbose_name_plural = 'Activities'
        ordering = ('-triggered_at',)

    def update_status(self, status, note=None):
        """Update activity status."""
        from geohosting.models.sales_order import SalesOrderStatus
        self.status = status
        if note:
            self.note = note
        self.save()
        if self.sales_order:
            comment = f'Auto deployment: {self.status}.'
            if self.note:
                comment += f'\n{self.note}'
            self.sales_order.add_comment(comment)
            if self.status == ActivityStatus.SUCCESS:
                self.sales_order.order_status = SalesOrderStatus.DEPLOYED.key
                self.sales_order.save()

    def get_jenkins_build_url(self):
        """Get jenkins build url."""
        # We need to run this on the background
        _url = self.jenkins_queue_url + 'api/json'
        response = request_get(
            url=_url
        )
        if response.status_code == 200:
            try:
                self.jenkins_build_url = response.json()['executable']['url']
                self.save()
                self.get_jenkins_status()
            except KeyError:
                pass
        else:
            self.update_status(
                ActivityStatus.ERROR,
                (
                    'Unable to get jenkins build url, '
                    f'queue API does not exist = {_url}'
                )
            )

    def get_jenkins_status(self):
        """Get jenkins status."""
        if self.status == ActivityStatus.BUILD_JENKINS:
            if not self.jenkins_build_url:
                self.get_jenkins_build_url()
            if self.jenkins_build_url:
                response = request_get(url=self.jenkins_build_url + 'api/json')
                if response.status_code == 200:
                    if not response.json()['inProgress']:
                        if response.json()['result'] == 'SUCCESS':
                            self.update_status(ActivityStatus.BUILD_ARGO)
                        elif response.json()['result'] == 'FAILURE':
                            self.update_status(
                                ActivityStatus.ERROR, (
                                    f'Error note : '
                                    f'{self.jenkins_build_url}consoleText'
                                )
                            )

    def run(self):
        """Run the activity."""
        try:
            response = request_post(
                url=self.activity_type.url,
                data=self.post_data
            )
            if response.status_code != 201:
                self.update_status(
                    ActivityStatus.ERROR, response.content
                )
                raise ConnectionErrorException(
                    response.content, response=response
                )
            self.jenkins_queue_url = response.headers['Location']
            self.update_status(ActivityStatus.BUILD_JENKINS)
            self.get_jenkins_build_url()
        except Exception as e:
            self.update_status(
                ActivityStatus.ERROR, f'{e}'
            )

    def save(self, *args, **kwargs):
        """Override importer saved."""
        created = not self.pk
        super(Activity, self).save(*args, **kwargs)
        if created:
            self.update_status(ActivityStatus.RUNNING)
            self.run()

    @staticmethod
    def test_name(name):
        """Validate name."""
        if not re.match(regex_name, name):
            raise ActivityException(regex_name_error)
