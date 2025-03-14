from django.contrib import admin

from geohosting.models import (
    WebhookEvent
)


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    """WebhookEvent admin."""

    list_display = (
        'triggered_at', 'data', 'sync_status', 'note'
    )

    def sync_status(self, obj: WebhookEvent):
        """Return logs."""
        try:
            return obj.data['Sync Status']
        except Exception:
            return ''
