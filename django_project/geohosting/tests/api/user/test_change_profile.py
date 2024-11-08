from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from geohosting.models.user_profile import UserProfile


class ChangeUserProfileTests(TestCase):
    """Change password  tests."""
    username = 'testuser'
    email = 'testuser@example.com'

    def setUp(self):
        """Set up test case."""
        self.user = User.objects.create_user(
            username=self.username,
            email=self.email,
            password='password',
            first_name='First',
            last_name='Last',
        )
        self.url = reverse('user-profile')
        self.client = APIClient()

    def tearDown(self):
        """Clean up after each test."""
        UserProfile.objects.all().delete()
        User.objects.all().delete()

    def test_not_login(self):
        """Test not login yet."""
        response = self.client.get(
            self.url, {}
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_user_profile(self):
        """Test get profile."""
        success = self.client.login(username=self.email, password='password')
        self.assertTrue(success)

        response = self.client.get(self.url)
        self.assertEqual(response.data['first_name'], 'First')
        self.assertEqual(response.data['last_name'], 'Last')
        self.assertEqual(response.data['email'], self.email)
        self.assertEqual(
            response.data['billing_information']['name'], None
        )
        self.assertEqual(
            response.data['billing_information']['address'], None
        )
        self.assertEqual(
            response.data['billing_information']['postal_code'], None
        )
        self.assertEqual(
            response.data['billing_information']['country'], None
        )
        self.assertEqual(
            response.data['billing_information']['city'], None
        )
        self.assertEqual(
            response.data['billing_information']['region'], None
        )
        self.assertEqual(
            response.data['billing_information']['tax_number'], None
        )

    def test_update_user_profile(self):
        """Test update profile."""
        success = self.client.login(username=self.email, password='password')
        self.assertTrue(success)

        response = self.client.put(
            self.url, {
                'first_name': 'First name',
                'last_name': 'Last name',
                'email': 'email@changed.com',
                'billing_information': {
                    'name': 'name',
                    'address': 'address',
                    'postal_code': 'postal_code',
                    'country': 'country',
                    'city': 'city',
                    'region': 'region',
                    'tax_number': 'tax_number',
                }
            },
            format='json'
        )
        self.assertEqual(response.data['first_name'], 'First name')
        self.assertEqual(response.data['last_name'], 'Last name')
        self.assertEqual(response.data['email'], 'email@changed.com')
        self.assertEqual(
            response.data['billing_information']['name'], 'name'
        )
        self.assertEqual(
            response.data['billing_information']['address'], 'address'
        )
        self.assertEqual(
            response.data['billing_information']['postal_code'], 'postal_code'
        )
        self.assertEqual(
            response.data['billing_information']['country'], 'country'
        )
        self.assertEqual(
            response.data['billing_information']['city'], 'city'
        )
        self.assertEqual(
            response.data['billing_information']['region'], 'region'
        )
        self.assertEqual(
            response.data['billing_information']['tax_number'], 'tax_number'
        )
