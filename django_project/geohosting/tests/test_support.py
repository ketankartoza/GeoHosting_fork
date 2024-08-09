from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from geohosting.models.support import Ticket
from geohosting.serializer.support import TicketSerializer
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile


class TicketTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='tinashe@test.com',
            password='password123'
        )
        # Authenticate the client
        self.client.force_authenticate(user=self.user)

    def test_create_ticket_success(self):
        # Define the payload for a successful ticket creation
        payload = {
            'subject': 'Test Ticket',
            'details': 'Details of the test ticket',
            'status': 'open',
            'customer': 'tinashe@test.com'
        }
        response = self.client.post(
            '/api/support/tickets/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['subject'], payload['subject'])

    def test_create_ticket_invalid_data(self):
        # Define the payload with missing required fields
        payload = {
            'subject': '',  # Invalid subject
        }
        response = self.client.post(
            '/api/support/tickets/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('details', response.data)


class AttachmentTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='tinashe@test.com',
            password='password123'
        )
        # Authenticate the client
        self.client.force_authenticate(user=self.user)
        # Create a test ticket
        self.ticket = Ticket.objects.create(
            subject='Test Ticket',
            details='Details of the test ticket',
            status='open'
        )

    def test_upload_attachments_success(self):
        # Create a mock file
        mock_file = SimpleUploadedFile(
            "test_file.txt", b"test content", content_type="text/plain")
        response = self.client.post(
            f'/api/support/tickets/{self.ticket.id}/attachments/',
            {'attachments': [mock_file]},
            format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data), 1)

    def test_upload_attachments_ticket_not_found(self):
        # Upload attachments to a non-existent ticket
        mock_file = SimpleUploadedFile(
            "test_file.txt", b"test content", content_type="text/plain")
        response = self.client.post(
            '/api/support/tickets/999/attachments/',
            {'attachments': [mock_file]},
            format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'Ticket not found')

    def test_upload_attachments_invalid_file(self):
        # Upload a file without providing the file field
        response = self.client.post(
            f'/api/support/tickets/{self.ticket.id}/attachments/',
            {},
            format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'No files provided')
