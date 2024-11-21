"""
GeoHosting Controller.

.. note:: User.
"""
import json
import threading

from django.http import HttpResponseBadRequest
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from geohosting.models.country import Country
from geohosting.serializer.user import (
    ChangePasswordSerializer,
    UserSerializer, UserBillingInformationSerializer
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
            data = request.data

            # If it is payload, we need to use it as data
            if data.get('payload'):
                try:
                    data = json.loads(data.get('payload'))
                except json.JSONDecodeError:
                    return HttpResponseBadRequest('payload is invalid json')
            user = request.user
            serializer = UserSerializer(user, data=data)
            if serializer.is_valid():
                serializer.save()

                try:
                    user.userprofile.avatar = request.FILES['avatar']
                    user.userprofile.save()
                except KeyError:
                    pass

                billing_data = data['billing_information']
                country = billing_data.get('country', None)
                country_obj = None
                if country:
                    try:
                        country_obj = Country.objects.get(
                            name=country
                        )
                        billing_data['country'] = country_obj
                    except Country.DoesNotExist:
                        return HttpResponseBadRequest(
                            f'Country {country} does not exist'
                        )
                billing_data['user'] = user.pk
                billing = user.userbillinginformation
                billing_serializer = UserBillingInformationSerializer(
                    billing, data=billing_data
                )
                if billing_serializer.is_valid():
                    billing_serializer.save()
                    billing.country = country_obj
                    billing.save()
                    threading.Thread(
                        target=user.userprofile.post_to_erpnext
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
