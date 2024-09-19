from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from geohosting.models import Instance, Package, Cluster, Region

from geohosting.models import Product

class InstanceViewSetTests(APITestCase):
    def setUp(self):
        """Create test user and instances."""
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            email='tinashe@test.com',
            password='password123'
        )
        # Authenticate the client
        self.client.force_authenticate(user=self.user)

        # Create test Region object
        self.region = Region.objects.create(name='Test Region')

        # Create test Cluster object with 'code' and 'region'
        self.cluster = Cluster.objects.create(code='Cluster Code', region=self.region, domain='example.com')

        # Create a test Product object
        self.product = Product.objects.create(
            name='Test Product',
            order=1,
            upstream_id='123',
            description='Test Description',
            available=True
        )
        
        # Create test Package with a valid product
        self.package = Package.objects.create(
            product=self.product,  # Assign a valid Product
            name='Test Package',
            price=100.00,
            periodicity='monthly',
            feature_list={'spec': ['10 GB Storage', '2 CPUs', '4 GB RAM']}
        )

        # Create test Instance object
        self.instance = Instance.objects.create(
            name='Test Instance',
            price=self.package,
            cluster=self.cluster,
            owner=self.user
        )


    def test_get_queryset(self):
        """Test that get_queryset returns instances for the authenticated user."""
        response = self.client.get('/api/instances/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertGreater(len(data), 0)

    def test_my_instances(self):
        """Test the custom action to return instances for the current user."""
        response = self.client.get('/api/instances/my_instances/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 1)  # Check that we have one instance
        self.assertEqual(data[0]['name'], self.instance.name)

    def test_unauthenticated_access(self):
        """Test that unauthenticated users cannot access the API."""
        self.client.logout()  # Log out the user
        response = self.client.get('/api/instances/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        response = self.client.get('/api/instances/my_instances/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
