# coding=utf-8
"""
GeoHosting Controller.

.. note:: Activity
"""

import re

from django.db import models
from django.utils import timezone

from geohosting_controller.connection import request_post, request_get
from geohosting_controller.exceptions import ConnectionErrorException


class Region(models.Model):
    """Region model."""

    name = models.CharField(max_length=256)
    code = models.CharField(unique=True, max_length=256)

    def __str__(self):
        """Return region name."""
        return self.name


class Cluster(models.Model):
    """Cluster model."""

    code = models.CharField(max_length=256)
    region = models.ForeignKey(Region, on_delete=models.CASCADE)
    url = models.CharField(max_length=256, null=True, blank=True)

    def __str__(self):
        """Return region name."""
        return f'{self.code} - {self.region}'

    class Meta:  # noqa
        unique_together = ('code', 'region')


class Product(models.Model):
    """Product model."""

    name = models.CharField(max_length=256)
    code = models.CharField(unique=True, max_length=256)
    cluster = models.ForeignKey(Cluster, on_delete=models.CASCADE)

    def __str__(self):
        """Return product name."""
        return self.name


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

    @property
    def url(self):
        """Return jenkins URL."""
        return self.jenkins_url

    def __str__(self):
        """Return activity type name."""
        return self.identifier


class ActivityStatus:
    """Activity Status."""

    RUNNING = 'RUNNING'
    BUILD_JENKINS = 'BUILD_JENKINS'
    BUILD_ARGO = 'BUILD_ARGO'
    SUCCESS = 'SUCCESS'
    ERROR = 'ERROR'


class Activity(models.Model):
    """Activity of instance."""

    activity_type = models.ForeignKey(
        ActivityType, on_delete=models.CASCADE,
    )
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE,
    )
    client_data = models.JSONField(
        null=True, blank=True,
        help_text='Data received from client.'
    )
    post_data = models.JSONField(
        null=True, blank=True
    )
    triggered_at = models.DateTimeField(
        default=timezone.now,
        editable=False
    )
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
        help_text='Note about activity.'
    )

    # Jenkins data
    jenkins_queue_url = models.CharField(
        max_length=256,
        null=True, blank=True
    )
    jenkins_build_url = models.CharField(
        max_length=256,
        null=True, blank=True
    )

    class Meta:  # noqa
        verbose_name_plural = 'Activities'
        ordering = ('-triggered_at',)

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
            self.status = ActivityStatus.ERROR
            self.note = (
                'Unable to get jenkins build url, '
                f'queue API does not exist = {_url}'
            )
            self.save()

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
                            self.status = ActivityStatus.BUILD_ARGO
                            self.save()
                        elif response.json()['result'] == 'FAILURE':
                            self.status = ActivityStatus.ERROR
                            self.note = (
                                f'Error note : '
                                f'{self.jenkins_build_url}consoleText'
                            )
                            self.save()

    def run(self):
        """Run the activity."""
        try:
            response = request_post(
                url=self.activity_type.url,
                data=self.post_data
            )
            if response.status_code != 201:
                self.status = ActivityStatus.ERROR
                self.note = response.content
                self.save()
                raise ConnectionErrorException(
                    response.content, response=response
                )
            self.status = ActivityStatus.BUILD_JENKINS
            self.jenkins_queue_url = response.headers['Location']
            self.save()
            self.get_jenkins_build_url()
        except Exception as e:
            self.status = ActivityStatus.ERROR
            self.note = f'{e}'
            self.save()
            raise Exception(f'{e}')

    def save(self, *args, **kwargs):
        """Override importer saved."""
        created = not self.pk
        super(Activity, self).save(*args, **kwargs)
        if created:
            self.run()

    @staticmethod
    def is_valid(name):
        """Validate name."""
        return re.match(r'^[a-zA-Z0-9-]*$', name)


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
