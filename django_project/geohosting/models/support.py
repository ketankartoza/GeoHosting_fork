# models.py
from django.db import models
from geohosting.utils.erpnext import post_to_erpnext
from rest_framework.response import Response
from rest_framework import status


class Ticket(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('closed', 'Closed'),
        ('pending', 'Pending'),
    ]
    ISSUE_CHOICES = [
        ('Bug', 'Bug'),
        ('Feature Request', 'Feature Request'),
        ('Support', 'Support'),
    ]

    customer = models.EmailField()
    subject = models.CharField(max_length=255)
    details = models.TextField()
    status = models.CharField(
        max_length=7, choices=STATUS_CHOICES, default='open')
    issue_type = models.CharField(
        max_length=15, choices=ISSUE_CHOICES, default='Support')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def post_to_erpnext(self):
        data = {
            "doctype": "Issue",
            "raised_by": self.customer,
            "owner": self.customer,
            "issue_type": self.subject,
            "description": self.details,
            "status": self.status
        }
        result = post_to_erpnext(data, 'Issue')
        if result['status'] == 'success':
            self.save()



class Attachment(models.Model):
    ticket = models.ForeignKey(
        Ticket, related_name='attachments', on_delete=models.CASCADE)
    file = models.FileField(upload_to='ticket_attachments/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def post_to_erpnext(self):
        data = {
            'is_private': '1',
            'folder': 'Home/Attachments',
            'doctype': 'Issue',
            'docname': self.ticket
        }

        # Upload the file to ERPNext
        result = post_to_erpnext(data, 'upload_file', file=self.file)
        if result['status'] != 'success':
            return Response(
                {'error': f"Failed to upload file: {result['message']}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
