from django.urls import reverse
from django.contrib.auth.models import User
from django.core.mail import outbox
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from django.utils.crypto import get_random_string
from django.contrib.auth.hashers import make_password

from geohosting.models.user_profile import UserProfile


class PasswordResetTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='password123'
        )
        self.password_reset_url = reverse('reset_password')
        self.password_reset_confirm_url = reverse('password_reset_confirm')
        self.frontend_url = 'http://frontend-url'
        self.client = APIClient()

    def tearDown(self):
        UserProfile.objects.all().delete()
        User.objects.all().delete()


    def test_password_reset_success(self):
        response = self.client.post(self.password_reset_url, {
                                    'email': 'test@example.com'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Password reset link sent.')

    def test_password_reset_missing_email(self):
        response = self.client.post(self.password_reset_url, {'email': ''})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Email is required.')

    def test_password_reset_invalid_email(self):
        response = self.client.post(self.password_reset_url, {
                                    'email': 'invalid@example.com'})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'Email is not registered.')

    def test_password_reset_confirm_success(self):
        reset_token = get_random_string(32)
        self.user.userprofile.reset_token = reset_token
        self.user.userprofile.save()
        response = self.client.post(self.password_reset_confirm_url, {
            'token': reset_token,
            'new_password': 'newpassword'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Password has been reset.')
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpassword'))

    def test_password_reset_confirm_missing_fields(self):
        response = self.client.post(self.password_reset_confirm_url, {
            'token': '',
            'new_password': ''
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'],
                         'Token and new password are required.')

    def test_password_reset_confirm_invalid_token(self):
        response = self.client.post(self.password_reset_confirm_url, {
            'token': 'invalidtoken',
            'new_password': 'newpassword'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Invalid token.')
