from django.conf import settings
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase, APIClient


class DjangoSettingAPITest(APITestCase):
    """Test for django test API."""

    def setUp(self):
        self.admin_user = User.objects.create_superuser(
            'admin', 'admin@test.com', 'password'
        )
        admin_token = Token.objects.create(user=self.admin_user)
        self.url = reverse('django-settings-api')
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + admin_token.key)
        settings.STRIPE_PUBLISHABLE_KEY = 'test'

    def test_no_login(self):
        """Test when not logged in."""
        client = APIClient()
        response = client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_with_no_params(self):
        """Test when no parameters."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue('key' in str(response.content.decode('utf-8')))

    def test_login_with_forbidden_key(self):
        """Test when using no forbidden key."""
        response = self.client.get(self.url, data={'key': 'forbidden'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue('forbidden' in response.content.decode('utf-8'))

    def test_login_with_correct_key(self):
        """Test when using no forbidden key."""
        response = self.client.get(
            self.url, data={'key': 'STRIPE_PUBLISHABLE_KEY'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.content.decode('utf-8'), 'test')
