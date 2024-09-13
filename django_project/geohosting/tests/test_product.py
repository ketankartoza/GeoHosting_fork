from unittest import TestCase
from unittest.mock import patch, MagicMock

from django.test import RequestFactory
from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.models import User
from geohosting.models import Product, Package, ProductMetadata
from geohosting.serializer.product import ProductDetailSerializer



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
        mock_fetch_erpnext_data.side_effect = [
            [
                {
                    'name': 'product_1',
                    'item_name': 'Product 1',
                    'description': (
                        '<div><p><strong>short description</strong></p>'
                        '<p>Biodiversity Information Management System.</p>'
                        '<p><br></p>'
                        '<p><strong>overview header</strong></p>'
                        '<p>Biodiversity Informatics</p>'
                        '<p><br></p>'
                        '<p><strong>overview description</strong></p>'
                        '<p>A platform to curate biodiversity data. Discover and share biodiversity data. Built by biologists for scientists, natural resource managers and decision makers.</p>'
                        '<p><br></p>'
                        '<p><strong>overview continuation header</strong></p>'
                        '<p>Dashboards and Taxonomy</p>'
                        '<p><strong></strong></p>'
                        '<p><strong>overview continuation</strong></p>'
                        '<p>A comprehensive set of dashboards provide insights into the taxa that occur in your region. Manage taxonomy including synonyms, endemism, Red Data Book status, tags and more. </p>'
                        '<p><br></p>'
                    ),
                    'image': '/path/to/image1.jpg',
                    'available_in_geohosting': 1
                },
                {
                    'name': 'product_2',
                    'item_name': 'Product 2',
                    'description': '<div><p><strong>short description</strong></p><p>Biodiversity Information Management System.</p><p><br>',
                    'image': '/path/to/image2.jpg',
                    'available_in_geohosting': 0
                }
            ]
        ]

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

        # Check the metadata
        self.assertEqual(product1.productmetadata_set.count(), 5)
        self.assertEqual(
            product1.productmetadata_set.get(
                key='overview_continuation'
            ).value,
            (
                'A comprehensive set of dashboards provide insights into the '
                'taxa that occur in your region. Manage taxonomy including '
                'synonyms, endemism, Red Data Book status, tags and more.'
            )
        )

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

class ProductViewSetTestCase(APITestCase):
    def setUp(self):
        # Create test product
        self.product = Product.objects.create(
            name="BIMS",
            description="Biodiversity Information Management System.",
            upstream_id='123',
            available=True,
        )
        
        # Create test packages
        self.product = Product.objects.create(
            name="BIMS",
            description="Biodiversity Information Management System.",
            upstream_id='123',
            available=True,
        )
        
        # Create test packages
        self.package1 = Package.objects.create(
            name="BIMS-SMALL-DO",
            currency="EUR",
            price="6155.58",
            periodicity="monthly",
            product=self.product,
        )
        self.package2 = Package.objects.create(
            name="BIMS-SMALL-DO",
            currency="USD",
            price="6695.12",
            periodicity="monthly",
            product=self.product,
        )
        self.package3 = Package.objects.create(
            name="BIMS-SMALL-DO",
            currency="ZAR",
            price="7890.52",
            periodicity="monthly",
            product=self.product,
        )
        self.package1 = Package.objects.create(
            name="BIMS-MEDIUM-DO",
            currency="EUR",
            price="6155.58",
            periodicity="monthly",
            product=self.product,
        )
        self.package2 = Package.objects.create(
            name="BIMS-MEDIUM-DO",
            currency="USD",
            price="6695.12",
            periodicity="monthly",
            product=self.product,
        )
        self.package3 = Package.objects.create(
            name="BIMS-MEDIUM-DO",
            currency="ZAR",
            price="7890.52",
            periodicity="monthly",
            product=self.product,
        )
        self.package1 = Package.objects.create(
            name="BIMS-LARGE-DO",
            currency="EUR",
            price="6155.58",
            periodicity="monthly",
            product=self.product,
        )
        self.package2 = Package.objects.create(
            name="BIMS-LARGE-DO",
            currency="USD",
            price="6695.12",
            periodicity="monthly",
            product=self.product,
        )
        self.package3 = Package.objects.create(
            name="BIMS-LARGE-DO",
            currency="ZAR",
            price="7890.52",
            periodicity="monthly",
            product=self.product,
        )

        # Create test metadata
        self.metadata1 = ProductMetadata.objects.create(
            product=self.product,
            key="meta_key_1",
            value="meta_value_1"
        )

        self.client = APIClient()
        self.url = reverse('product-detail', kwargs={'pk': self.product.pk})

    def test_retrieve_product_detail_with_currency(self):
        # Test retrieving product details with specific currency
        response = self.client.get(self.url, {'currency': 'USD'})
        self.assertEqual(response.status_code, 200)

        # Check if serializer is returning correct packages based on currency
        product_data = response.data
        serializer = ProductDetailSerializer(instance=self.product, context={'currency': 'USD'})

        self.assertEqual(product_data['packages'], serializer.data['packages'])
        self.assertEqual(product_data['packages'][0]['currency'], serializer.data['packages'][0]['currency'])
        self.assertEqual(product_data['images'], serializer.data['images'])
        self.assertEqual(product_data['product_meta'], serializer.data['product_meta'])

    def test_retrieve_product_detail_without_currency(self):
        # Test retrieving product details without specifying a currency
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)

        # Check if serializer is returning correct packages with default currency order
        product_data = response.data
        serializer = ProductDetailSerializer(instance=self.product)

        self.assertEqual(product_data['packages'], serializer.data['packages'])
        self.assertEqual(product_data['images'], serializer.data['images'])
        self.assertEqual(product_data['product_meta'], serializer.data['product_meta'])
