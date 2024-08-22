# views.py
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    parser_classes,
    permission_classes
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from geohosting.models.support import Attachment
from geohosting.serializer.support import (
    TicketSerializer,
    AttachmentSerializer
)
from rest_framework.parsers import MultiPartParser
from geohosting.models.support import Ticket
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from geohosting.utils.erpnext import fetch_erpnext_data


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_tickets(request):
    user_email = request.user.email
    filters = [["owner", "=", user_email]]

    try:
        erp_tickets = fetch_erpnext_data(doctype="Issue", filters=filters)

        if not isinstance(erp_tickets, list):
            raise ValueError("Failed to fetch data from ERPNext")

        status_map = {
            'Open': 'open',
            'On Hold': 'pending',
            'Replied': 'pending',
            'Closed': 'closed',
        }

        for erp_ticket in erp_tickets:
            django_status = status_map.get(erp_ticket.get('status'), 'open')

            Ticket.objects.update_or_create(
                customer=user_email,
                defaults={
                    'details': erp_ticket.get('description'),
                    'status': django_status
                }
            )
    except Exception as e:
        print(f"Error fetching or updating tickets from ERPNext: {e}")

    tickets = Ticket.objects.filter(customer=user_email)
    ticket_serializer = TicketSerializer(tickets, many=True)

    return Response(ticket_serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_ticket(request):
    data = request.data
    ticket_serializer = TicketSerializer(data=data)
    if ticket_serializer.is_valid():
        ticket_serializer.save()
        return Response(ticket_serializer.data, status=status.HTTP_201_CREATED)
    return Response(
        ticket_serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['POST'])
@parser_classes([MultiPartParser])
@permission_classes([IsAuthenticated])
def upload_attachments(request, ticket_id):
    try:
        ticket = Ticket.objects.get(id=ticket_id)
    except Ticket.DoesNotExist:
        return Response(
            {'error': 'Ticket not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    files = request.FILES.getlist('attachments')

    # Check if files are provided
    if not files:
        return Response(
            {'error': 'No files provided'},
            status=status.HTTP_400_BAD_REQUEST
        )

    attachments = []
    for file in files:
        file_content = ContentFile(file.read())
        file_name = default_storage.save(
            f'attachments/{file.name}', file_content)
        attachment = Attachment(ticket=ticket, file=file_name)
        attachment.save()
        attachments.append(attachment)

    attachment_serializer = AttachmentSerializer(attachments, many=True)
    return Response(attachment_serializer.data, status=status.HTTP_201_CREATED)
