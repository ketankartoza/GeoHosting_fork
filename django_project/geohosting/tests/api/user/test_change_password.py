from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from geohosting.models.user_profile import UserProfile


class ChangePasswordTests(TestCase):
    """Change password  tests."""
    username = 'testuser'
    email = 'testuser@example.com'

    def setUp(self):
        """Set up test case."""
        self.user = User.objects.create_user(
            username=self.username,
            email=self.email,
            password='password'
        )
        self.url = reverse('user-change-password')
        self.client = APIClient()

    def tearDown(self):
        """Clean up after each test."""
        UserProfile.objects.all().delete()
        User.objects.all().delete()

    def test_not_login(self):
        """Test not login yet."""
        response = self.client.put(
            self.url, {}
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_wrong_payload(self):
        """Test no payload."""
        success = self.client.login(username=self.email, password='password')
        self.assertTrue(success)

        response = self.client.put(
            self.url, {}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.content.decode("utf-8"), "'old_password' is required"
        )
        response = self.client.put(
            self.url, {
                "old_password": "password",
            }
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.content.decode("utf-8"), "'new_password' is required"
        )

    def test_success(self):
        """Test success."""
        success = self.client.login(username=self.email, password='password')
        self.assertTrue(success)

        response = self.client.put(
            self.url, {
                "old_password": "password",
                "new_password": "new_password"
            }
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Test login with old password
        success = self.client.login(
            username=self.email, password='password'
        )
        self.assertFalse(success)

        # Test login with new password
        success = self.client.login(
            username=self.email, password='new_password'
        )
        self.assertTrue(success)
