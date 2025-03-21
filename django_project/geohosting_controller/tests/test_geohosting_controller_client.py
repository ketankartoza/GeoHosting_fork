# coding=utf-8
"""GeoHosting Controller."""

import os
from unittest.mock import patch

import requests_mock
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test.client import Client
from django.test.testcases import TestCase
from rest_framework.authtoken.models import Token

from geohosting.factories.package import (
    PackageFactory, PackageGroupFactory, ProductFactory
)
from geohosting.forms.activity import CreateInstanceForm
from geohosting.models import (
    Activity, Instance, Region, WebhookEvent, ActivityStatus, InstanceStatus
)
from geohosting_controller.default_data import (
    generate_cluster, generate_regions
)
from geohosting_controller.exceptions import (
    ConnectionErrorException, NoProxyApiKeyException,
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
        generate_regions()
        generate_cluster()

        self.user = User.objects.create(
            username='user', password='password'
        )
        self.user_token = Token.objects.create(user=self.user)
        self.admin = User.objects.create(
            username='admin', password='password',
            is_superuser=True,
            is_staff=True
        )
        self.admin_token = Token.objects.create(user=self.admin)
        self.package = PackageFactory(
            package_group=PackageGroupFactory(
                package_code='dev-1'
            ),
            product=ProductFactory(
                name='GeoNode'
            )
        )
        self.region = Region.objects.get(code='global')

    def create_function(self, app_name) -> Activity:
        """Create function."""
        form = CreateInstanceForm(
            {
                'app_name': app_name,
                'package': self.package,
                'region': self.region
            }
        )
        form.user = self.admin
        if form.is_valid():
            form.save()
        else:
            raise ActivityException(f'{form.errors}')
        return form.instance

    @patch('django.core.mail.EmailMessage.send')
    def test_create(self, send_email):
        """Test create."""
        with requests_mock.Mocker() as requests_mocker:
            # Mock requests
            requests_mocker.get(
                ' https://api.do.kartoza.com/jenkins/crumbIssuer/api/json',
                status_code=200,
                json={
                    "crumb": "crumb"
                }
            )
            requests_mocker.post(
                'https://api.do.kartoza.com/jenkins/job/kartoza/job/devops/'
                'job/geohosting/job/geonode_create/buildWithParameters',
                status_code=201,
                headers={
                    'Location': ' https://api.do.kartoza.com/queue/item/1/'
                },
            )
            requests_mocker.get(
                ' https://api.do.kartoza.com/queue/item/1/api/json',
                status_code=200,
                json={
                    "id": 1,
                    "url": "queue/item/1/",
                    "executable": {
                        "url": (
                            " https://api.do.kartoza.com/job/kartoza/job/"
                            "devops/job/geohosting/job/geonode_create/1/"
                        )
                    }
                }
            )
            requests_mocker.get(
                (
                    ' https://api.do.kartoza.com/job/kartoza/job/'
                    'devops/job/geohosting/job/geonode_create/1/api/json'
                ),
                status_code=200,
                json={
                    "result": "SUCCESS",
                    "inProgress": False
                }
            )
            requests_mocker.head(
                (
                    'https://server-test.sta.do.kartoza.com'
                ),
                status_code=200,
                json={
                    "result": "SUCCESS",
                    "inProgress": False
                }
            )

            os.environ['PROXY_API_KEY'] = ''
            self.assertEqual(
                self.create_function('error-app').note,
                NoProxyApiKeyException().__str__()
            )

            # ---------------------------------------------
            # WORKING FLOW
            # ---------------------------------------------
            try:
                os.environ['PROXY_API_KEY'] = 'Token'

                # If the name is not correct
                with self.assertRaises(ActivityException):
                    self.create_function('server.com')

                # Run create function, it will return create function
                activity = self.create_function(self.app_name)
                activity.refresh_from_db()
                self.assertEqual(activity.status, ActivityStatus.BUILD_ARGO)

                # This is emulate when pooling build from jenkins
                activity_obj = Activity.objects.get(id=activity.id)

                # Get jenkins build url
                self.assertEqual(
                    activity_obj.jenkins_queue_url,
                    ' https://api.do.kartoza.com/queue/item/1/'
                )

                # Create another activity
                # Should be error because another one is already running
                with self.assertRaises(ActivityException):
                    self.create_function(self.app_name)

                activity.refresh_from_db()
                self.assertEqual(activity.status, ActivityStatus.BUILD_ARGO)

                # Run webhook, should be run by Argo CD
                client = Client()
                # If not admin
                response = client.post(
                    '/api/webhook/',
                    data={
                        'app_name': self.app_name,
                        'Status': 'running',
                        'Source': 'ArgoCD'
                    },
                    headers={'Authorization': f'Token {self.user_token}'}
                )
                self.assertEqual(response.status_code, 403)

                # If not admin but no app name
                response = client.post(
                    '/api/webhook/',
                    data={
                        'app_name': 'devops-test',
                        'Status': 'synced',
                        'Source': 'ArgoCD'
                    },
                    headers={'Authorization': f'Token {self.admin_token}'}
                )
                self.assertEqual(response.status_code, 400)
                self.assertEqual(
                    WebhookEvent.objects.first().app_name, 'test'
                )
                self.assertEqual(
                    WebhookEvent.objects.first().activity, None
                )
                self.assertEqual(
                    WebhookEvent.objects.first().data, {
                        'app_name': 'devops-test',
                        'Status': 'synced',
                        'Source': 'ArgoCD'
                    }
                )

                # Success if admin but running
                response = client.post(
                    '/api/webhook/',
                    data={
                        'app_name': self.app_name,
                        'Status': 'running',
                        'Source': 'ArgoCD'
                    },
                    headers={'Authorization': f'Token {self.admin_token}'}
                )
                self.assertEqual(response.status_code, 200)
                activity.refresh_from_db()
                self.assertEqual(activity.status, ActivityStatus.BUILD_ARGO)
                self.assertIsNotNone(activity.instance)
                self.assertEqual(
                    activity.instance.status, InstanceStatus.DEPLOYING
                )

                # Success if admin but error
                response = client.post(
                    '/api/webhook/',
                    data={
                        'app_name': self.app_name,
                        'Status': 'failed',
                        'Message': 'Error',
                        'Source': 'ArgoCD'
                    },
                    headers={'Authorization': f'Token {self.admin_token}'}
                )
                self.assertEqual(response.status_code, 200)
                activity.refresh_from_db()
                self.assertEqual(
                    WebhookEvent.objects.first().app_name, self.app_name
                )
                self.assertEqual(
                    WebhookEvent.objects.first().activity, activity
                )
                self.assertEqual(
                    WebhookEvent.objects.first().data, {
                        'app_name': self.app_name,
                        'Status': 'failed',
                        'Message': 'Error',
                        'Source': 'ArgoCD'
                    }
                )
                self.assertEqual(activity.status, ActivityStatus.ERROR)
                self.assertEqual(activity.note, 'Error')
                self.assertEqual(
                    activity.instance.status, InstanceStatus.DEPLOYING
                )
                self.assertEqual(send_email.call_count, 0)

                # Success if admin but success
                activity.update_status(ActivityStatus.BUILD_ARGO)
                response = client.post(
                    '/api/webhook/',
                    data={
                        'app_name': self.app_name,
                        'Status': 'synced',
                        'Source': 'ArgoCD'
                    },
                    headers={'Authorization': f'Token {self.admin_token}'}
                )
                self.assertEqual(response.status_code, 200)
                activity.refresh_from_db()
                self.assertEqual(
                    WebhookEvent.objects.first().app_name, self.app_name
                )
                self.assertEqual(
                    WebhookEvent.objects.first().activity, activity
                )
                self.assertEqual(
                    WebhookEvent.objects.first().data, {
                        'app_name': self.app_name,
                        'Status': 'synced',
                        'Source': 'ArgoCD'
                    }
                )
                self.assertEqual(activity.status, ActivityStatus.SUCCESS)
                self.assertEqual(
                    activity.instance.status, InstanceStatus.STARTING_UP
                )
                self.assertEqual(send_email.call_count, 0)

                activity.instance.checking_server()
                self.assertEqual(
                    activity.instance.status, InstanceStatus.ONLINE
                )
                self.assertEqual(send_email.call_count, 1)
                activity.instance.send_credentials()
                self.assertEqual(send_email.call_count, 2)

                # Get the activity status from server
                activity.refresh_from_db()
                self.assertEqual(
                    activity.status, ActivityStatus.SUCCESS
                )
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
                    activity.post_data['k8s_cluster'], 'ktz-sta-ks-gn-01'
                )
                self.assertEqual(
                    activity.post_data['geonode_env'], 'sta'
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
                    instance.cluster.code, 'ktz-sta-ks-gn-01'
                )
                self.assertEqual(
                    instance.name, self.app_name
                )
                self.assertEqual(
                    instance.price.package_group.package_code, 'dev-1'
                )
                self.assertEqual(
                    instance.owner, self.admin
                )
            except ConnectionErrorException:
                self.fail("create() raised ExceptionType unexpectedly!")
