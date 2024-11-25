from rest_framework import serializers

from geohosting.models import BillingInformation


class BillingInformationSerializer(serializers.ModelSerializer):
    """User UserBillingInformation serializer."""

    country = serializers.SerializerMethodField()
    name = serializers.CharField(required=True)
    address = serializers.CharField(required=True)
    city = serializers.CharField(required=True)
    postal_code = serializers.CharField(required=True)

    def get_country(self, obj: BillingInformation):
        """Return country of billing information."""
        return obj.country_name
