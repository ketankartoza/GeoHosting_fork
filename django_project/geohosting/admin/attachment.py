from django.contrib import admin

from geohosting.models.support import Attachment


def send_attachment(modeladmin, request, queryset):
    """Send attachment to erpnext."""
    for config in queryset:
        config.post_to_erpnext()


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    """Attachment admin."""

    list_display = ('id', 'ticket', 'file', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('ticket__subject', 'ticket__customer')
    readonly_fields = ('uploaded_at',)
    actions = (send_attachment,)
