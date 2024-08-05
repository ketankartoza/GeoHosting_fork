"""GeoHosting Controller."""

from django.conf import settings


def sentry_dsn(request):
    """Return sentry dsn for context processor."""
    return {
        'SENTRY_DSN': settings.SENTRY_DSN
    }


def stripe(request):
    """Return stripe keys for context processor."""
    return {
        'STRIPE_PUBLISHABLE_KEY': settings.STRIPE_PUBLISHABLE_KEY
    }
