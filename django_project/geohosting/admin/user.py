from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

from geohosting.models import (
    UserProfile, UserBillingInformation
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
    list_display = (
        "username", "email", "first_name", "last_name", "is_staff",
        "erpnext_code"
    )
    inlines = (UserProfileInline, UserBillingInformationInline)
    actions = [push_user_to_erpnext]

    def get_inline_instances(self, request, obj=None):
        if not obj:
            return []
        return super(UserAdmin, self).get_inline_instances(request, obj)

    def erpnext_code(self, obj: User):
        try:
            return obj.userprofile.erpnext_code
        except UserProfile.DoesNotExist:
            return None


admin.site.unregister(User)
admin.site.register(User, UserAdmin)
