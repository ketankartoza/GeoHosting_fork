"""
GeoHosting Controller.

.. note:: Admins
"""

from django.contrib import admin

from geohosting.models.support import Ticket


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    """Ticket admin."""

    list_display = (
        'id', 'erpnext_code', 'customer', 'subject', 'status', 'created_at',
        'updated_at'
    )
    list_filter = ('status', 'created_at', 'updated_at')
    search_fields = ('customer', 'subject', 'details')
    readonly_fields = ('created_at', 'updated_at')

    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing an existing object
            return self.readonly_fields + ('customer',)
        return self.readonly_fields
