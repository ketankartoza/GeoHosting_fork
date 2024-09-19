"""GeoHosting Controller."""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import re_path, include, path
from django.views.generic.base import RedirectView

from core.api import DjangoSettingAPI
from core.models.preferences import Preferences


class PreferencesRedirectView(RedirectView):
    """Redirect to preferences admin page."""

    permanent = False

    def get_redirect_url(self, *args, **kwargs):
        """Return absolute URL to redirect to."""
        Preferences.load()
        return '/admin/core/preferences/1/change/'


urlpatterns = [
    re_path(
        r'^admin/core/preferences/$', PreferencesRedirectView.as_view(),
        name='index'
    ),
    re_path('admin/', admin.site.urls),
    re_path('', include('geohosting.urls')),
    path(
        'api/settings',
        DjangoSettingAPI.as_view(), name='django-settings-api'
    ),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT)
