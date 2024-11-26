# coding=utf-8
"""
GeoHosting Controller.

.. note:: Agreement.
"""

from django.urls import reverse
from rest_framework import serializers

from geohosting.models.agreement import AgreementDetail, SalesOrderAgreement


class AgreementDetailSerializer(serializers.ModelSerializer):
    """Serializer for AgreementDetail."""

    name = serializers.SerializerMethodField()

    def get_name(self, agreement: AgreementDetail):
        """Return AgreementDetail."""
        return agreement.agreement.name

    class Meta:  # noqa: D106
        model = AgreementDetail
        fields = '__all__'


class SalesOrderAgreementSerializer(serializers.ModelSerializer):
    """Serializer for SalesOrderAgreement."""

    download_url = serializers.SerializerMethodField()

    def get_download_url(self, agreement: AgreementDetail):
        """Return download url for the agreement."""
        return reverse(
            'agreements-download', kwargs={'pk': agreement.pk}
        )

    class Meta:  # noqa: D106
        model = SalesOrderAgreement
        fields = '__all__'
