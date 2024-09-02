# coding=utf-8
"""GeoHosting."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from geohosting.api.activity import (
    ActivityViewSet, ActivityTypeViewSet
)
from geohosting.api.checkout import (
    CheckoutStripeSessionAPI, CheckoutPaystackSessionAPI
)
from geohosting.api.product import ProductViewSet
from geohosting.api.sales_order import (
    SalesOrderSetView, SalesOrderPaymentStripeSessionAPI,
    SalesOrderPaymentPaystackSessionAPI
)
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
from geohosting.views.support import (
    get_tickets,
    create_ticket,
    upload_attachments
)

router = DefaultRouter()
router.register(r'activities', ActivityViewSet, basename='activities')
router.register(r'products', ProductViewSet)
router.register(r'orders', SalesOrderSetView, basename='orders')
router.register(
    r'activity_types', ActivityTypeViewSet, basename='activity_types'
)

package = [
    path(
        '<pk>/payment/stripe',
        CheckoutStripeSessionAPI.as_view(),
        name='checkout-stripe-session'
    ),
    path(
        '<pk>/payment/paystack',
        CheckoutPaystackSessionAPI.as_view(),
        name='checkout-paystack-session'
    ),
]

order_payment = [
    path(
        '<pk>/payment/stripe',
        SalesOrderPaymentStripeSessionAPI.as_view(),
        name='orders-payment-stripe-session'
    ),
    path(
        '<pk>/payment/paystack',
        SalesOrderPaymentPaystackSessionAPI.as_view(),
        name='orders-payment-paystack-session'
    ),
]

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
    path('support/tickets/', get_tickets, name='get_tickets'),
    path(
        'support/tickets/create/',
        create_ticket,
        name='create_ticket'
    ),
    path(
        'support/tickets/<int:ticket_id>/attachments/',
        upload_attachments,
        name='upload_attachments'
    ),
    path('package/', include(package)),
    path('orders/', include(order_payment)),
]
api += router.urls

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('reset-password/',
         ResetPasswordView.as_view(), name='reset_password'),
    path('api/', include(api)),
]
