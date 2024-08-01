from rest_framework import mixins, viewsets
from rest_framework.exceptions import NotFound

from geohosting.models import Product
from geohosting.permissions import IsAdminOrReadOnly
from geohosting.serializer.product import (
    ProductDetailSerializer, ProductListSerializer
)


class ProductViewSet(mixins.CreateModelMixin,
                     mixins.RetrieveModelMixin,
                     mixins.UpdateModelMixin,
                     mixins.DestroyModelMixin,
                     mixins.ListModelMixin,
                     viewsets.GenericViewSet):
    queryset = Product.objects.all()
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    def get_object(self):
        lookup_value = self.kwargs.get(self.lookup_field)

        if lookup_value.isdigit():
            return super().get_object()
        else:
            try:
                return Product.objects.get(
                    name__iexact=lookup_value)
            except Product.DoesNotExist:
                raise NotFound('Product not found')
