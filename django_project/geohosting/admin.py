# coding=utf-8
"""
GeoHosting Controller.

.. note:: Admins
"""
from django.contrib import admin

from geohosting.models import (
    Activity, ActivityType, Region, Product, Cluster, Instance, Package,
    WebhookEvent
)


def get_jenkins_status(modeladmin, request, queryset):
    """Return jenkins status."""
    for config in queryset:
        config.get_jenkins_status()


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    """Activity admin."""

    list_display = (
        'id', 'instance', 'activity_type', 'triggered_at', 'triggered_by',
        'status', 'client_data'
    )
    list_filter = ('instance', 'triggered_at', 'triggered_by')
    actions = [get_jenkins_status]
    readonly_fields = (
        'activity_type', 'instance', 'triggered_at', 'triggered_by',
        'client_data', 'post_data',
        'note', 'jenkins_queue_url', 'jenkins_build_url'
    )


@admin.register(ActivityType)
class ActivityTypeAdmin(admin.ModelAdmin):
    """ActivityType admin."""

    list_display = ('identifier', 'jenkins_url')


@admin.register(Cluster)
class ClusterAdmin(admin.ModelAdmin):
    """Cluster admin."""

    list_display = ('code', 'region', 'domain')


@admin.register(Instance)
class InstanceAdmin(admin.ModelAdmin):
    """Instance admin."""

    list_display = (
        'name', 'product', 'cluster', 'price', 'owner'
    )

    def product(self, obj: Instance):
        """Return product."""
        return obj.price.product.name

    def cluster(self, obj: Instance):
        """Return cluster."""
        return obj.cluster.code


class PackageInline(admin.TabularInline):
    model = Package
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'upstream_id', 'available')
    search_fields = ('name', 'upstream_id')
    inlines = [PackageInline]


@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'price', 'product', 'created_at', 'updated_at', 'package_code'
    )
    search_fields = ('name', 'product__name')
    list_filter = ('created_at', 'updated_at')


admin.site.register(Region)
admin.site.register(WebhookEvent)
