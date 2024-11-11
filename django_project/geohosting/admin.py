# coding=utf-8
"""
GeoHosting Controller.

.. note:: Admins
"""

from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from django.utils.safestring import mark_safe

from geohosting.forms.activity import CreateInstanceForm
from geohosting.models import (
    Activity, ActivityType, ActivityTypeMapping, Region, Product, PackageGroup,
    ProductMetadata,
    Cluster, ProductCluster, Instance, Package, WebhookEvent, ProductMedia,
    SalesOrder, UserProfile, UserBillingInformation
)
from geohosting.models.erp import ErpRequestLog
from geohosting.models.support import Ticket, Attachment


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    """Ticket admin."""

    list_display = (
        'id', 'erpnext_code', 'customer', 'subject', 'status', 'created_at',
        'updated_at'
    )
    list_filter = ('status', 'created_at', 'updated_at')
    search_fields = ('customer', 'subject', 'details')
    readonly_fields = ('created_at', 'updated_at')

    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing an existing object
            return self.readonly_fields + ('customer',)
        return self.readonly_fields


def send_attachment(modeladmin, request, queryset):
    """Return jenkins status."""
    for config in queryset:
        config.post_to_erpnext()


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    """Attachment admin."""

    list_display = ('id', 'ticket', 'file', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('ticket__subject', 'ticket__customer')
    readonly_fields = ('uploaded_at',)
    actions = (send_attachment,)


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    """Activity admin."""

    list_display = (
        'id', 'instance', 'activity_type', 'triggered_at', 'triggered_by',
        'status', 'note'
    )
    list_filter = ('instance', 'triggered_at', 'triggered_by')
    readonly_fields = (
        'activity_type', 'instance', 'triggered_at', 'triggered_by',
        'client_data', 'post_data', 'note', 'jenkins_queue_url',
        'jenkins_build_url'
    )

    def has_add_permission(*args, **kwargs):
        return False


class ActivityTypeMappingInline(admin.TabularInline):
    model = ActivityTypeMapping
    extra = 1


@admin.register(ActivityType)
class ActivityTypeAdmin(admin.ModelAdmin):
    """ActivityType admin."""

    list_display = ('identifier', 'jenkins_url', 'product')
    inlines = (ActivityTypeMappingInline,)


@admin.register(Cluster)
class ClusterAdmin(admin.ModelAdmin):
    """Cluster admin."""

    list_display = ('code', 'region', 'domain')


def send_credentials(modeladmin, request, queryset):
    """Return jenkins status."""
    for config in queryset:
        config.send_credentials()


@admin.register(Instance)
class InstanceAdmin(admin.ModelAdmin):
    """Instance admin."""

    list_display = (
        'name', 'product', 'cluster', 'price', 'owner', 'status'
    )
    actions = (send_credentials,)

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


class ProductMetadataInline(admin.TabularInline):
    model = ProductMetadata
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    change_list_template = 'admin/product_change_list.html'
    list_display = ('name', 'upstream_id', 'available')
    search_fields = ('name', 'upstream_id')
    inlines = [PackageInline, ProductMediaInline, ProductMetadataInline]


@admin.action(description="Publish sales order")
def publish_sales_order(modeladmin, request, queryset):
    for sales_order in queryset:
        result = sales_order.post_to_erpnext()
        if result['status'] == 'success':
            messages.add_message(
                request,
                messages.SUCCESS,
                'Published')

        else:
            messages.add_message(
                request,
                messages.ERROR,
                result['message']
            )


def update_payment_status(modeladmin, request, queryset):
    """Update order status."""
    for order in queryset.filter():
        order.update_payment_status()


@admin.action(description="Auto deploy")
def auto_deploy(modeladmin, request, queryset):
    for sales_order in queryset:
        sales_order.auto_deploy()


@admin.register(SalesOrder)
class SalesOrderAdmin(admin.ModelAdmin):
    list_display = (
        'date', 'package', 'customer', 'order_status', 'payment_method',
        'erpnext_code', 'activities'
    )
    list_filter = ('order_status', 'payment_method')
    search_fields = ('erpnext_code',)
    actions = [publish_sales_order, update_payment_status, auto_deploy]

    def activities(self, obj: Instance):
        """Return product."""
        return mark_safe(
            f'<a href="/admin/geohosting/activity/?'
            f'sales_order__id__exact={obj.id}" target="_blank"'
            f'>activities</a>'
        )


@admin.register(ProductCluster)
class ProductClusterAdmin(admin.ModelAdmin):
    list_display = ('product', 'cluster')
    list_filter = ('product', 'cluster')


@admin.action(description="Create stripe price")
def create_stripe_price(modeladmin, request, queryset):
    for package in queryset:
        package.get_stripe_price_id()


@admin.action(description="Create paystack price")
def create_paystack_price(modeladmin, request, queryset):
    for package in queryset:
        package.get_paystack_price_id()


@admin.register(PackageGroup)
class PackageGroupAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'package_code', 'vault_url'
    )
    list_editable = ('package_code', 'vault_url')


@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'price', 'price_list', 'currency', 'product', 'package_group',
        'stripe_id', 'paystack_id'
    )
    search_fields = ('name', 'product__name')
    list_filter = ('created_at', 'updated_at')
    actions = [create_stripe_price, create_paystack_price]


admin.site.register(Region)


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    list_display = (
        'triggered_at', 'data', 'note'
    )


@admin.action(description="Push to erpnext")
def push_user_to_erpnext(modeladmin, request, queryset):
    for user in queryset:
        user_profile, created = (
            UserProfile.objects.get_or_create(user=user)
        )
        result = user_profile.post_to_erpnext()
        if result['status'] == 'success':
            messages.add_message(
                request,
                messages.SUCCESS,
                'Published')
        else:
            messages.add_message(
                request,
                messages.ERROR,
                result['message']
            )


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'user profiles'


class UserBillingInformationInline(admin.StackedInline):
    model = UserBillingInformation
    can_delete = False


class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline, UserBillingInformationInline)
    actions = [push_user_to_erpnext]

    def get_inline_instances(self, request, obj=None):
        if not obj:
            return []
        return super(UserAdmin, self).get_inline_instances(request, obj)


admin.site.unregister(User)
admin.site.register(User, UserAdmin)


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


@admin.register(ErpRequestLog)
class ErpRequestLogAdmin(admin.ModelAdmin):
    list_display = (
        'url', 'method', 'request_at'
    )
