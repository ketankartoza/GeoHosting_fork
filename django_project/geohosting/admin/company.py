from django.contrib import admin, messages

from geohosting.models import Company, CompanyContact


@admin.action(description="Push to erpnext")
def push_user_to_erpnext(modeladmin, request, queryset):
    for obj in queryset:
        result = obj.post_to_erpnext()
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


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    """Company admin."""

    list_display = ('name', 'erpnext_code')
    actions = (push_user_to_erpnext,)


@admin.register(CompanyContact)
class CompanyContactAdmin(admin.ModelAdmin):
    """Company Contact admin."""

    list_display = ('company', 'user', 'erpnext_code')
    list_filter = ('company', 'user')
    search_fields = ('erpnext_code',)
    actions = (push_user_to_erpnext,)
