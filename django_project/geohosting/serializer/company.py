"""
GeoHosting.

.. note:: User serializer.
"""
from django.contrib.auth import get_user_model
from rest_framework import serializers

from geohosting.models import CompanyBillingInformation, Company
from geohosting.serializer.billing_information import (
    BillingInformationSerializer
)

User = get_user_model()


class CompanyBillingInformationSerializer(BillingInformationSerializer):
    """Company UserBillingInformation serializer."""

    class Meta:  # noqa: D106
        model = CompanyBillingInformation
        exclude = ('id',)


class CompanySerializer(serializers.ModelSerializer):
    """Company serializer."""

    class Meta:  # noqa: D106
        model = Company
        fields = ('id', 'name')


class CompanyDetailSerializer(serializers.ModelSerializer):
    """Company serializer."""

    billing_information = serializers.SerializerMethodField()

    def get_billing_information(self, company: Company):
        """Return CompanyBillingInformation."""
        try:
            billing_information = company.companybillinginformation
        except CompanyBillingInformation.DoesNotExist:
            billing_information = CompanyBillingInformation.objects.create(
                user=company
            )
        return CompanyBillingInformationSerializer(billing_information).data

    class Meta:  # noqa: D106
        model = Company
        fields = (
            'id', 'name', 'billing_information'
        )
