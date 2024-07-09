"""
GeoHosting Controller.

.. note:: Knox.
"""

from knox.models import AuthToken
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView


class CreateToken(APIView):
    """Create token."""

    permission_classes = (IsAuthenticated, IsAdminUser)

    def post(self, request):
        """Create token for logged in user."""
        AuthToken.objects.filter(user=request.user).delete()
        obj, token = AuthToken.objects.create(
            user=request.user
        )
        return Response(token)
