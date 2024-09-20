# coding=utf-8
"""
GeoHosting.

.. note:: Product model.
"""

import os

from django.core.files.storage import default_storage
from django.db import models
from django.db.models.signals import pre_save
from django.dispatch import receiver

from geohosting.models.cluster import Cluster
from geohosting.models.fields import SVGAndImageField


class Product(models.Model):
    """Product model."""

    name = models.CharField(
        max_length=256
    )
    order = models.PositiveIntegerField(
        default=0
    )
    upstream_id = models.CharField(
        max_length=256
    )
    description = models.TextField(
        blank=True
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

    def save(self, *args, **kwargs):
        """Save model."""
        super(Product, self).save(*args, **kwargs)
        self.generate_data()

    def generate_data(self):
        """Generate data."""
        from geohosting.models.activity import (
            ActivityType, ActivityTypeMapping
        )
        from geohosting_controller.default_data import (
            get_jenkin_activity_types, get_product_clusters
        )

        jenkins_config = get_jenkin_activity_types()
        product_cluster = get_product_clusters()

        # Save jenkins config
        try:
            config = jenkins_config[self.name.lower()]
            mapping = config['mapping']
            del config['mapping']
            activity_type, _ = ActivityType.objects.update_or_create(
                product=self,
                defaults=config
            )
            for geohosting_key, jenkins_key in mapping.items():
                ActivityTypeMapping.objects.update_or_create(
                    activity_type=activity_type,
                    geohosting_key=geohosting_key,
                    defaults={
                        'jenkins_key': jenkins_key
                    }
                )
        except KeyError:
            pass

        # Save product cluster
        try:
            config = product_cluster[self.name.lower()]
            ProductCluster.objects.update_or_create(
                product=self,
                cluster=Cluster.objects.get(
                    code=config['cluster'],
                    region__code=config['region']
                ),
                defaults={
                    'environment': config['environment']
                }
            )
        except (KeyError, Cluster.DoesNotExist):
            pass


class ProductMetadata(models.Model):
    """Product metadata."""

    product = models.ForeignKey(
        Product, on_delete=models.CASCADE
    )
    key = models.CharField(
        max_length=256,
        help_text='The key of metadata of product.'
    )
    value = models.TextField(
        help_text='Metadata value for the product'
    )

    class Meta:
        unique_together = ['product', 'key']


class ProductCluster(models.Model):
    """Product x cluster model."""

    product = models.ForeignKey(
        Product, on_delete=models.CASCADE
    )
    cluster = models.ForeignKey(
        Cluster, on_delete=models.CASCADE
    )
    environment = models.CharField(
        max_length=256,
        help_text='The environment of the instance.',
        null=True, blank=True
    )

    class Meta:
        unique_together = ['product', 'cluster']


class ProductMedia(models.Model):
    """Product Media model."""

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images')
    image = models.ImageField(
        upload_to='product_media/'
    )
    title = models.TextField(
        blank=True
    )
    description = models.TextField(
        blank=True
    )
    order = models.PositiveIntegerField(
        default=0
    )

    def __str__(self):
        """Return image file name."""
        return self.image.name

    class Meta:
        ordering = ['product__order', 'order']


@receiver(pre_save, sender=Product)
@receiver(pre_save, sender=ProductMedia)
def delete_old_image(sender, instance, **kwargs):
    """Delete the old image file if a new image is being set."""
    if instance.pk:
        try:
            old_product = sender.objects.get(pk=instance.pk)
        except Product.DoesNotExist:
            return
        if old_product.image and instance.image != old_product.image:
            old_image_path = old_product.image.path
            if os.path.exists(old_image_path):
                default_storage.delete(old_image_path)
