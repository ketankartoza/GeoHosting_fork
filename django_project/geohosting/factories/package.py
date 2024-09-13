# coding=utf-8
"""
Geohosting.

.. note:: Factory classes for Package
"""
import factory
from factory.django import DjangoModelFactory

from geohosting.factories.product import ProductFactory
from geohosting.models import Package, PackageGroup


class PackageGroupFactory(DjangoModelFactory):
    """Factory class for PackageGroup model."""

    class Meta:  # noqa
        model = PackageGroup

    name = factory.Sequence(
        lambda n: f'package-{n}'
    )
    package_code = factory.Sequence(
        lambda n: f'package_code-{n}'
    )


class PackageFactory(DjangoModelFactory):
    """Factory class for Package model."""

    class Meta:  # noqa
        model = Package

    product = factory.SubFactory(ProductFactory)
    package_group = factory.SubFactory(PackageGroupFactory)
    name = factory.Sequence(
        lambda n: f'package-{n}'
    )
    price = 100
