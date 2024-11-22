from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from geohosting.models._data_types import CUSTOMER_GROUP
from geohosting.models.billing_information import BillingInformation
from geohosting.models.erp_model import ErpModel


class Company(ErpModel):
    """Company profile model."""

    name = models.CharField(
        max_length=255, unique=True
    )
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
            "customer_name": self.name,
            "customer_type": "Company",
            "customer_group": CUSTOMER_GROUP,
            "territory": "All Territories",
            "tax_category": "VAT"
        }

    @property
    def erp_payload_for_edit(self):
        """ERP Payload for edit request."""
        return {
            "doctype": self.doc_type,
            "customer_name": self.name,
            "customer_group": CUSTOMER_GROUP
        }

    def post_to_erpnext(self):
        """Post data to erp."""
        erpnext_code = self.erpnext_code
        output = super().post_to_erpnext()
        self.companybillinginformation.post_to_erpnext()
        if not erpnext_code:
            for contact in self.companycontact_set.all():
                contact.post_to_erpnext()

        return output

    def __str__(self):
        return self.name

    class Meta:  # noqa: D106
        ordering = ('name',)
        verbose_name_plural = 'Companies'


class CompanyBillingInformation(BillingInformation):
    """Company billing information model."""

    company = models.OneToOneField(
        Company, on_delete=models.CASCADE
    )

    @property
    def customer_name(self):
        """Return customer name."""
        return self.company.name


class CompanyContact(ErpModel):
    """Company profile model."""

    company = models.ForeignKey(
        Company, on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE
    )

    @property
    def doc_type(self):
        """Doctype for this model."""
        return 'Contact'

    @property
    def erp_payload_for_create(self):
        """ERP Payload for create request."""
        return {
            "doctype": self.doc_type,
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
            "company_name": self.company.name,
            "is_primary_contact": 1,
            "links": [
                {
                    "doctype": "Dynamic Link",
                    "link_doctype": "Customer",
                    "link_name": self.company.erpnext_code,
                    "parenttype": "Contact"
                },
                {
                    "doctype": "Dynamic Link",
                    "link_doctype": "Customer",
                    "link_name": self.user.userprofile.erpnext_code,
                    "parenttype": "Contact"
                }
            ]
        }

    @property
    def erp_payload_for_edit(self):
        """ERP Payload for edit request."""
        return self.erp_payload_for_create


@receiver(post_save, sender=Company)
def create_company(sender, instance, created, **kwargs):
    if created:
        CompanyBillingInformation.objects.create(company=instance)


@receiver(post_save, sender=Company)
def save_billing_information(sender, instance, **kwargs):
    try:
        instance.companybillinginformation.save()
    except CompanyBillingInformation.DoesNotExist:
        CompanyBillingInformation.objects.create(company=instance)
