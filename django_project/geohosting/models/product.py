from django.db import models
from django.db.models import JSONField

from geohosting.models.cluster import Cluster
from geohosting.models.fields import SVGAndImageField


class Product(models.Model):
    """Product model."""

    name = models.CharField(
        max_length=256)
    order = models.PositiveIntegerField(default=0)
    upstream_id = models.CharField(
        max_length=256)
    description = models.TextField(blank=True)
    cluster = models.ForeignKey(
        Cluster,
        on_delete=models.CASCADE,
        blank=True,
        null=True
    )
    image = SVGAndImageField(
        upload_to='product_images/',
        null=True,
        blank=True
    )
    available = models.BooleanField(
        default=False
    )

    class Meta:
        ordering = ['order']

    def __str__(self):
        """Return product name."""
        return self.name


class ProductMedia(models.Model):
    """Product Media model."""

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images')
    image = models.ImageField(upload_to='product_media/')
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        """Return image file name."""
        return self.image.name

    class Meta:
        ordering = ['product__order', 'order']


class Pricing(models.Model):
    """Pricing model for products."""

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='pricings'
    )
    name = models.CharField(max_length=256)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    feature_list = JSONField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['product__order', 'order']

    def __str__(self):
        """Return pricing name and price."""
        return f"{self.name} - {self.price}"
