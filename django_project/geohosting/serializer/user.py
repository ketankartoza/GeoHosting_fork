"""
GeoHosting.

.. note:: User serializer.
"""
from django.contrib.auth import get_user_model
from rest_framework import serializers

from geohosting.models import UserProfile, UserBillingInformation

User = get_user_model()


class ChangePasswordSerializer(serializers.Serializer):
    """Change password serializer."""

    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)


class UserProfileSerializer(serializers.ModelSerializer):
    """User Profile serializer."""

    class Meta:  # noqa: D106
        model = UserProfile
        exclude = ('erpnext_code', 'reset_token', 'user', 'id')


class UserBillingInformationSerializer(serializers.ModelSerializer):
    """User UserBillingInformation serializer."""

    class Meta:  # noqa: D106
        model = UserBillingInformation
        exclude = ('id',)


class UserSerializer(serializers.ModelSerializer):
    """User serializer."""

    profile = serializers.SerializerMethodField()
    billing_information = serializers.SerializerMethodField()

    def get_profile(self, user: User):
        """Return profile."""
        return UserProfileSerializer(user.userprofile).data

    def get_billing_information(self, user: User):
        """Return UserBillingInformation."""
        try:
            billing_information = user.userbillinginformation
        except UserBillingInformation.DoesNotExist:
            billing_information = UserBillingInformation.objects.create(
                user=user
            )
        return UserBillingInformationSerializer(billing_information).data

    class Meta:  # noqa: D106
        model = User
        fields = (
            'first_name', 'last_name', 'email', 'profile',
            'billing_information'
        )
