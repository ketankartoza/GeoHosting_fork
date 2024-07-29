from rest_framework import serializers

from geohosting.models import (
    Product, ProductMedia, Package
)


class ProductMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductMedia
        fields = '__all__'


class ProductPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = '__all__'


class ProductListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'order', 'upstream_id',
            'description', 'image', 'available']


class ProductDetailSerializer(serializers.ModelSerializer):
    images = ProductMediaSerializer(many=True, read_only=True)
    packages = ProductPackageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = '__all__'
