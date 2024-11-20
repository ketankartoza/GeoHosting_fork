"""GeoHosting Controller."""

import os

from django.conf import settings

from core.models.preferences import Preferences, SiteType
from core.settings.utils import absolute_path


def project_version(request):
    """Read project version from file."""
    folder = absolute_path('')
    version = ''
    version_file = os.path.join(folder, '_version.txt')
    if os.path.exists(version_file):
        version += (open(version_file, 'rb').read()).decode("utf-8")
    pref = Preferences.load()

    # If not production, show commit
    if pref.site_type != SiteType.PRODUCTION:
        commit_file = os.path.join(folder, '_commit_hash.txt')
        if os.path.exists(commit_file):
            commit = (open(commit_file, 'rb').read()).decode("utf-8")[:5]
            if commit:
                version += '-' + commit
    return {
        'version': version
    }


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
