# coding=utf-8
"""
GeoHosting Controller.

.. note:: Contains all client exceptions.
"""


class NoUrlException(Exception):
    """No token exception."""

    def __init__(self):  # noqa
        super().__init__('GEOHOSTING_CONTROLLER_SERVER_URL is required.')


class NoTokenException(Exception):
    """No token exception."""

    def __init__(self):  # noqa
        super().__init__('GEOHOSTING_CONTROLLER_SERVER_TOKEN is required.')


class ConnectionErrorException(Exception):
    """Connection error."""

    def __init__(self, message, response):  # noqa
        super().__init__(message)
        self.response = response
