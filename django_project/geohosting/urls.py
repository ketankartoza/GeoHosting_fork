# coding=utf-8
"""GeoHosting."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from geohosting.api.activity import (
    ActivityViewSet, ActivityTypeViewSet
)
from geohosting.api.token import CreateToken
from geohosting.api.webhook import WebhookView
from geohosting.views.auth import CustomAuthToken, logout, ValidateTokenView
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
    path('auth/login/', CustomAuthToken.as_view(), name='api_login'),
    path('auth/logout/', logout, name='api_logout'),
    path('auth/validate-token/',
         ValidateTokenView.as_view(), name='validate-token'),
]
api += router.urls

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('api/', include(api)),
]
