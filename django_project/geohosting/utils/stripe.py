"""Utility functions for working with stripe."""
from decimal import Decimal

import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY


def test_connection():
    """Test connection to Stripe API."""
    stripe.Customer.list()


def create_stripe_price(
        name: str, currency: str, amount: Decimal, interval: str,
        features: list
) -> str:
    """Create a stripe object.

    :rtype: str
    :return: Stripe price id
    """
    prices = stripe.Price.list(limit=3, lookup_keys=[name]).data
    try:
        price = prices[0]
    except IndexError:
        price = stripe.Price.create(
            currency=currency,
            unit_amount_decimal=amount * 100,
            lookup_key=name,
            recurring={
                "interval": interval
            },
            product_data={
                "name": name
            },
        )

    try:
        for feature in features:
            try:
                feature = stripe.entitlements.Feature.list(
                    lookup_key=feature
                ).data[0]
            except IndexError:
                feature = stripe.entitlements.Feature.create(
                    name=feature,
                    lookup_key=feature
                )
            try:
                stripe.Product.create_feature(
                    price.product,
                    entitlement_feature=feature,
                )
            except stripe._error.InvalidRequestError:
                pass
    except (KeyError, ValueError):
        pass
    return price.id


def get_checkout_detail(checkout_id):
    """Return checkout checkout detail."""
    return stripe.checkout.Session.retrieve(checkout_id)
