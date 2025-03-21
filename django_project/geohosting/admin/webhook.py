from django.contrib import admin
from django.utils.safestring import mark_safe

from geohosting.models import WebhookEvent


def clean_webhook_event(modeladmin, request, queryset):
    """Clean webhook event."""
    WebhookEvent.objects.filter(activity__isnull=True).delete()


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    """WebhookEvent admin."""

    list_display = (
        'triggered_at', 'data', 'sync_status', 'note',
        'activity_link', 'instance_link'
    )
    search_fields = ('data__app_name',)
    actions = (clean_webhook_event,)

    def sync_status(self, obj: WebhookEvent):
        """Return logs."""
        try:
            return obj.data['Status']
        except KeyError:
            return ''

    def activity_link(self, obj: WebhookEvent):
        """Return activity l."""
        if not obj.activity:
            return ''
        return mark_safe(
            '<a href="/admin/geohosting/activity/'
            f'?id__exact={obj.activity.id}" '
            'target="_blank">link</a>'
        )

    def instance_link(self, obj: WebhookEvent):
        """Return instance link."""
        if not obj.activity or not obj.activity.instance:
            return ''
        return mark_safe(
            '<a href="/admin/geohosting/instance/'
            f'?id__exact={obj.activity.instance.id}" '
            'target="_blank">link</a>'
        )
