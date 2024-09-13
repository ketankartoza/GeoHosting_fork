# coding=utf-8
"""
Geohosting.

.. note:: Factory classes for Product
"""
import factory
from factory.django import DjangoModelFactory

from core.factories import UserFactory
from geohosting.factories.package import PackageFactory
from geohosting.models import SalesOrder


class SalesOrderFactory(DjangoModelFactory):
    """Factory class for SalesOrder model."""

    class Meta:  # noqa
        model = SalesOrder

    package = factory.SubFactory(PackageFactory)
    customer = factory.SubFactory(UserFactory)
