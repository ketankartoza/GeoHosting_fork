from django.contrib import admin

from geohosting.models import (
    WebhookEvent
)


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    list_display = (
        'triggered_at', 'data', 'note'
    )
