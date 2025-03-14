from django.contrib import admin
from django.contrib.contenttypes.models import ContentType
from django.utils.safestring import mark_safe

from geohosting.models import LogTracker


@admin.register(LogTracker)
class LogTrackerAdmin(admin.ModelAdmin):
    """LogTracker admin."""

    list_display = (
        'created_at', 'content_type', 'object_id', 'type', 'note'
    )
    list_filter = ('type', 'created_at', 'content_type')

    def has_add_permission(*args, **kwargs):
        """Can't add log tracker."""
        return False


class LogTrackerObjectAdmin(admin.ModelAdmin):
    """Log tracker object admin."""

    def logs(self, instance):
        """Return logs."""
        content_type = ContentType.objects.get_for_model(instance)
        return mark_safe(
            '<a href="/admin/geohosting/logtracker/?'
            f'object_id__exact={instance.id}&'
            f'content_type__id__exact={content_type.id}" '
            'target="_blank">logs</a>'
        )
