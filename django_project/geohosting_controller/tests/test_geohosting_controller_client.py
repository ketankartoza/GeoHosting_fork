# coding=utf-8
"""GeoHosting Controller."""

import os

import requests_mock
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test.client import Client
from django.test.testcases import TestCase
from knox.models import AuthToken

from geohosting.forms.activity import CreateInstanceForm
from geohosting.models import (
    Activity, Instance, Package, Region, WebhookEvent
)
from geohosting_controller.exceptions import (
    ConnectionErrorException, NoJenkinsUserException, NoJenkinsTokenException,
    ActivityException
)
from geohosting_controller.variables import ActivityTypeTerm

User = get_user_model()


class ControllerTest(TestCase):
    """Test all activity functions."""

    user_email = 'test@example.com'
    app_name = 'server-test'

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

    def create_function(self, app_name) -> Activity:
        """Create function."""
        form = CreateInstanceForm(
            {
                'app_name': app_name,
                'package': Package.objects.get(package_code='dev-1'),
                'region': Region.objects.get(code='global')
            }
        )
        form.user = self.admin
        if form.is_valid():
            form.save()
        else:
            raise ActivityException(f'{form.errors}')
        return form.instance

    def test_create(self):
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

            try:
                self.create_function(self.app_name)
                self.fail('Should have raised ConnectionErrorException')
            except NoJenkinsUserException:
                pass

            try:
                os.environ['JENKINS_USER'] = 'user@example.com'
                self.create_function(self.app_name)
                self.fail('Should have raised ConnectionErrorException')
            except NoJenkinsTokenException:
                pass

            # ---------------------------------------------
            # WORKING FLOW
            # ---------------------------------------------
            try:
                os.environ['JENKINS_TOKEN'] = 'Token'

                # If the name is not correct
                with self.assertRaises(ActivityException):
                    self.create_function('server.com')

                # Run create function, it will return create function
                activity = self.create_function(self.app_name)

                # This is emulate when pooling build from jenkins
                activity_obj = Activity.objects.get(id=activity.id)

                # Get jenkins build url
                self.assertEqual(
                    activity_obj.jenkins_queue_url,
                    ' https://jenkins.do.kartoza.com/queue/item/1/'
                )

                # Create another activity
                # Should be error because another one is already running
                with self.assertRaises(ActivityException):
                    self.create_function(self.app_name)

                # Run webhook, should be run by Argo CD
                client = Client()
                webhook_data = {
                    'app_name': self.app_name,
                    'state': 'successful'
                }
                # If not admin
                response = client.post(
                    '/api/webhook/', data=webhook_data,
                    headers={'Authorization': f'Token {self.user_token}'}
                )
                self.assertEqual(response.status_code, 403)

                # Success if admin
                response = client.post(
                    '/api/webhook/', data=webhook_data,
                    headers={'Authorization': f'Token {self.admin_token}'}
                )
                self.assertEqual(response.status_code, 200)
                self.assertEqual(
                    WebhookEvent.objects.all().first().data, webhook_data
                )

                # Get the activity status from server
                activity = Activity.objects.get(id=activity.id)
                self.assertEqual(activity.status, 'SUCCESS')
                self.assertEqual(
                    activity.activity_type.identifier,
                    ActivityTypeTerm.CREATE_INSTANCE.value
                )
                self.assertEqual(
                    activity.client_data['app_name'], self.app_name
                )
                self.assertEqual(
                    activity.client_data['package_code'], 'dev-1'
                )
                self.assertEqual(activity.triggered_by, self.admin)

                # For data to jenkins
                self.assertEqual(
                    activity.post_data['k8s_cluster'], 'ktz-dev-ks-gn-01'
                )
                self.assertEqual(
                    activity.post_data['subdomain'], self.app_name
                )
                self.assertEqual(
                    activity.post_data['geonode_name'], self.app_name
                )
                self.assertEqual(
                    activity.post_data['geonode_size'], 'dev-1'
                )

                # Create another activity
                # Should be error because the instance is already created
                with self.assertRaises(ActivityException):
                    self.create_function(self.app_name)
                instance = Instance.objects.first()
                self.assertEqual(
                    instance.cluster.code, 'ktz-dev-ks-gn-01'
                )
                self.assertEqual(
                    instance.name, self.app_name
                )
                self.assertEqual(
                    instance.price.package_code, 'dev-1'
                )
                self.assertEqual(
                    instance.owner, self.admin
                )
            except ConnectionErrorException:
                self.fail("create() raised ExceptionType unexpectedly!")
