"""Utility functions for working with paystack."""
from decimal import Decimal

from django.conf import settings
from paystackapi.paystack import Paystack
from paystackapi.plan import Plan
from paystackapi.transaction import Transaction

paystack = Paystack(secret_key=settings.PAYSTACK_SECRET_KEY)


def test_connection():
    """Test connection to Paystack API."""
    response = Plan.list()
    if not response['status']:
        raise ConnectionError(response['message'])


def create_paystack_price(
        name: str, currency: str, amount: Decimal, interval: str,
        features: list
) -> str:
    """Create a paystack object.

    :rtype: str
    :return: Paystack price id
    """
    plans = [
        plan for plan in Plan.list()['data'] if
        not plan['is_deleted'] and not plan['is_archived']
    ]
    for plan in plans:
        if plan['name'] == name:
            return plan['id']
    response = Plan.create(
        name=name,
        description=f'Features: {features}',
        amount=float(amount * 100),
        interval=interval,
        currency=currency
    )
    if not response['status']:
        raise Exception(response['message'])
    return response['data']['id']


def verify_paystack_payment(reference):
    """Return if the reference is valid."""
    return Transaction.verify(reference)
