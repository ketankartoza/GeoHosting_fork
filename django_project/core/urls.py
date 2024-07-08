"""GeoHosting Controller."""
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import re_path, include
from django.conf import settings

urlpatterns = [
    re_path('admin/', admin.site.urls),
    re_path('', include('geohosting_controller.urls')),
    re_path('', include('geohosting.urls')),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT)
