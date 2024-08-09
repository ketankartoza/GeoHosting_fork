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

CELERY_BROKER_URL = 'memory://'
CELERY_RESULT_BACKEND = 'cache+memory://'
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

STORAGES = {
    "default": {
        "BACKEND": (
            "django.contrib.staticfiles.storage.StaticFilesStorage"
        )
    },
    "staticfiles": {
        "BACKEND": (
            "django.contrib.staticfiles.storage.StaticFilesStorage"
        )
    },
}

