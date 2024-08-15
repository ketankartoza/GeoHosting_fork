"""Django settings API."""

from django.conf import settings
from django.http import HttpResponseBadRequest, HttpResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView


class DjangoSettingAPI(APIView):
    """API return django settings."""

    KEYS = ['STRIPE_PUBLISHABLE_KEY', 'PAYSTACK_PUBLISHABLE_KEY']
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        """Return django settings of key."""
        try:
            key = request.GET['key']
        except KeyError as e:
            return HttpResponseBadRequest(f'{e} is required')

        try:
            if key not in self.KEYS:
                return HttpResponseBadRequest(f'{key} is forbidden.')
            return HttpResponse(getattr(settings, key))
        except AttributeError as e:
            return HttpResponseBadRequest(f'{e} does not exist')
