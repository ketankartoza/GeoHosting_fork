from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

from geohosting.utils.erpnext import post_to_erpnext


class UserProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE)
    erpnext_code = models.CharField(
        max_length=100, blank=True, null=True)
    reset_token = models.CharField(
        max_length=64, blank=True, null=True)

    def __str__(self):
        return self.user.username

    def post_to_erpnext(self):
        data = {
            "doctype": "Customer",
            "customer_name": self.user.get_full_name(),
            "customer_type": "Individual",
            "customer_group": "Commercial",
            "territory": "All Territories",
            "tax_category": "VAT"
        }
        result = post_to_erpnext(
            data,
            'Customer'
        )
        if result['status'] == 'success':
            self.erpnext_code = result['id']
            self.save()

        return result


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    try:
        instance.userprofile.save()
    except UserProfile.DoesNotExist:
        UserProfile.objects.create(user=instance)
