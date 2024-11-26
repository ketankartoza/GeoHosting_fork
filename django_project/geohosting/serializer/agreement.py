# coding=utf-8
"""
GeoHosting Controller.

.. note:: Agreement.
"""

from rest_framework import serializers

from geohosting.models.agreement import AgreementDetail


class AgreementDetailSerializer(serializers.ModelSerializer):
    """Serializer for AgreementDetail."""

    name = serializers.SerializerMethodField()

    def get_name(self, agreement: AgreementDetail):
        """Return AgreementDetail."""
        return agreement.agreement.name

    class Meta:  # noqa: D106
        model = AgreementDetail
        fields = '__all__'
