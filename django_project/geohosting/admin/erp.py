from django.contrib import admin

from geohosting.models.erp import ErpRequestLog


@admin.register(ErpRequestLog)
class ErpRequestLogAdmin(admin.ModelAdmin):
    list_display = (
        'url', 'method', 'request_at'
    )
