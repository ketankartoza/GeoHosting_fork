# coding=utf-8
"""
GeoHosting Controller.

.. note:: Admins
"""
from django.contrib import admin

from geohosting.forms.activity import CreateInstanceForm
from geohosting.models import (
    Activity, ActivityType, Region, Product, Cluster, ProductCluster,
    Instance, Package, WebhookEvent, ProductMedia
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
        'client_data', 'post_data', 'note', 'jenkins_queue_url',
        'jenkins_build_url'
    )

    def has_add_permission(*args, **kwargs):
        return False


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

    def has_add_permission(*args, **kwargs):
        return False

    def has_change_permission(*args, **kwargs):
        return True

    def product(self, obj: Instance):
        """Return product."""
        return obj.price.product.name

    def cluster(self, obj: Instance):
        """Return cluster."""
        return obj.cluster.code


class PackageInline(admin.TabularInline):
    model = Package
    extra = 1


class ProductMediaInline(admin.TabularInline):
    model = ProductMedia
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'upstream_id', 'available')
    search_fields = ('name', 'upstream_id')
    inlines = [PackageInline, ProductMediaInline]


@admin.register(ProductCluster)
class ProductClusterAdmin(admin.ModelAdmin):
    list_display = ('product', 'cluster')
    list_filter = ('product', 'cluster')


@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'price', 'product', 'created_at', 'updated_at', 'package_code'
    )
    search_fields = ('name', 'product__name')
    list_filter = ('created_at', 'updated_at')


admin.site.register(Region)
admin.site.register(WebhookEvent)


# --------------------------------------
# Activity forms
# --------------------------------------
class ActivityCreateInstance(Activity):
    class Meta:
        proxy = True


@admin.register(ActivityCreateInstance)
class ActivityCreateInstanceForm(admin.ModelAdmin):
    """Create instance from activity."""

    add_form_template = None
    add_form = CreateInstanceForm

    def get_form(self, request, obj=None, **kwargs):
        """Get form of admin."""
        if not obj:
            self.form = self.add_form
        form = super(
            ActivityCreateInstanceForm, self
        ).get_form(request, obj, **kwargs)
        form.user = request.user
        return form

    def has_change_permission(self, request, obj=None):
        """Return change permission."""
        return False

    def has_delete_permission(self, request, obj=None):
        """Return delete permission."""
        return False

    def has_view_permission(self, request, obj=None):
        """Return view permission."""
        return False
