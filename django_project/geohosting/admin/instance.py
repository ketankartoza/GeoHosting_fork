from django.contrib import admin

from geohosting.models import Instance


def send_credentials(modeladmin, request, queryset):
    """Send credentials ."""
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
