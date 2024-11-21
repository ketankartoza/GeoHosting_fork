from django.contrib import admin

from geohosting.models import (
    Product, ProductMetadata, Package, ProductMedia, ProductCluster
)


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


@admin.register(ProductCluster)
class ProductClusterAdmin(admin.ModelAdmin):
    list_display = ('product', 'cluster')
    list_filter = ('product', 'cluster')
