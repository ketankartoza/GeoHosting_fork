# coding=utf-8
"""
GeoHosting.

.. note:: Test GeoHosting.
"""

from unittest.mock import patch

from django.test import TestCase

from geohosting.factories import (
    AgreementFactory, AgreementDetailFactory, SalesOrderAgreementFactory,
    SalesOrderFactory
)
from geohosting.models.agreement import (
    Agreement, AgreementDetail, SalesOrderAgreement
)


class AgreementCRUDTest(TestCase):
    """Agreement test case."""

    Factory = AgreementFactory
    Model = Agreement

    def test_create_object(self):
        """Test create object."""
        obj = self.Factory()
        self.assertIsInstance(obj, self.Model)
        self.assertTrue(self.Model.objects.filter(id=obj.id).exists())

    def test_read_object(self):
        """Test read object."""
        obj = self.Factory()
        fetched_obj = self.Model.objects.get(id=obj.id)
        self.assertEqual(obj, fetched_obj)

    def test_update_object(self):
        """Test update object."""
        obj = self.Factory()
        new_name = "Updated Name"
        obj.name = new_name
        obj.save()
        updated_obj = self.Model.objects.get(id=obj.id)
        self.assertEqual(updated_obj.name, new_name)

    def test_delete_object(self):
        """Test delete object."""
        obj = self.Factory()
        _id = obj.id
        obj.delete()
        self.assertFalse(self.Model.objects.filter(id=_id).exists())


class AgreementDetailCRUDTest(TestCase):
    """AgreementDetail test case."""

    Factory = AgreementDetailFactory
    Model = AgreementDetail

    def test_create_object(self):
        """Test create object."""
        obj = self.Factory()
        self.assertIsInstance(obj, self.Model)
        self.assertTrue(self.Model.objects.filter(id=obj.id).exists())

    def test_read_object(self):
        """Test read object."""
        obj = self.Factory()
        fetched_obj = self.Model.objects.get(id=obj.id)
        self.assertEqual(obj, fetched_obj)

    def test_update_object(self):
        """Test update object."""
        obj = self.Factory()
        template = "Updated Name"
        obj.template = template
        obj.save()
        updated_obj = self.Model.objects.get(id=obj.id)
        self.assertEqual(updated_obj.template, template)

    def test_delete_object(self):
        """Test delete object."""
        obj = self.Factory()
        _id = obj.id
        obj.delete()
        self.assertFalse(self.Model.objects.filter(id=_id).exists())


class SalesOrderAgreementCRUDTest(TestCase):
    """SalesOrderAgreement test case."""

    Factory = SalesOrderAgreementFactory
    Model = SalesOrderAgreement

    @patch('geohosting.models.sales_order.add_erp_next_comment')
    @patch('geohosting.models.sales_order.verify_paystack_payment')
    @patch('geohosting.models.erp_model.put_to_erpnext')
    @patch('geohosting.models.erp_model.post_to_erpnext')
    def test_create_object(
            self, mock_post_to_erpnext, mock_put_to_erpnext,
            mock_verify_paystack_payment, mock_add_erp_next_comment
    ):
        """Test create object."""
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
        obj = self.Factory(
            sales_order=SalesOrderFactory(erpnext_code='Sales Order 1'),
            agreement_detail=AgreementDetailFactory(
                agreement=AgreementFactory(name='Agreement 1')
            ),
        )
        self.assertIsInstance(obj, self.Model)
        query = self.Model.objects.filter(id=obj.id)
        self.assertTrue(query.exists())
        self.assertEqual(
            query.first().name, 'Sales Order 1 - Agreement 1'
        )

    @patch('geohosting.models.sales_order.add_erp_next_comment')
    @patch('geohosting.models.sales_order.verify_paystack_payment')
    @patch('geohosting.models.erp_model.put_to_erpnext')
    @patch('geohosting.models.erp_model.post_to_erpnext')
    def test_read_object(
            self, mock_post_to_erpnext, mock_put_to_erpnext,
            mock_verify_paystack_payment, mock_add_erp_next_comment
    ):
        """Test read object."""
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
        obj = self.Factory()
        fetched_obj = self.Model.objects.get(id=obj.id)
        self.assertEqual(obj, fetched_obj)

    @patch('geohosting.models.sales_order.add_erp_next_comment')
    @patch('geohosting.models.sales_order.verify_paystack_payment')
    @patch('geohosting.models.erp_model.put_to_erpnext')
    @patch('geohosting.models.erp_model.post_to_erpnext')
    def test_update_object(
            self, mock_post_to_erpnext, mock_put_to_erpnext,
            mock_verify_paystack_payment, mock_add_erp_next_comment
    ):
        """Test update object."""
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
        obj = self.Factory()
        agreement_detail = AgreementDetailFactory()
        obj.agreement_detail = agreement_detail
        obj.save()
        updated_obj = self.Model.objects.get(id=obj.id)
        self.assertEqual(updated_obj.agreement_detail, agreement_detail)

    @patch('geohosting.models.sales_order.add_erp_next_comment')
    @patch('geohosting.models.sales_order.verify_paystack_payment')
    @patch('geohosting.models.erp_model.put_to_erpnext')
    @patch('geohosting.models.erp_model.post_to_erpnext')
    def test_delete_object(
            self, mock_post_to_erpnext, mock_put_to_erpnext,
            mock_verify_paystack_payment, mock_add_erp_next_comment
    ):
        """Test delete object."""
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
        obj = self.Factory()
        _id = obj.id
        obj.delete()
        self.assertFalse(self.Model.objects.filter(id=_id).exists())
