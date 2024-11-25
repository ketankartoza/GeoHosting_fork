# coding=utf-8
"""
GeoHosting.

.. note:: Instance model.
"""

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import EmailMessage
from django.db import models
from django.template.loader import render_to_string

from core.models.preferences import Preferences
from core.settings.base import FRONTEND_URL
from geohosting.models.cluster import Cluster
from geohosting.models.company import Company
from geohosting.models.package import Package
from geohosting.models.product import ProductCluster
from geohosting.utils.vault import get_credentials

User = get_user_model()


class InstanceStatus:
    """Instance Status."""

    DEPLOYING = 'Deploying'
    ONLINE = 'Online'
    OFFLINE = 'Offline'


class Instance(models.Model):
    """Instance model."""

    name = models.CharField(
        max_length=256
    )
    price = models.ForeignKey(
        Package, on_delete=models.CASCADE,
    )
    cluster = models.ForeignKey(
        Cluster, on_delete=models.CASCADE,
    )
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE
    )
    status = models.CharField(
        default=InstanceStatus.DEPLOYING,
        choices=(
            (InstanceStatus.DEPLOYING, InstanceStatus.DEPLOYING),
            (InstanceStatus.ONLINE, InstanceStatus.ONLINE),
            (InstanceStatus.OFFLINE, InstanceStatus.OFFLINE),
        )
    )
    company = models.ForeignKey(
        Company, on_delete=models.SET_NULL,
        null=True, blank=True,
        help_text=(
            'Keep blank if instance is for individual capacity..'
        )
    )

    def __str__(self):
        """Return activity type name."""
        return self.name

    class Meta:  # noqa
        unique_together = ('name', 'cluster')

    @property
    def product_cluster(self):
        """Return product cluster."""
        return ProductCluster.objects.get(
            cluster=self.cluster,
            product=self.price.product
        )

    @property
    def url(self):
        """Return url."""
        return f'https://{self.name}.{self.cluster.domain}'

    def online(self):
        """Make instance online."""
        self.status = InstanceStatus.ONLINE
        self.send_credentials()
        self.save()

    def offline(self):
        """Make instance offline."""
        self.status = InstanceStatus.OFFLINE
        self.save()

    @property
    def credentials(self):
        """Return credentials."""
        credentials = {
            'USERNAME': 'admin'
        }
        credentials.update(
            get_credentials(
                self.price.package_group.vault_url,
                self.name
            )
        )
        return credentials

    def send_credentials(self):
        """Send credentials."""
        if self.status != InstanceStatus.ONLINE:
            return
        pref = Preferences.load()
        name = f'{self.owner.first_name} {self.owner.last_name}'
        if not self.price.package_group.vault_url:
            html_content = render_to_string(
                template_name='emails/GeoHosting_Product is Error.html',
                context={
                    'name': name,
                }
            )
        else:
            try:
                get_credentials(
                    self.price.package_group.vault_url,
                    self.name
                )
                instance_url = (
                    f"{FRONTEND_URL}#/dashboard?q={self.name}"
                )
                instance_url = instance_url.replace('#/#', '#')
                html_content = render_to_string(
                    template_name='emails/GeoHosting_Product is Ready.html',
                    context={
                        'name': name,
                        'url': self.url,
                        'instance_url': instance_url,
                        'app_name': self.name,
                        'support_email': pref.support_email,
                    }
                )
            except Exception:
                html_content = render_to_string(
                    template_name='emails/GeoHosting_Product is Error.html',
                    context={
                        'name': name,
                        'app_name': self.name,
                        'url': self.url,
                        'support_email': pref.support_email,
                    }
                )

        # Create the email message
        email = EmailMessage(
            subject=f'{self.name} is ready',
            body=html_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[self.owner.email]
        )
        email.content_subtype = 'html'
        email.send()
