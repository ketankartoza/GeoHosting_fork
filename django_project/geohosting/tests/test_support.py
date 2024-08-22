from django.test import TestCase
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from geohosting.models.support import Ticket
from geohosting.serializer.support import TicketSerializer
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse


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
            '/api/support/tickets/create/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['subject'], payload['subject'])

    def test_create_ticket_invalid_data(self):
        # Define the payload with missing required fields
        payload = {
            'subject': '',  # Invalid subject
        }
        response = self.client.post(
            '/api/support/tickets/create/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('details', response.data)

class GetTicketsTestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', email='testuser@example.com', password='testpassword')
        
        # Create another user to ensure we only fetch tickets for the authenticated user
        self.other_user = User.objects.create_user(username='otheruser', email='otheruser@example.com', password='otherpassword')
        
        # Create tickets for the authenticated user
        self.ticket1 = Ticket.objects.create(customer=self.user.email, subject="Issue 1", details="Details of issue 1", status="open", issue_type="bug")
        self.ticket2 = Ticket.objects.create(customer=self.user.email, subject="Issue 2", details="Details of issue 2", status="open", issue_type="support")
        
        # Create a ticket for another user
        self.ticket3 = Ticket.objects.create(customer=self.other_user.email, subject="Issue 3", details="Details of issue 3", status="open", issue_type="feature")
        
        # Initialize the client and authenticate the user
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
    
    def test_get_tickets(self):
        # Define the URL for the get_tickets view
        url = reverse('get_tickets')
        
        # Send a GET request to the get_tickets endpoint
        response = self.client.get(url)
        
        # Fetch the tickets for the authenticated user directly from the database
        tickets = Ticket.objects.filter(customer=self.user.email)
        serializer = TicketSerializer(tickets, many=True)
        
        # Verify that the status code is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify that the returned data matches the serialized ticket data
        self.assertEqual(response.data, serializer.data)

        # Ensure only the tickets belonging to the authenticated user are returned
        self.assertEqual(len(response.data), 2)
        self.assertNotIn(self.ticket3, tickets)

    def tearDown(self):
        # Clean up any created objects
        self.user.delete()
        self.other_user.delete()
        Ticket.objects.all().delete()


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
