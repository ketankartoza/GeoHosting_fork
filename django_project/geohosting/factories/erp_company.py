# coding=utf-8
"""
Geohosting.

.. note:: Factory classes for ErpCompany
"""
import factory
from factory.django import DjangoModelFactory

from geohosting.models import ErpCompany


class ErpCompanyFactory(DjangoModelFactory):
    """Factory class for ErpCompany model."""

    class Meta:  # noqa
        model = ErpCompany

    erpnext_code = factory.Sequence(
        lambda n: f'company-{n}'
    )
    name = factory.Sequence(
        lambda n: f'company-{n}'
    )
