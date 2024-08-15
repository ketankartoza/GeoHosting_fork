"""GeoHosting Controller."""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import re_path, include, path

from core.api import DjangoSettingAPI

urlpatterns = [
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
