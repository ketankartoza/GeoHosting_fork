import os
from unittest.mock import patch, call

import requests_mock
from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from geohosting.factories import (
    PackageFactory, SalesOrderFactory, ErpCompanyFactory
)
from geohosting.models import (
    SalesOrderStatus, SalesOrderPaymentMethod, ActivityType, Cluster,
    Region, ProductCluster, Instance, InstanceStatus
)
from geohosting_controller.variables import ActivityTypeTerm


class SalesOrderTests(TestCase):
    """Sales order tests."""

    proxy_url = 'https://api.example.com'

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
        ErpCompanyFactory(erpnext_code='Test Company')

    @patch('geohosting.models.sales_order.add_erp_next_comment')
    @patch(
        'geohosting.utils.payment.'
        'PaystackPaymentGateway.payment_verification'
    )
    @patch('geohosting.models.erp_model.put_to_erpnext')
    @patch('geohosting.models.erp_model.post_to_erpnext')
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

        # Check payload
        payload = sales_order.erp_payload_for_create
        self.assertEqual(payload['company'], 'Test Company')

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
                self.user, sales_order.doc_type,
                sales_order.erpnext_code, 'App name : test'
            ),
            call(
                self.user, sales_order.doc_type,
                sales_order.erpnext_code,
                (
                    'AUTO DEPLOY ERROR: '
                    'Activity type INSTANCE.CREATE does not exist.'
                )
            )
        ])
        mock_add_erp_next_comment.reset_mock()

        # Add the ACTIVITY.CREATE
        ActivityType.objects.create(
            identifier=ActivityTypeTerm.CREATE_INSTANCE.value,
            jenkins_url=(
                'https://api.example.com/job/kartoza/job/devops/job/'
                'geohosting/job/geonode_create/buildWithParameters'
            ),
            product=self.package.product
        )
        sales_order.auto_deploy()
        mock_add_erp_next_comment.assert_has_calls([
            call(
                self.user, sales_order.doc_type,
                sales_order.erpnext_code, 'App name : test'
            ),
            call(
                self.user, sales_order.doc_type,
                sales_order.erpnext_code,
                (
                    'AUTO DEPLOY ERROR: '
                    'Product cluster for region Global does not exist.'
                )
            )
        ])
        mock_add_erp_next_comment.reset_mock()

        with requests_mock.Mocker() as requests_mocker:
            # Mock requests
            requests_mocker.get(
                f'{self.proxy_url}/crumbIssuer/api/json',
                status_code=200,
                json={
                    "crumb": "crumb"
                }
            )
            requests_mocker.post(
                f'{self.proxy_url}/job/kartoza/job/devops/'
                'job/geohosting/job/geonode_create/buildWithParameters',
                status_code=201,
                headers={
                    'Location': f'{self.proxy_url}/queue/item/1/'
                },
            )
            requests_mocker.get(
                f'{self.proxy_url}/queue/item/1/api/json',
                status_code=200,
                json={
                    "id": 1,
                    "url": "queue/item/1/",
                    "executable": {
                        "url": (
                            f'{self.proxy_url}/job/kartoza/job/'
                            "devops/job/geohosting/job/geonode_create/1/"
                        )
                    }
                }
            )
            requests_mocker.get(
                (
                    f'{self.proxy_url}/job/kartoza/job/'
                    'devops/job/geohosting/job/geonode_create/1/api/json'
                ),
                status_code=200,
                json={
                    "result": "SUCCESS",
                    "inProgress": False
                }
            )

            # Create cluster but no PROXY API KEY
            os.environ['PROXY_API_KEY'] = ''
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
                    self.user, sales_order.doc_type,
                    sales_order.erpnext_code,
                    'Auto deployment: ERROR.\nPROXY_API_KEY is required.'
                )
            ])

            # Has PROXY API KEY
            mock_add_erp_next_comment.reset_mock()
            os.environ['PROXY_API_KEY'] = 'token'
            sales_order.auto_deploy()
            self.assertTrue(sales_order.activity_set.all().count())
            mock_add_erp_next_comment.assert_has_calls([
                call(
                    self.user, sales_order.doc_type,
                    sales_order.erpnext_code,
                    'Auto deployment: BUILD_ARGO.'
                )
            ])

            instance = Instance.objects.get(name=sales_order.app_name)
            self.assertEqual(instance.status, InstanceStatus.DEPLOYING)
