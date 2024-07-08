# coding=utf-8
"""
GeoHosting Controller.

.. note:: Contains all client exceptions.
"""


class NoClusterException(Exception):
    """No Cluster eexception."""

    def __init__(self):  # noqa
        super().__init__('No cluster found.')


class NoUserException(Exception):
    """No User exception."""

    def __init__(self):  # noqa
        super().__init__('JENKINS_USER is required.')


class NoTokenException(Exception):
    """No token exception."""

    def __init__(self):  # noqa
        super().__init__('JENKINS_TOKEN is required.')


class ConnectionErrorException(Exception):
    """Connection error."""

    def __init__(self, message, response):  # noqa
        super().__init__(message)
        self.response = response
