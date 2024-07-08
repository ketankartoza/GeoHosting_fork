# coding=utf-8
"""GeoHosting Controller."""

import os
from urllib.parse import urlparse

import requests_mock
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test.client import Client
from django.test.testcases import TestCase
from knox.models import AuthToken
from mock import patch

from geohosting_controller.models import Activity, Instance
from geohosting_controller_client.activity import (
    create, get_activity_detail
)
from geohosting_controller_client.exceptions import (
    NoUrlException, NoTokenException, ConnectionErrorException
)
from geohosting_controller_client.variables import ActivityType

User = get_user_model()


def mock__request_post(url: str, data: dict, token: str):
    """Mock connection."""
    parsed_url = urlparse(url)
    url = parsed_url.path
    client = Client()
    response = client.post(
        url, data=data, headers={'Authorization': f'Token {token}'}
    )
    return response


def mock__request_get(url: str, token: str):
    """Mock connection."""
    parsed_url = urlparse(url)
    url = parsed_url.path
    client = Client()
    response = client.get(
        url, headers={'Authorization': f'Token {token}'}
    )
    return response


class ControllerTest(TestCase):
    """Test all activity functions."""

    user_email = 'test@example.com'
    sub_domain = 'server-test'

    def setUp(self):
        """To setup test."""
        call_command(
            'loaddata', '01.initiate.json'
        )
        self.user = User.objects.create(
            username='user', password='password'
        )
        auth_token, self.user_token = AuthToken.objects.create(
            user=self.user
        )

        self.admin = User.objects.create(
            username='admin', password='password',
            is_superuser=True,
            is_staff=True
        )
        auth_token, self.admin_token = AuthToken.objects.create(
            user=self.admin
        )

    def create_function(self, sub_domain):
        """Create function."""
        return create(
            'geonode', 'package-1', sub_domain, self.user_email
        )

    @patch(
        'geohosting_controller_client.connection._request_post',
        side_effect=mock__request_post
    )
    @patch(
        'geohosting_controller_client.connection._request_get',
        side_effect=mock__request_get
    )
    def test_create(self, request_post, request_get):
        """Test create."""
        with requests_mock.Mocker() as requests_mocker:
            # Mock requests
            requests_mocker.get(
                ' https://jenkins.do.kartoza.com/crumbIssuer/api/json',
                status_code=200,
                json={
                    "crumb": "crumb"
                }
            )
            requests_mocker.post(
                'https://jenkins.do.kartoza.com/job/kartoza/job/devops/'
                'job/geohosting/job/geonode_create/buildWithParameters',
                status_code=201,
                headers={
                    'Location': ' https://jenkins.do.kartoza.com/queue/item/1/'
                },
            )
            requests_mocker.get(
                ' https://jenkins.do.kartoza.com/queue/item/1/api/json',
                status_code=200,
                json={
                    "id": 1,
                    "url": "queue/item/1/",
                    "executable": {
                        "url": (
                            " https://jenkins.do.kartoza.com/job/kartoza/job/"
                            "devops/job/geohosting/job/geonode_create/1/"
                        )
                    }
                }
            )
            requests_mocker.get(
                (
                    ' https://jenkins.do.kartoza.com/job/kartoza/job/'
                    'devops/job/geohosting/job/geonode_create/1/api/json'
                ),
                status_code=200,
                json={
                    "result": "SUCCESS",
                    "inProgress": False
                }
            )

            # Check if no url
            with self.assertRaises(NoUrlException):
                self.create_function(self.sub_domain)
            os.environ[
                'GEOHOSTING_CONTROLLER_SERVER_URL'
            ] = 'http://server.com'

            # Check if no token
            with self.assertRaises(NoTokenException):
                self.create_function(self.sub_domain)

            # If not admin
            os.environ['GEOHOSTING_CONTROLLER_SERVER_TOKEN'] = self.user_token
            with self.assertRaises(ConnectionErrorException):
                self.create_function(self.sub_domain)

            os.environ['GEOHOSTING_CONTROLLER_SERVER_TOKEN'] = self.admin_token

            try:
                self.create_function(self.sub_domain)
                self.fail('Should have raised ConnectionErrorException')
            except ConnectionErrorException:
                pass

            try:
                os.environ['JENKINS_USER'] = 'user@example.com'
                os.environ['JENKINS_URL'] = 'http://jenkins.com'
                self.create_function(self.sub_domain)
                self.fail('Should have raised ConnectionErrorException')
            except ConnectionErrorException:
                pass

            # ---------------------------------------------
            # WORKING FLOW
            # ---------------------------------------------
            try:
                os.environ['JENKINS_TOKEN'] = 'Token'

                # If the name is not correct
                with self.assertRaises(ConnectionErrorException):
                    self.create_function('server.com')

                # Run create function, it will return create function
                activity = self.create_function(self.sub_domain)

                # This is emulate when pooling build from jenkins
                activity_obj = Activity.objects.get(id=activity.id)

                # Get jenkins build url
                self.assertEqual(
                    activity_obj.jenkins_queue_url,
                    ' https://jenkins.do.kartoza.com/queue/item/1/'
                )

                # Create another activity
                # Should be error because another one is already running
                with self.assertRaises(ConnectionErrorException):
                    self.create_function(self.sub_domain)

                # Run webhook, should be run by Argo CD
                client = Client()
                response = client.post(
                    '/api/webhook/', data={
                        'app_name': self.sub_domain,
                        'state': 'successful'
                    },
                    headers={'Authorization': f'Token {self.admin_token}'}
                )
                self.assertEqual(response.status_code, 200)

                # Get the activity status from server
                activity = get_activity_detail(activity.id)
                self.assertEqual(activity.status, 'SUCCESS')
                self.assertEqual(
                    activity.activity_type, ActivityType.CREATE_INSTANCE.value
                )
                self.assertEqual(activity.product, 'Geonode')
                self.assertEqual(activity.data['app_name'], self.sub_domain)
                self.assertEqual(activity.data['subdomain'], self.sub_domain)
                self.assertEqual(activity.data['package_id'], 'package-1')
                self.assertEqual(
                    activity.data['user_email'], self.user_email
                )

                # For data to jenkins
                self.assertEqual(
                    activity.post_data['k8s_cluster'], 'ktz-dev-ks-gn-01'
                )
                self.assertEqual(
                    activity.post_data['subdomain'], self.sub_domain
                )
                self.assertEqual(
                    activity.post_data['geonode_name'], self.sub_domain
                )
                self.assertEqual(
                    activity.post_data['geonode_size'], 'package-1'
                )

                # Create another activity
                # Should be error because the instance is already created
                with self.assertRaises(ConnectionErrorException):
                    self.create_function(self.sub_domain)
                instance = Instance.objects.first()

                self.assertEqual(
                    instance.cluster.code, 'ktz-dev-ks-gn-01'
                )
                self.assertEqual(
                    instance.name, self.sub_domain
                )
                self.assertEqual(
                    instance.package_id, 'package-1'
                )
                self.assertEqual(
                    instance.owner_email, self.user_email
                )
            except ConnectionErrorException:
                self.fail("create() raised ExceptionType unexpectedly!")
