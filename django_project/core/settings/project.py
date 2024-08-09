# coding=utf-8
"""
GeoHosting Controller.

.. note:: Project level settings.
"""
import os  # noqa

from boto3.s3.transfer import TransferConfig
from celery.schedules import crontab

from .contrib import *  # noqa

ALLOWED_HOSTS = ['*']
ADMINS = ()
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': os.environ['DATABASE_NAME'],
        'USER': os.environ['DATABASE_USERNAME'],
        'PASSWORD': os.environ['DATABASE_PASSWORD'],
        'HOST': os.environ['DATABASE_HOST'],
        'PORT': 5432,
        'TEST_NAME': 'unittests',
        'TEST': {
            'NAME': 'unittests',
        },
    }
}

# Set debug to false for production
DEBUG = TEMPLATE_DEBUG = False

# Extra installed apps
INSTALLED_APPS = INSTALLED_APPS + (
    'core',
    'geohosting',
    'geohosting_controller'
)

CELERY_BEAT_SCHEDULE = {
    'sync_with_jenkins': {
        'task': 'geohosting_controller.tasks.sync_with_jenkins',
        'schedule': crontab(minute='*')
    }
}

FIXTURE_DIRS = ['geohosting_controller/fixtures']

ERPNEXT_API_KEY = os.environ.get('ERPNEXT_API_KEY', '')
ERPNEXT_API_SECRET = os.environ.get('ERPNEXT_API_SECRET', '')
ERPNEXT_BASE_URL = os.environ.get('ERPNEXT_BASE_URL', '')

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': (
            'django.contrib.auth.password_validation.'
            'UserAttributeSimilarityValidator'
        ),
    },
    {
        'NAME': (
            'django.contrib.auth.password_validation.MinimumLengthValidator'
        ),
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': (
            'django.contrib.auth.password_validation.CommonPasswordValidator'
        ),
    },
    {
        'NAME': (
            'django.contrib.auth.password_validation.NumericPasswordValidator'
        ),
    },
]

# --------------------------------------
# CELERY
# --------------------------------------
CELERY_BROKER_REDIS_URL = (
    f'redis://:{os.environ.get("REDIS_PASSWORD", "")}'
    f'@{os.environ.get("REDIS_HOST", "")}',
)
CELERY_BROKER_URL = CELERY_BROKER_REDIS_URL

# --------------------------------------
# STRIPE
# --------------------------------------
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY', '')
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY', '')

MB = 1024 ** 2
TRANSFER_CONFIG = TransferConfig(
    multipart_chunksize=512 * MB,
    use_threads=True,
    max_concurrency=10
)
STORAGES = {
    "default": {
        "BACKEND": "storages.backends.s3.S3Storage",
        "OPTIONS": {
            "access_key": os.environ.get("AWS_ACCESS_KEY"),
            "secret_key": os.environ.get("AWS_SECRET_KEY"),
            "bucket_name": os.environ.get("AWS_BUCKET_NAME"),
            "file_overwrite": False,
            "max_memory_size": 300 * MB,  # 300MB
            "transfer_config": TRANSFER_CONFIG,
            "endpoint_url": os.environ.get("AWS_HOST"),
            "location": os.environ.get("AWS_DIR_PREFIX", "")
        },
    },
    "staticfiles": {
        "BACKEND": (
            "django.contrib.staticfiles.storage.StaticFilesStorage"
        )
    },
}

# If it is using minio local, custom_domain should be 127.0.0.1
if os.environ.get("AWS_HOST") == 'http://minio:9000/':
    STORAGES['default']['OPTIONS']['url_protocol'] = "http:"
    STORAGES['default']['OPTIONS']['custom_domain'] = (
        f'127.0.0.1:9005/{os.environ.get("AWS_BUCKET_NAME")}'
    )
