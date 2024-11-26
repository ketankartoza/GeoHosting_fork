# coding=utf-8
"""GeoHosting."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedSimpleRouter

from geohosting.api.activity import (
    ActivityViewSet, ActivityTypeViewSet
)
from geohosting.api.agreement import AgreementViewSet, MyAgreementViewSet
from geohosting.api.checkout import (
    CheckoutStripeSessionAPI, CheckoutPaystackSessionAPI
)
from geohosting.api.company import CompanyViewSet
from geohosting.api.country import CountryViewSet
from geohosting.api.erp import ERPApiView
from geohosting.api.instance import InstanceViewSet
from geohosting.api.product import ProductViewSet
from geohosting.api.sales_order import (
    SalesOrderSetView, SalesOrderPaymentStripeSessionAPI,
    SalesOrderPaymentPaystackSessionAPI, CheckAppNameAPI
)
from geohosting.api.support import TicketSetView, AttachmentSetView
from geohosting.api.token import CreateToken
from geohosting.api.user import UserProfileView, ChangePasswordView
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

router = DefaultRouter()
router.register(r'agreements', MyAgreementViewSet, basename='agreements')
router.register(
    r'template/agreements', AgreementViewSet,
    basename='template-agreements'
)
router.register(r'activities', ActivityViewSet, basename='activities')
router.register(r'products', ProductViewSet)
router.register(r'companies', CompanyViewSet, basename='companies')
router.register(r'countries', CountryViewSet, basename='countries')
router.register(r'instances', InstanceViewSet, basename='instance')
router.register(r'orders', SalesOrderSetView, basename='orders')
router.register(
    r'activity_types', ActivityTypeViewSet, basename='activity_types'
)
router.register(r'tickets', TicketSetView, basename='tickets')
tickets_router = NestedSimpleRouter(
    router, r'tickets', lookup='tickets'
)
tickets_router.register(
    'attachments', AttachmentSetView, basename='ticket_attachments'
)

user_profile = [
    path(
        'change-password/',
        ChangePasswordView.as_view(),
        name='user-change-password'
    ),
    path(
        '',
        UserProfileView.as_view(),
        name='user-profile'
    ),
]

package = [
    path(
        'payment/stripe',
        CheckoutStripeSessionAPI.as_view(),
        name='checkout-stripe-session'
    ),
    path(
        'payment/paystack',
        CheckoutPaystackSessionAPI.as_view(),
        name='checkout-paystack-session'
    ),
]

order_payment = [
    path(
        'payment/stripe',
        SalesOrderPaymentStripeSessionAPI.as_view(),
        name='orders-payment-stripe-session'
    ),
    path(
        'payment/paystack',
        SalesOrderPaymentPaystackSessionAPI.as_view(),
        name='orders-payment-paystack-session'
    ),
]

api = [
    path('webhook/', WebhookView.as_view(), name='webhook-api'),
    path(
        'sync-erp-data/', ERPApiView.as_view(), name='sync-with-erp'
    ),
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
        'test-app-name/',
        CheckAppNameAPI.as_view(), name='test-app-name'
    ),
    path('package/<pk>/', include(package)),
    path('orders/<pk>/', include(order_payment)),
    path('user/profile/', include(user_profile)),
]
api += router.urls
api += tickets_router.urls

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('reset-password/',
         ResetPasswordView.as_view(), name='reset_password'),
    path('api/', include(api)),
]
