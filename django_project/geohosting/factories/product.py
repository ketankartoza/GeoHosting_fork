# coding=utf-8
"""
Geohosting.

.. note:: Factory classes for Product
"""
import factory
from factory.django import DjangoModelFactory

from geohosting.models import Product


class ProductFactory(DjangoModelFactory):
    """Factory class for Product model."""

    class Meta:  # noqa
        model = Product

    name = factory.Sequence(
        lambda n: f'product-{n}'
    )
    upstream_id = factory.Sequence(
        lambda n: f'id-{n}'
    )
