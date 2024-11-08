"""
GeoHosting Controller.

.. note:: User.
"""
import threading

from django.http import HttpResponseBadRequest
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from geohosting.serializer.user import (
    ChangePasswordSerializer, UserSerializer, UserBillingInformationSerializer
)


class ChangePasswordView(APIView):
    """Change password view."""

    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def put(self, request):
        """Put method to change password."""
        try:
            password = request.data['old_password']
            new_password = request.data['new_password']

            user = request.user
            if not user.check_password(raw_password=password):
                return HttpResponseBadRequest('Old password is not correct.')
            else:
                user.set_password(new_password)
                user.save()
                return Response('password changed successfully')
        except KeyError as e:
            return HttpResponseBadRequest(f'{e} is required')


class UserProfileView(APIView):
    """User Profile view."""

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get user profile."""
        return Response(UserSerializer(request.user).data)

    def put(self, request):
        """Put method to change password."""
        try:
            serializer = UserSerializer(request.user, data=request.data)
            if serializer.is_valid():
                serializer.save()

                billing_data = request.data['billing_information']
                billing_data['user'] = request.user.pk
                billing_serializer = UserBillingInformationSerializer(
                    request.user.userbillinginformation,
                    data=billing_data
                )
                if billing_serializer.is_valid():
                    billing_serializer.save()
                    threading.Thread(
                        target=request.user.userprofile.post_to_erpnext
                    ).start()
                    return Response(serializer.data)
                else:
                    raise Exception(billing_serializer.errors)
            else:
                raise Exception(serializer.errors)
        except KeyError as e:
            return HttpResponseBadRequest(f'{e} is required')
        except Exception as e:
            return HttpResponseBadRequest(f'{e}')
