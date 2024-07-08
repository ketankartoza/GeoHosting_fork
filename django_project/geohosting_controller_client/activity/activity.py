# coding=utf-8
"""
GeoHosting Controller.

.. note:: Controller to the server
"""

from geohosting_controller_client.connection import request_get
from geohosting_controller_client.exceptions import ConnectionErrorException
from geohosting_controller_client.variables import (
    CONTROLLER_SERVER_REQUEST_ACTIVITY_DETAIL
)


class Activity:
    """Activity model from remote server."""

    id: int
    product: str
    activity_type: str
    status: str
    note: str
    data: dict
    post_data: dict

    def __init__(self, **kwargs):
        """Init data."""
        self.id = kwargs.get('id', 0)
        self.product = kwargs.get('product', '')
        self.activity_type = kwargs.get('activity_type', '')
        self.status = kwargs.get('status', '')
        self.note = kwargs.get('note', '')
        self.data = kwargs.get('client_data', {})
        self.post_data = kwargs.get('post_data', {})


def get_activity_detail(activity_id) -> Activity:
    """Fetch activity id.

    :param activity_id:
        Id of activity in the server.

    :return: Activity detail from server.
    :rtype: Activity
    :raises ConnectionErrorException:
        If it does not return 200 from request.
        The exception object also have 'response' attribute.
    """
    response = request_get(
        url=CONTROLLER_SERVER_REQUEST_ACTIVITY_DETAIL.replace(
            '<id>', f'{activity_id}'
        )
    )
    if response.status_code != 200:
        raise ConnectionErrorException(response.content, response=response)

    data = response.json()
    return Activity(**data)
