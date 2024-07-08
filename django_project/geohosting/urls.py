# coding=utf-8
"""GeoHosting."""
from django.urls import path

from geohosting.views.home import HomeView

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
]
