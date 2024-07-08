# coding=utf-8
"""
GeoHosting Controller.

.. note:: Activity.
"""

from rest_framework import serializers

from geohosting.models import Activity, ActivityType


class ActivitySerializer(serializers.ModelSerializer):
    """Serializer for Activity."""

    activity_type = serializers.SerializerMethodField()
    product = serializers.SerializerMethodField()

    def get_activity_type(self, obj: Activity):
        """Return category."""
        return obj.activity_type.identifier

    def get_product(self, obj: Activity):
        """Return product."""
        return obj.product.name

    class Meta:  # noqa: D106
        model = Activity
        fields = '__all__'


class ActivityTypeSerializer(serializers.ModelSerializer):
    """Serializer for ActivityType."""

    class Meta:  # noqa: D106
        model = ActivityType
        fields = '__all__'
