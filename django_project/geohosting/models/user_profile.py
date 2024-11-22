from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from geohosting.models._data_types import CUSTOMER_GROUP
from geohosting.models.billing_information import BillingInformation
from geohosting.models.erp_model import ErpModel


class UserBillingInformation(BillingInformation):
    """User billing information model."""

    user = models.OneToOneField(
        User, on_delete=models.CASCADE
    )

    @property
    def customer_name(self):
        """Return customer name."""
        return self.user.userprofile.erpnext_code


class UserProfile(ErpModel):
    """User profile model."""

    user = models.OneToOneField(
        User, on_delete=models.CASCADE
    )
    reset_token = models.CharField(
        max_length=64, blank=True, null=True
    )

    # Avatar
    avatar = models.ImageField(
        upload_to='avatars/', blank=True, null=True
    )

    @property
    def doc_type(self):
        """Doctype for this model."""
        return 'Customer'

    @property
    def erp_payload_for_create(self):
        """ERP Payload for create request."""
        return {
            "doctype": self.doc_type,
            "customer_name": self.user.get_full_name(),
            "customer_type": "Individual",
            "customer_group": CUSTOMER_GROUP,
            "territory": "All Territories",
            "tax_category": "VAT"
        }

    @property
    def erp_payload_for_edit(self):
        """ERP Payload for edit request."""
        return {
            "doctype": self.doc_type,
            "customer_name": self.user.get_full_name(),
            "customer_group": CUSTOMER_GROUP
        }

    def post_to_erpnext(self):
        """Post data to erp."""
        super().post_to_erpnext()
        self.user.userbillinginformation.post_to_erpnext()
        for contact in self.user.companycontact_set.all():
            contact.post_to_erpnext()

    def __str__(self):
        return self.user.username


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
        UserBillingInformation.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    try:
        instance.userprofile.save()
    except UserProfile.DoesNotExist:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_billing_information(sender, instance, **kwargs):
    try:
        instance.userbillinginformation.save()
    except UserBillingInformation.DoesNotExist:
        UserBillingInformation.objects.create(user=instance)
