import json
import threading

from django.http import HttpResponseBadRequest
from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.api import FilteredAPI
from geohosting.models.company import Company, CompanyContact
from geohosting.models.country import Country
from geohosting.serializer.company import (
    CompanySerializer, CompanyDetailSerializer,
    CompanyBillingInformationSerializer
)


class CompanyViewSet(
    FilteredAPI,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet
):
    """Sales order viewset."""

    permission_classes = [IsAuthenticated]
    default_query_filter = ['name__icontains']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CompanyDetailSerializer
        return CompanySerializer

    def get_queryset(self):
        """Return instances for the authenticated user."""
        contact = CompanyContact.objects.filter(
            user=self.request.user
        )
        query = Company.objects.filter(
            id__in=contact.values_list('id', flat=True)
        )
        return self.filter_query(self.request, query)

    def post_data(self, request, company):
        try:
            data = request.data

            # If it is payload, we need to use it as data
            if data.get('payload'):
                try:
                    data = json.loads(data.get('payload'))
                except json.JSONDecodeError:
                    return HttpResponseBadRequest(
                        'payload is invalid json'
                    )
            user = request.user
            serializer = CompanySerializer(company, data=data)
            serializer.is_valid(raise_exception=True)
            company = serializer.save()

            # Save as contact
            CompanyContact.objects.get_or_create(
                user=user,
                company=company,
            )

            try:
                company.avatar = request.FILES['avatar']
                company.save()
            except KeyError:
                pass

            billing_data = data['billing_information']
            country = billing_data.get('country', None)
            country_obj = None
            if country:
                try:
                    country_obj = Country.objects.get(
                        name=country
                    )
                    billing_data['country'] = country_obj
                except Country.DoesNotExist:
                    return HttpResponseBadRequest(
                        f'Country {country} does not exist'
                    )

            billing_data['company'] = company.pk

            billing = company.companybillinginformation
            billing_serializer = CompanyBillingInformationSerializer(
                billing, data=billing_data
            )
            billing_serializer.is_valid(raise_exception=True)
            billing_serializer.save()
            billing.country = country_obj
            billing.save()
            threading.Thread(
                target=company.post_to_erpnext
            ).start()
            return Response(serializer.data)
        except KeyError as e:
            return HttpResponseBadRequest(f'{e} is required')

    def create(self, request, *args, **kwargs):
        return self.post_data(request, Company())

    def update(self, request, *args, **kwargs):
        return self.post_data(request, self.get_object())
