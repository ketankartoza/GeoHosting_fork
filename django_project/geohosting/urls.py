# coding=utf-8
"""GeoHosting."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from geohosting.api.activity import (
    ActivityViewSet, ActivityTypeViewSet
)
from geohosting.api.token import CreateToken
from geohosting.api.webhook import WebhookView
from geohosting.views.home import HomeView

router = DefaultRouter()
router.register(
    r'activities', ActivityViewSet, basename='activities'
)

router.register(
    r'activity_types', ActivityTypeViewSet, basename='activity_types'
)

api = [
    path('webhook/', WebhookView.as_view(), name='webhook-api'),
    path('token/create', CreateToken.as_view(), name='create-token'),
]
api += router.urls

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('api/', include(api)),
]
