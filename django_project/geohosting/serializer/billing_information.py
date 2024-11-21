from rest_framework import serializers

from geohosting.models import BillingInformation


class BillingInformationSerializer(serializers.ModelSerializer):
    """User UserBillingInformation serializer."""

    country = serializers.SerializerMethodField()

    def get_country(self, obj: BillingInformation):
        """Return country of billing information."""
        return obj.country_name
