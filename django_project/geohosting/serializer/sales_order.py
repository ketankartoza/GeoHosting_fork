from rest_framework import serializers

from geohosting.models import SalesOrder
from geohosting.serializer.product import ProductPackageSerializer


class SalesOrderSerializer(serializers.ModelSerializer):
    """Sales order serializer."""

    class Meta:
        model = SalesOrder
        fields = '__all__'


class SalesOrderDetailSerializer(serializers.ModelSerializer):
    """Sales order detail serializer."""

    package = serializers.SerializerMethodField()

    def get_package(self, obj: SalesOrder):
        """Return package."""
        return ProductPackageSerializer(obj.package).data

    class Meta:
        model = SalesOrder
        fields = '__all__'
