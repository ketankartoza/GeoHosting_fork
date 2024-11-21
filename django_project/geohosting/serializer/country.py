# coding=utf-8
"""
GeoHosting Controller.

.. note:: Country.
"""

from rest_framework import serializers

from geohosting.models.country import Country


class CountrySerializer(serializers.ModelSerializer):
    """Serializer for Country."""

    class Meta:  # noqa: D106
        model = Country
        fields = '__all__'
