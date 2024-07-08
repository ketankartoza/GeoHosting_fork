# coding=utf-8
"""
GeoHosting Controller.

.. note:: Admins
"""
from django.contrib import admin

from geohosting_controller.models import (
    Activity, ActivityType, Region, Product, Cluster, Instance
)


def get_jenkins_status(modeladmin, request, queryset):
    """Return jenkins status."""
    for config in queryset:
        config.get_jenkins_status()


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    """Activity admin."""

    list_display = (
        'id', 'product', 'activity_type', 'triggered_at', 'triggered_by',
        'status'
    )
    actions = [get_jenkins_status]

    def triggered_by(self, obj: Activity):
        """Get user_email from data."""
        try:
            return obj.client_data['user_email']
        except KeyError:
            return None


@admin.register(ActivityType)
class ActivityTypeAdmin(admin.ModelAdmin):
    """ActivityType admin."""

    list_display = ('identifier', 'jenkins_url')


@admin.register(Cluster)
class ClusterAdmin(admin.ModelAdmin):
    """Cluster admin."""

    list_display = ('code', 'region', 'url')


@admin.register(Instance)
class InstanceAdmin(admin.ModelAdmin):
    """Instance admin."""

    list_display = (
        'name', 'product', 'cluster', 'package_id', 'owner_email'
    )

    def product(self, obj: Instance):
        """Return product."""
        return obj.product.name

    def cluster(self, obj: Instance):
        """Return cluster."""
        return obj.cluster.code


admin.site.register(Region)
admin.site.register(Product)
