from rest_framework import serializers

from geohosting.models import Instance
from geohosting.serializer.product import (
    ProductPackageSerializer,
    ProductDetailSerializer
)


class InstanceSerializer(serializers.ModelSerializer):
    """Sales instance serializer."""

    url = serializers.SerializerMethodField()
    package = serializers.SerializerMethodField()
    product = serializers.SerializerMethodField()

    class Meta:
        model = Instance
        fields = '__all__'

    def get_url(self, obj: Instance):
        """Return url."""
        return f'https://{obj.name}.{obj.cluster.domain}'

    def get_package(self, obj: Instance):
        """Return package."""
        return ProductPackageSerializer(obj.price).data

    def get_product(self, obj: Instance):
        """Return product."""
        return ProductDetailSerializer(obj.price.product).data
