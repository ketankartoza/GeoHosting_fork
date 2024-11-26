# coding=utf-8
"""
Geohosting.

.. note:: Factory classes for Agreement
"""
import factory
from factory.django import DjangoModelFactory

from geohosting.factories.sales_order import SalesOrderFactory
from geohosting.models.agreement import (
    Agreement, AgreementDetail, SalesOrderAgreement
)


class AgreementFactory(DjangoModelFactory):
    """Factory class for Agreement model."""

    class Meta:  # noqa
        model = Agreement

    name = factory.Sequence(
        lambda n: f'agreement-{n}'
    )


class AgreementDetailFactory(DjangoModelFactory):
    """Factory class for AgreementDetail model."""

    class Meta:  # noqa
        model = AgreementDetail

    agreement = factory.SubFactory(AgreementFactory)


class SalesOrderAgreementFactory(DjangoModelFactory):
    """Factory class for SalesOrderAgreement model."""

    class Meta:  # noqa
        model = SalesOrderAgreement

    sales_order = factory.SubFactory(SalesOrderFactory)
    agreement_detail = factory.SubFactory(AgreementDetailFactory)
