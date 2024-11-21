from django.contrib import admin

from geohosting.models.country import Country


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'erpnext_code')
    change_list_template = 'admin/erp_change_list.html'

    def changelist_view(self, request, extra_context=None):
        """Changelist view."""
        custom_context = {
            "class_name": "Country"
        }
        extra_context = extra_context or {}
        extra_context.update(custom_context)
        return super().changelist_view(request, extra_context=extra_context)
