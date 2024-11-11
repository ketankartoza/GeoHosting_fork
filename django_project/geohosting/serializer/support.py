# serializers.py
from rest_framework import serializers

from geohosting.models.support import Ticket, Attachment


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'ticket', 'file', 'uploaded_at']

    def save(self, **kwargs):
        """On save."""
        instance = super().save(**kwargs)
        instance.post_to_erpnext()
        return instance


class TicketSerializer(serializers.ModelSerializer):
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id', 'customer', 'subject', 'details',
            'status', 'issue_type', 'created_at',
            'updated_at', 'attachments'
        ]

    def save(self, **kwargs):
        """On save."""
        instance = super().save(**kwargs)
        instance.post_to_erpnext()
        return instance
