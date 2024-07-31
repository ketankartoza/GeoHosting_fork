from unittest import TestCase
from unittest.mock import patch, MagicMock

from django.test import RequestFactory
from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.models import User
from geohosting.models import Product


class ProductViewSetTest(APITestCase):

    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser('admin', 'admin@test.com', 'password')
        self.regular_user = User.objects.create_user('user', 'user@test.com', 'password')

        # Generate token for admin user
        self.admin_token = Token.objects.create(user=self.admin_user)

        self.product = Product.objects.create(
            name='Test Product',
            order=1,
            upstream_id='123',
            description='Test Description',
            available=True
        )
        self.product_url = reverse('product-detail', kwargs={'pk': self.product.pk})
        self.products_url = reverse('product-list')

    def test_public_get_list(self):
        response = self.client.get(self.products_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_public_get_detail(self):
        response = self.client.get(self.product_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_create_product(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)
        data = {
            'name': 'New Product',
            'order': 2,
            'upstream_id': '456',
            'description': 'New Description',
            'available': True
        }
        response = self.client.post(self.products_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_admin_update_product(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)
        data = {
            'name': 'Updated Product',
            'order': 1,
            'upstream_id': '123',
            'description': 'Updated Description',
            'available': True
        }
        response = self.client.put(self.product_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_delete_product(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)
        response = self.client.delete(self.product_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_non_admin_create_product(self):
        self.client.login(username='user', password='password')
        data = {
            'name': 'New Product',
            'order': 2,
            'upstream_id': '456',
            'description': 'New Description',
            'available': True
        }
        response = self.client.post(self.products_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_non_admin_update_product(self):
        self.client.login(username='user', password='password')
        data = {
            'name': 'Updated Product',
            'order': 1,
            'upstream_id': '123',
            'description': 'Updated Description',
            'available': True
        }
        response = self.client.put(self.product_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_non_admin_delete_product(self):
        self.client.login(username='user', password='password')
        response = self.client.delete(self.product_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class FetchProductsTestCase(TestCase):

    def setUp(self):
        User.objects.all().delete()
        Product.objects.all().delete()
        self.client = APIClient()
        self.factory = RequestFactory()
        self.user = User.objects.create_user(
            username='admin', password='password', is_staff=True)
        self.url = reverse('fetch_products')

    @patch('geohosting.views.products.fetch_erpnext_data')
    @patch('geohosting.views.products.requests.get')
    def test_fetch_products_success(self, mock_get, mock_fetch_erpnext_data):
        # Mocking the ERPNext data fetch
        mock_fetch_erpnext_data.side_effect = [[
            {'name': 'product_1', 'item_name': 'Product 1',
             'description': '<div><p><strong>short description</strong></p><p>Biodiversity Information Management System.</p><p><br>',
             'image': '/path/to/image1.jpg', 'published_in_website': 1},
            {'name': 'product_2', 'item_name': 'Product 2',
             'description': '<div><p><strong>short description</strong></p><p>Biodiversity Information Management System.</p><p><br>',
             'image': '/path/to/image2.jpg', 'published_in_website': 0}
        ]]

        # Mocking the image download
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = b'fake image content'
        mock_get.return_value = mock_response

        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')

        # Ensure products were created
        self.assertEqual(Product.objects.count(), 2)
        product1 = Product.objects.get(upstream_id='product_1')
        self.assertEqual(product1.name, 'Product 1')
        self.assertTrue(product1.available)
        self.assertIsNotNone(product1.image.name)

        product2 = Product.objects.get(upstream_id='product_2')
        self.assertEqual(product2.name, 'Product 2')
        self.assertFalse(product2.available)

    @patch('geohosting.views.products.fetch_erpnext_data')
    @patch('geohosting.views.products.requests.get')
    def test_fetch_products_image_download_fail(self, mock_get, mock_fetch_erpnext_data):
        # Mocking the ERPNext data fetch
        mock_fetch_erpnext_data.side_effect = [[
            {'name': 'product_2', 'item_name': 'Product 2',
             'description': '<div><p><strong>short description</strong></p><p>Biodiversity Information Management System.</p><p><br>',
             'image': ''}
        ]]

        # Mocking the image download failure
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_get.return_value = mock_response

        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')

        # Ensure product was created without image
        product1 = Product.objects.get(upstream_id='product_2')
        self.assertEqual(product1.image.name, '')
