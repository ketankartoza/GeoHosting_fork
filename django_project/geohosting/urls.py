# coding=utf-8
"""GeoHosting."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from geohosting.api.activity import (
    ActivityViewSet, ActivityTypeViewSet
)
from geohosting.api.checkout import CheckoutStripeSessionAPI
from geohosting.api.product import ProductViewSet
from geohosting.api.sales_order import SalesOrderSetView
from geohosting.api.token import CreateToken
from geohosting.api.webhook import WebhookView
from geohosting.views.auth import (
    CustomAuthToken,
    logout,
    ValidateTokenView,
    RegisterView,
    PasswordResetView,
    PasswordResetConfirmView
)
from geohosting.views.home import HomeView
from geohosting.views.products import fetch_products
from geohosting.views.reset_password import ResetPasswordView
from geohosting.views.support import create_ticket, upload_attachments

router = DefaultRouter()
router.register(r'activities', ActivityViewSet, basename='activities')
router.register(r'products', ProductViewSet)
router.register(r'orders', SalesOrderSetView, basename='orders')
router.register(
    r'activity_types', ActivityTypeViewSet, basename='activity_types'
)

api = [
    path('webhook/', WebhookView.as_view(), name='webhook-api'),
    path('fetch-products/',
         fetch_products,
         name='fetch_products'),
    path('token/create',
         CreateToken.as_view(), name='create-token'),
    path('auth/login/',
         CustomAuthToken.as_view(), name='api_login'),
    path('auth/register/',
         RegisterView.as_view(), name='register'),
    path('auth/logout/', logout, name='api_logout'),
    path('auth/reset-password/',
         PasswordResetView.as_view(),
         name='reset_password'),
    path(
        'auth/password-reset-confirm/',
        PasswordResetConfirmView.as_view(),
        name='password_reset_confirm'),
    path('auth/validate-token/',
         ValidateTokenView.as_view(), name='validate-token'),
    path(
        'package/<pk>/checkout/stripe',
        CheckoutStripeSessionAPI.as_view(),
        name='checkout_session'
    ),
    path('support/tickets/', create_ticket, name='create_ticket'),
    path(
        'support/tickets/<int:ticket_id>/attachments/',
        upload_attachments,
        name='upload_attachments'
    ),
]
api += router.urls

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('reset-password/',
         ResetPasswordView.as_view(), name='reset_password'),
    path('api/', include(api)),
]
