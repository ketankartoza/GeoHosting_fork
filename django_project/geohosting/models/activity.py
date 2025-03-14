# coding=utf-8
"""
GeoHosting.

.. note:: Activity model.
"""

import re

from django.contrib.auth import get_user_model
from django.db import models
from django.db.models import Q
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from geohosting.models.instance import Instance
from geohosting.models.log import LogTracker
from geohosting.models.package import Package
from geohosting.models.product import Product, ProductCluster
from geohosting.validators import regex_name, regex_name_error
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

    # The sales order of the activity
    sales_order = models.ForeignKey(
        'geohosting.SalesOrder',
        on_delete=models.SET_NULL,
        null=True, blank=True
    )

    class Meta:  # noqa
        verbose_name_plural = 'Activities'
        ordering = ('-triggered_at',)

    @property
    def is_creation(self):
        """Is activity creation."""
        activity = self.activity_type.identifier
        return activity == ActivityTypeTerm.CREATE_INSTANCE.value

    @property
    def is_deletion(self):
        """Is activity creation."""
        activity = self.activity_type.identifier
        return activity == ActivityTypeTerm.DELETE_INSTANCE.value

    def success(self):
        """Success."""
        if self.instance:
            if self.is_creation:
                self.instance.starting_up()
            elif self.is_deletion:
                self.instance.deleted()

    def error(self):
        """Error."""
        if not self.is_deletion:
            if self.instance:
                self.instance.offline()

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

        # Do some function when success
        if self.status == ActivityStatus.SUCCESS:
            self.success()
        if self.status == ActivityStatus.ERROR:
            self.error()

    def execute(self):
        """Execute script."""
        if self.is_creation:
            # Create instance when jenkins communication is ok
            self.create_instance()
        elif self.is_deletion:
            # Delete instance
            self.delete_instance()

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
            self.execute()
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
            self.execute()

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
                try:
                    company = self.sales_order.company
                except Exception:
                    company = None
                instance = Instance.objects.create(
                    name=self.client_data['app_name'],
                    price=price,
                    cluster=cluster,
                    owner=self.triggered_by,
                    company=company
                )
                self.instance = instance
                self.save()

    def delete_instance(self):
        """Delete instance."""
        if self.jenkins_queue_url:
            LogTracker.success(self, 'DELETING')
            self.instance.deleting()

    @staticmethod
    def running_activities(app_name):
        """Return running activities."""
        return Activity.objects.filter(client_data__app_name=app_name).exclude(
            Q(status=ActivityStatus.ERROR) |
            Q(status=ActivityStatus.SUCCESS)
        )


@receiver(post_save, sender=Activity)
def save_instance_to_sales_order(sender, instance, created, **kwargs):
    """Save instance to sales order on post save."""
    if instance.instance and not instance.instance.created_at:
        instance.instance.created_at = instance.triggered_at
        instance.instance.modified_at = instance.triggered_at
        instance.instance.save()

    if instance.instance and instance.sales_order:
        instance.sales_order.instance = instance.instance
        instance.sales_order.save()
