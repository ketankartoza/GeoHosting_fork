from django.contrib import admin

from geohosting.models.erp import ErpRequestLog
from geohosting.models.erp_company import ErpCompany


@admin.register(ErpRequestLog)
class ErpRequestLogAdmin(admin.ModelAdmin):
    list_display = (
        'url', 'method', 'request_at'
    )


@admin.register(ErpCompany)
class ErpCompanyAdmin(admin.ModelAdmin):
    change_list_template = 'admin/erp_change_list.html'
    list_display = (
        'erpnext_code', 'name', 'default_currency', 'payment_method'
    )
    list_editable = (
        'payment_method',
    )

    def changelist_view(self, request, extra_context=None):
        """Changelist view."""
        custom_context = {
            "class_name": "ErpCompany"
        }
        extra_context = extra_context or {}
        extra_context.update(custom_context)
        return super().changelist_view(request, extra_context=extra_context)
