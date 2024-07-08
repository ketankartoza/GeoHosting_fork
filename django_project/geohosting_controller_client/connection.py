# coding=utf-8
"""
GeoHosting Controller.

.. note:: Connection to the server
"""
import os

import requests

from geohosting_controller_client.exceptions import (
    NoUrlException, NoTokenException
)


def _request_post(url: str, data: dict, token: str):
    """Request to server."""
    return requests.post(
        url, data=data, headers={'Authorization': f'Token {token}'}
    )


def _request_get(url: str, token: str):
    """Request to server."""
    return requests.get(
        url, headers={'Authorization': f'Token {token}'}
    )


def request_spec():
    """Return connection spec."""
    base_url = os.environ.get(
        'GEOHOSTING_CONTROLLER_SERVER_URL', None
    )
    token = os.environ.get(
        'GEOHOSTING_CONTROLLER_SERVER_TOKEN', None
    )

    if not base_url:
        raise NoUrlException()
    if not token:
        raise NoTokenException()
    base_url = base_url.rstrip("/")

    return base_url, token


def request_post(url: str, data: dict):
    """Handle post connection."""
    base_url, token = request_spec()
    return _request_post(base_url + url, data=data, token=token)


def request_get(url: str):
    """Handle get connection."""
    base_url, token = request_spec()
    return _request_get(base_url + url, token=token)
