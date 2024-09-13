from rest_framework import serializers

from geohosting.models import SalesOrder, Instance
from geohosting.serializer.instance import InstanceSerializer
from geohosting.serializer.product import (
    ProductPackageSerializer,
    ProductDetailSerializer
)


class SalesOrderSerializer(serializers.ModelSerializer):
    """Sales order serializer."""

    class Meta:
        model = SalesOrder
        fields = '__all__'


class SalesOrderDetailSerializer(serializers.ModelSerializer):
    """Sales order detail serializer."""

    product = serializers.SerializerMethodField()
    package = serializers.SerializerMethodField()
    invoice_url = serializers.SerializerMethodField()
    instance = serializers.SerializerMethodField()

    def get_product(self, obj: SalesOrder):
        """Return product."""
        return ProductDetailSerializer(obj.package.product).data

    def get_package(self, obj: SalesOrder):
        """Return package."""
        return ProductPackageSerializer(obj.package).data

    def get_invoice_url(self, obj: SalesOrder):
        """Return package."""
        return obj.invoice_url

    def get_instance(self, obj: SalesOrder):
        """Return package."""
        try:
            return InstanceSerializer(
                Instance.objects.get(name=obj.app_name)
            ).data
        except Instance.DoesNotExist:
            return None

    class Meta:
        model = SalesOrder
        fields = '__all__'
