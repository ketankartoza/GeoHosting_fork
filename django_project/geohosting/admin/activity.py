from django.contrib import admin

from geohosting.forms.activity import CreateInstanceForm
from geohosting.models import ActivityType, ActivityTypeMapping, Activity


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    """Activity admin."""

    list_display = (
        'id', 'instance', 'activity_type', 'triggered_at',
        'status', 'jenkins_queue_url', 'note'
    )
    list_filter = ('instance', 'status')
    readonly_fields = (
        'activity_type', 'instance', 'triggered_at', 'triggered_by',
        'client_data', 'post_data', 'note', 'jenkins_queue_url'
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
