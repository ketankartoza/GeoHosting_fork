from rest_framework import serializers
from geohosting.models import Product, ProductMedia, Package, ProductMetadata


class ProductMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductMedia
        fields = '__all__'


class ProductPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = '__all__'


class ProductMetadataSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductMetadata
        fields = ['key', 'value']


class ProductListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'order', 'upstream_id',
            'description', 'image', 'available'
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    images = ProductMediaSerializer(many=True, read_only=True)
    packages = serializers.SerializerMethodField()
    product_meta = serializers.SerializerMethodField()

    def __init__(self, *args, **kwargs):
        self.currency = kwargs.pop('currency', None)
        super().__init__(*args, **kwargs)

    def get_packages(self, obj: Product):
        packages = obj.packages.all()

        if self.currency:
            preferred_currency_order = [self.currency]
            for currency in ['USD', 'EUR', 'ZAR']:
                if currency != self.currency:
                    preferred_currency_order.append(currency)
        else:
            preferred_currency_order = ['USD', 'EUR', 'ZAR']

        unique_packages = {}

        for package in packages:
            if package.name not in unique_packages:
                unique_packages[package.name] = package
            else:
                current_package = unique_packages[package.name]
                for currency in preferred_currency_order:
                    if (
                        package.currency == currency and
                        current_package.currency != currency
                    ):
                        unique_packages[package.name] = package
                        break

        sorted_packages = sorted(
            unique_packages.values(),
            key=lambda p: (
                'large' in p.name.lower(),
                'medium' in p.name.lower(),
                'small' in p.name.lower()
            )
        )

        return ProductPackageSerializer(sorted_packages, many=True).data

    def get_product_meta(self, obj: Product):
        metadata = ProductMetadata.objects.filter(product=obj)
        return ProductMetadataSerializer(metadata, many=True).data

    class Meta:
        model = Product
        fields = '__all__'
        extra_kwargs = {
            'product_meta': {'source': 'get_product_meta'}
        }
