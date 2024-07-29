from rest_framework import mixins, viewsets

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
