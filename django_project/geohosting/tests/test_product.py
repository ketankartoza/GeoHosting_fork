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