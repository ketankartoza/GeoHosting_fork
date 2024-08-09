# serializers.py
from rest_framework import serializers
from geohosting.models.support import Ticket, Attachment


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'file', 'uploaded_at']


class TicketSerializer(serializers.ModelSerializer):
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Ticket
        fields = ['id', 'customer', 'subject', 'details',
                  'status', 'created_at', 'updated_at', 'attachments']
