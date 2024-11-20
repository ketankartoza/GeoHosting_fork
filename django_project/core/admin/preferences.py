# coding=utf-8
"""
GeoHosting.

.. note:: Admin Preferences

"""

from django.contrib import admin
from django.contrib.admin.sites import NotRegistered

from core.models.preferences import Preferences

try:
    admin.site.unregister(Preferences)
except NotRegistered:
    pass

test_fields = (
    'erp_next_test',
    'proxy_test',
    'stripe_test',
    'paystack_test',
    'vault_test'
)


@admin.register(Preferences)
class PreferencesAdmin(admin.ModelAdmin):
    """Preferences Admin."""

    fieldsets = (
        (None, {
            'fields': ('site_type',)
        }),
        ('Tests', {
            'fields': test_fields
        }),
    )
    readonly_fields = test_fields
