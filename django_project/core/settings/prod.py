# coding=utf-8
"""
GeoHosting Controller.

.. note:: Settings for production mode.
"""

import ast

from .project import *  # noqa
from boto3.s3.transfer import TransferConfig

# Comment if you are not running behind proxy
USE_X_FORWARDED_HOST = True

# -------------------------------------------------- #
# ----------            EMAIL           ------------ #
# -------------------------------------------------- #
# See fig.yml file for postfix container definition#
EMAIL_BACKEND = 'geohosting.resend_email_backend.ResendBackend'
# Host for sending e-mail.
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp')
# Port for sending e-mail.
EMAIL_PORT = ast.literal_eval(os.environ.get('EMAIL_PORT', '25'))
# SMTP authentication information for EMAIL_HOST.
# See fig.yml for where these are defined
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', 'noreply@kartoza.com')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', 'docker')
EMAIL_USE_TLS = ast.literal_eval(os.environ.get('EMAIL_USE_TLS', 'False'))
EMAIL_USE_SSL = ast.literal_eval(os.environ.get('EMAIL_USE_SSL', 'False'))
EMAIL_SUBJECT_PREFIX = os.environ.get('EMAIL_SUBJECT_PREFIX', '')

SERVER_EMAIL = os.environ.get('ADMIN_EMAIL', 'noreply@kartoza.com')
DEFAULT_FROM_EMAIL = os.environ.get(
    'DEFAULT_FROM_EMAIL',
    'noreply@noreply.kartoza.com')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'root': {
        'level': 'WARNING',
        'handlers': ['console'],
    },
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s %(process)d '
                      '%(thread)d %(message)s'
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        },
    },
    'loggers': {
        'django.db.backends': {
            'level': 'ERROR',
            'handlers': ['console'],
            'propagate': False
        },
    }
}

# -------------------------------------------------- #
# ----------            SENTRY          ------------ #
# -------------------------------------------------- #
if SENTRY_DSN is not None and SENTRY_DSN.strip():
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration

    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            DjangoIntegration(),
        ],

        # Set traces_sample_rate to 1.0 to capture 100%
        # of transactions for performance monitoring.
        # We recommend adjusting this value in production.
        traces_sample_rate=1.0,

        # If you wish to associate users to errors (assuming you are using
        # django.contrib.auth) you may enable sending PII data.
        send_default_pii=True
    )

CSRF_TRUSTED_ORIGINS = ast.literal_eval(
    os.environ.get('CSRF_TRUSTED_ORIGINS', '[]'))


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
