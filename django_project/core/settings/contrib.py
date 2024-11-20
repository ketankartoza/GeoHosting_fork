# coding=utf-8
"""
GeoHosting Controller.

.. note:: Settings for 3rd party.
"""
from .base import *  # noqa

# Extra installed apps
INSTALLED_APPS = INSTALLED_APPS + (
    'rest_framework',
    'rest_framework.authtoken',
    'django_celery_beat',
    'django_celery_results',
    'knox',
    'corsheaders',
    'webpack_loader',
)

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'knox.auth.TokenAuthentication',

    ),
    'DEFAULT_PAGINATION_CLASS': (
        'core.pagination.Pagination'
    ),
    'PAGE_SIZE': 100
}

AUTHENTICATION_BACKENDS = (
    'geohosting.auth_backend.EmailBackend',
)
DEFAULT_AUTO_FIELD = 'django.db.models.AutoField'
CELERY_RESULT_BACKEND = 'django-db'

TEMPLATES[0]['OPTIONS']['context_processors'] += [
    'django.template.context_processors.request',
]

SENTRY_DSN = os.environ.get('SENTRY_DSN', '')

# knox setting
REST_KNOX = {
    'SECURE_HASH_ALGORITHM': 'cryptography.hazmat.primitives.hashes.SHA512',
    'AUTH_TOKEN_CHARACTER_LENGTH': 64,
    'TOKEN_TTL': None,
    'USER_SERIALIZER': 'knox.serializers.UserSerializer',
    'TOKEN_LIMIT_PER_USER': 1,
    'AUTO_REFRESH': False,
}

# --------------------------------------
# WEBPACK
# --------------------------------------
WEBPACK_BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(os.path.abspath(__file__))))
WEBPACK_LOADER = {
    'DEFAULT': {
        'CACHE': True,
        'STATS_FILE': os.path.join(
            WEBPACK_BASE_DIR,
            'geohosting',
            'assets',
            'webpack_bundles',
            'webpack-stats.json'),
        'POLL_INTERVAL': 0.1,
        'TIMEOUT': None,
        'IGNORE': [r'.+\.hot-update.js', r'.+\.map'],
        'LOADER_CLASS': 'webpack_loader.loader.WebpackLoader',
    }
}
STATICFILES_DIRS += (
    absolute_path('geohosting', 'assets', 'webpack_bundles'),
)
