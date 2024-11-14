# coding=utf-8
"""
GeoHosting Controller.

.. note:: Connection to API
"""
import os
from urllib.parse import urlparse

import requests

from geohosting_controller.exceptions import NoProxyApiKeyException


def return_api_key():
    """Return proxy api key."""
    api_key = os.environ.get('PROXY_API_KEY', None)
    if not api_key:
        raise NoProxyApiKeyException()
    return api_key


def get_jenkins_crumb(url):
    """Return crumb."""
    parsed_uri = urlparse(url)
    host = '{uri.scheme}://{uri.netloc}/'.format(uri=parsed_uri)
    response = requests.get(
        f'{host}jenkins/crumbIssuer/api/json',
        headers={
            'apikey': return_api_key()
        },
        verify=False
    )
    return response.json()['crumb']


def request_get(url: str, params: dict = None):
    """Handle get connection."""
    return requests.get(
        url, params=params if params else {},
        headers={
            'apikey': return_api_key()
        },
        verify=False
    )


def request_post(url: str, data: dict):
    """Handle post connection."""
    return requests.post(
        url,
        params=data,
        headers={
            'apikey': return_api_key()
        },
        verify=False
    )
