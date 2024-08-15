# coding=utf-8
"""
GeoHosting.

.. note:: Package model.
"""
from django.db import models
from django.db.models import JSONField

from geohosting.models.product import Product
from geohosting.utils.paystack import create_paystack_price
from geohosting.utils.stripe import create_stripe_price


class Package(models.Model):
    """Package model for products."""

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='packages'
    )
    name = models.CharField(
        max_length=256
    )
    erpnext_code = models.CharField(
        default='',
        blank=True
    )
    erpnext_item_code = models.CharField(
        default='',
        blank=True
    )
    currency = models.CharField(
        default='',
        blank=True
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    periodicity = models.CharField(
        max_length=256,
        default='monthly'
    )
    feature_list = JSONField(
        blank=True,
        null=True
    )
    order = models.PositiveIntegerField(
        default=0
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        auto_now=True
    )
    package_code = models.CharField(
        max_length=256,
        blank=True,
        null=True,
        help_text='This is the package code of the product on jenkins.'
    )
    stripe_id = models.CharField(
        blank=True,
        null=True,
        help_text='Price id on the stripe.'
    )
    paystack_id = models.CharField(
        blank=True,
        null=True,
        help_text='Price id on the paystack.'
    )

    class Meta:
        ordering = ['product__order', 'order']

    def __str__(self):
        """Return package name and price."""
        return f"{self.name} - {self.price}"

    # ----------------------------------------------------
    # STRIPE
    # ----------------------------------------------------
    def _create_stripe_price_id(self):
        """Create price id on stripe."""
        features = []
        try:
            features = self.feature_list['spec']
        except KeyError:
            pass
        if self.price and not self.stripe_id:
            self.stripe_id = create_stripe_price(
                self.name, self.currency, self.price,
                self.periodicity.replace('ly', ''),
                features
            )
            self.save()

    def get_stripe_price_id(self):
        """Return price id on stripe."""
        if not self.stripe_id:
            self._create_stripe_price_id()
        return self.stripe_id

    # ----------------------------------------------------
    # PAYSTACK
    # ----------------------------------------------------
    def _create_paystack_price_id(self):
        """Create price id on paystack."""
        features = []
        try:
            features = self.feature_list['spec']
        except KeyError:
            pass
        if self.price and not self.paystack_id:
            self.paystack_id = create_paystack_price(
                self.name, self.currency, self.price,
                self.periodicity,
                features
            )
            self.save()

    def get_paystack_price_id(self):
        """Return price id on paystack."""
        if not self.paystack_id:
            self._create_paystack_price_id()
        return self.paystack_id
