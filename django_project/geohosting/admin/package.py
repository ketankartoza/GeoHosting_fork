from django.contrib import admin

from geohosting.models import PackageGroup, Package


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
