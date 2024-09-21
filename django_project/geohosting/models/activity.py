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
from geohosting.models.package import Package
from geohosting.models.product import Product, ProductCluster
from geohosting_controller.connection import request_post
from geohosting_controller.exceptions import (
    ConnectionErrorException, ActivityException
)
from geohosting_controller.variables import ActivityTypeTerm

User = get_user_model()


class ActivityType(models.Model):
    """Activity type contains URL."""

    identifier = models.CharField(
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
        unique_together = ('identifier', 'product')

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

        # Update instance status
        if self.instance:
            if self.status == ActivityStatus.SUCCESS:
                self.instance.online()
            if self.status == ActivityStatus.ERROR:
                self.instance.offline()

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
            self.update_status(ActivityStatus.BUILD_ARGO)

            # Create instance when jenkins communication is ok
            self.create_instance()
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
        else:
            # Create instance when activity is not created
            self.create_instance()

    @staticmethod
    def test_name(name):
        """Validate name."""
        if not re.match(regex_name, name):
            raise ActivityException(regex_name_error)

    def create_instance(self):
        """Create activity."""
        if not self.instance and self.jenkins_queue_url:
            if self.sales_order:
                price = self.sales_order.package
            else:
                price = Package.objects.filter(
                    package_group__package_code=self.client_data[
                        'package_code'
                    ]
                ).first()

            if (
                    self.activity_type.identifier ==
                    ActivityTypeTerm.CREATE_INSTANCE.value
            ):
                product_cluster_id = self.client_data['product_cluster_id']
                product_cluster = ProductCluster.objects.get(
                    id=product_cluster_id
                )
                cluster = product_cluster.cluster
                instance = Instance.objects.create(
                    name=self.client_data['app_name'],
                    price=price,
                    cluster=cluster,
                    owner=self.triggered_by
                )
                self.instance = instance
                self.save()
