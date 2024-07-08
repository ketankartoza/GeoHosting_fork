# coding=utf-8
"""GeoHosting Controller."""

from .prod import *  # noqa

DEBUG = True

# Disable caching while in development
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}
