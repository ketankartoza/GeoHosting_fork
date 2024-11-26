from django.contrib import admin

from geohosting.models.agreement import (
    Agreement, AgreementDetail, SalesOrderAgreement
)


class AgreementDetailInline(admin.TabularInline):
    model = AgreementDetail
    extra = 1
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Agreement)
class AgreementAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
    inlines = [AgreementDetailInline]


@admin.register(AgreementDetail)
class AgreementDetailAdmin(admin.ModelAdmin):
    list_display = ('agreement', 'version')
    list_filter = ('agreement',)


@admin.register(SalesOrderAgreement)
class SalesOrderAgreementAdmin(admin.ModelAdmin):
    list_display = ('sales_order', 'agreement_detail')
    filter = ('sales_order',)
