import os
from unittest.mock import patch, call

import requests_mock
from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from geohosting.factories import PackageFactory, SalesOrderFactory
from geohosting.models import (
    SalesOrderStatus, SalesOrderPaymentMethod, ActivityType, Cluster,
    Region, ProductCluster
)
from geohosting_controller.variables import ActivityTypeTerm


class SalesOrderTests(TestCase):
    """Sales order tests."""

    jenkins_url = 'https://jenkins.example.com'

    def setUp(self):
        """Setup test case."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='admin_user',
            email='admin@example.com',
            password='password123'
        )
        # Authenticate the client
        self.client.force_authenticate(user=self.user)
        self.package = PackageFactory()

    @patch('geohosting.models.sales_order.add_erp_next_comment')
    @patch('geohosting.models.sales_order.verify_paystack_payment')
    @patch('geohosting.models.sales_order.put_to_erpnext')
    @patch('geohosting.models.sales_order.post_to_erpnext')
    def test_create_sales_order(
            self, mock_post_to_erpnext, mock_put_to_erpnext,
            mock_verify_paystack_payment, mock_add_erp_next_comment
    ):
        """Test create sales order."""
        mock_post_to_erpnext.return_value = {
            "status": "success", "id": 'erpnext_1'
        }
        mock_put_to_erpnext.return_value = {
            "status": "success", "data": {}
        }
        mock_verify_paystack_payment.return_value = {
            "status": "success", "data": {"status": "success"}
        }
        mock_add_erp_next_comment.return_value = {
            "status": "success", "data": {}
        }

        sales_order = SalesOrderFactory(
            package=self.package, customer=self.user
        )
        self.assertEqual(sales_order.package, self.package)
        self.assertEqual(sales_order.customer, self.user)
        self.assertEqual(sales_order.erpnext_code, 'erpnext_1')

        # Waiting payment
        self.assertEqual(
            sales_order.order_status, SalesOrderStatus.WAITING_PAYMENT.key
        )

        sales_order.payment_id = 'payment_id'
        sales_order.payment_method = SalesOrderPaymentMethod.PAYSTACK
        sales_order.save()

        # Payment success
        sales_order.update_payment_status()
        self.assertEqual(
            sales_order.order_status,
            SalesOrderStatus.WAITING_CONFIGURATION.key
        )

        # Add app name
        sales_order.app_name = 'test'
        sales_order.save()
        self.assertEqual(
            sales_order.order_status,
            SalesOrderStatus.WAITING_DEPLOYMENT.key
        )
        mock_add_erp_next_comment.assert_has_calls([
            call(
                self.user, sales_order.doctype,
                sales_order.erpnext_code, 'App name : test'
            ),
            call(
                self.user, sales_order.doctype,
                sales_order.erpnext_code,
                'Activity type INSTANCE.CREATE does not exist.'
            )
        ])
        mock_add_erp_next_comment.reset_mock()

        # Add the ACTIVITY.CREATE
        ActivityType.objects.create(
            identifier=ActivityTypeTerm.CREATE_INSTANCE.value,
            jenkins_url=(
                'https://jenkins.example.com/job/kartoza/job/devops/job/'
                'geohosting/job/geonode_create/buildWithParameters'
            )
        )
        sales_order.auto_deploy()
        mock_add_erp_next_comment.assert_has_calls([
            call(
                self.user, sales_order.doctype,
                sales_order.erpnext_code, 'App name : test'
            ),
            call(
                self.user, sales_order.doctype,
                sales_order.erpnext_code,
                'No cluster found.'
            )
        ])
        mock_add_erp_next_comment.reset_mock()

        with requests_mock.Mocker() as requests_mocker:
            # Mock requests
            requests_mocker.get(
                f'{self.jenkins_url}/crumbIssuer/api/json',
                status_code=200,
                json={
                    "crumb": "crumb"
                }
            )
            requests_mocker.post(
                f'{self.jenkins_url}/job/kartoza/job/devops/'
                'job/geohosting/job/geonode_create/buildWithParameters',
                status_code=201,
                headers={
                    'Location': f'{self.jenkins_url}/queue/item/1/'
                },
            )
            requests_mocker.get(
                f'{self.jenkins_url}/queue/item/1/api/json',
                status_code=200,
                json={
                    "id": 1,
                    "url": "queue/item/1/",
                    "executable": {
                        "url": (
                            f'{self.jenkins_url}/job/kartoza/job/'
                            "devops/job/geohosting/job/geonode_create/1/"
                        )
                    }
                }
            )
            requests_mocker.get(
                (
                    f'{self.jenkins_url}/job/kartoza/job/'
                    'devops/job/geohosting/job/geonode_create/1/api/json'
                ),
                status_code=200,
                json={
                    "result": "SUCCESS",
                    "inProgress": False
                }
            )

            # Create cluster but no JENKINS USER
            cluster = Cluster.objects.create(
                code='test',
                region=Region.default_region()
            )
            ProductCluster.objects.create(
                cluster=cluster,
                product=self.package.product,
                environment='test'
            )
            sales_order.auto_deploy()
            self.assertTrue(sales_order.activity_set.all().count())
            mock_add_erp_next_comment.assert_has_calls([
                call(
                    self.user, sales_order.doctype,
                    sales_order.erpnext_code,
                    'Auto deployment: ERROR.\nJENKINS_USER is required.'
                )
            ])

            # Has JENKINS USER
            mock_add_erp_next_comment.reset_mock()
            os.environ['JENKINS_USER'] = 'user@example.com'
            os.environ['JENKINS_TOKEN'] = 'token'
            sales_order.auto_deploy()
            self.assertTrue(sales_order.activity_set.all().count())
            mock_add_erp_next_comment.assert_has_calls([
                call(
                    self.user, sales_order.doctype,
                    sales_order.erpnext_code,
                    'Auto deployment: BUILD_JENKINS.'
                ),
                call(
                    self.user, sales_order.doctype,
                    sales_order.erpnext_code,
                    'Auto deployment: BUILD_ARGO.'
                )
            ])
