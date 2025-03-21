# coding=utf-8
"""GeoHosting Controller."""

import os

import requests_mock
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test.client import Client
from django.test.testcases import TestCase
from rest_framework.authtoken.models import Token

from geohosting.factories.package import (
    PackageFactory, PackageGroupFactory, ProductFactory
)
from geohosting.forms.activity.delete_instance import (
    DeletingInstanceForm
)
from geohosting.models import (
    Activity, Instance, Region, ActivityStatus, InstanceStatus
)
from geohosting_controller.default_data import (
    generate_cluster, generate_regions
)
from geohosting_controller.exceptions import (
    ConnectionErrorException, NoProxyApiKeyException,
    ActivityException
)

User = get_user_model()


class ControllerDeletingTest(TestCase):
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
        self.product_cluster = self.package.product.get_product_cluster(
            self.region)
        self.instance = Instance.objects.create(
            name=self.app_name,
            price=self.package,
            cluster=self.product_cluster.cluster,
            owner=self.admin,
            status=InstanceStatus.ONLINE
        )

    def delete_function(self, user) -> Activity:
        """Delete function."""
        form = DeletingInstanceForm(
            {'application': self.instance}
        )
        form.user = user
        if form.is_valid():
            form.save()
        else:
            raise ActivityException(f'{form.errors}')
        return form.instance

    def test_deleting(self):
        """Test create."""
        self.assertEqual(self.instance.name, self.app_name)
        self.assertEqual(self.instance.price, self.package)
        self.assertEqual(self.instance.cluster, self.product_cluster.cluster)
        self.assertEqual(self.instance.owner, self.admin)
        self.assertEqual(self.instance.status, InstanceStatus.ONLINE)
        """Test deleting."""

        with requests_mock.Mocker() as requests_mocker:
            requests_mocker.post(
                'https://api.do.kartoza.com/jenkins/job/kartoza/job/devops/'
                'job/geohosting/job/geonode_delete/buildWithParameters',
                status_code=201,
                headers={
                    'Location': ' https://api.do.kartoza.com/queue/item/1/'
                },
            )

            os.environ['PROXY_API_KEY'] = ''
            self.assertEqual(
                self.delete_function(self.admin).note,
                NoProxyApiKeyException().__str__()
            )

            # ---------------------------------------------
            # WORKING FLOW
            # ---------------------------------------------
            try:
                os.environ['PROXY_API_KEY'] = 'Token'

                # When the user is not owner
                with self.assertRaises(ActivityException):
                    self.delete_function(self.user)

                # Run create function, it will return create function
                self.instance.refresh_from_db()
                activity = self.delete_function(self.admin)

                # This is emulate when pooling build from jenkins
                activity_obj = Activity.objects.get(id=activity.id)

                # Get jenkins build url
                self.assertEqual(
                    activity_obj.jenkins_queue_url,
                    ' https://api.do.kartoza.com/queue/item/1/'
                )
                activity.refresh_from_db()
                self.instance.refresh_from_db()
                self.assertEqual(activity.status, ActivityStatus.BUILD_ARGO)
                self.assertEqual(
                    self.instance.status, InstanceStatus.DELETING
                )

                # When it is already being deleted
                with self.assertRaises(ActivityException):
                    self.delete_function(self.admin)

                # Run webhook, should be run by Argo CD
                client = Client()

                # If not admin
                response = client.post(
                    '/api/webhook/',
                    data={
                        'app_name': self.app_name,
                        'status': 'running',
                        'source': 'ArgoCD'
                    },
                    headers={'Authorization': f'Token {self.user_token}'}
                )
                self.assertEqual(response.status_code, 403)

                # Success if admin but running
                response = client.post(
                    '/api/webhook/',
                    data={
                        'app_name': self.app_name,
                        'status': 'running',
                        'source': 'ArgoCD'
                    },
                    headers={'Authorization': f'Token {self.admin_token}'}
                )
                self.assertEqual(response.status_code, 200)
                activity.refresh_from_db()
                self.assertEqual(activity.status, ActivityStatus.BUILD_ARGO)

                self.instance.refresh_from_db()
                self.assertEqual(
                    self.instance.status, InstanceStatus.DELETING
                )

                # Success if admin but error
                response = client.post(
                    '/api/webhook/',
                    data={
                        'app_name': self.app_name,
                        'status': 'failed',
                        'message': 'Error',
                        'source': 'ArgoCD'
                    },
                    headers={'Authorization': f'Token {self.admin_token}'}
                )
                self.assertEqual(response.status_code, 200)
                activity.refresh_from_db()
                self.assertEqual(activity.status, ActivityStatus.ERROR)
                self.assertEqual(activity.note, 'Error on Argo CD')
                self.assertEqual(
                    activity.instance.status, InstanceStatus.DELETING
                )

                # Success but need deleted status
                activity.update_status(ActivityStatus.BUILD_ARGO)
                response = client.post(
                    '/api/webhook/',
                    data={
                        'app_name': self.app_name,
                        'status': 'succeeded',
                        'source': 'ArgoCD'
                    },
                    headers={'Authorization': f'Token {self.admin_token}'}
                )
                self.assertEqual(response.status_code, 200)
                activity.refresh_from_db()
                self.assertEqual(activity.status, ActivityStatus.BUILD_ARGO)
                self.assertEqual(
                    activity.instance.status, InstanceStatus.DELETING
                )

                # Success but need deleted status
                activity.update_status(ActivityStatus.BUILD_ARGO)
                response = client.post(
                    '/api/webhook/',
                    data={
                        'app_name': self.app_name,
                        'status': 'deleted',
                        'source': 'ArgoCD'
                    },
                    headers={'Authorization': f'Token {self.admin_token}'}
                )
                self.assertEqual(response.status_code, 200)
                activity.refresh_from_db()
                self.assertEqual(activity.status, ActivityStatus.SUCCESS)
                self.assertEqual(
                    activity.instance.status, InstanceStatus.DELETED
                )
            except ConnectionErrorException:
                self.fail("create() raised ExceptionType unexpectedly!")
