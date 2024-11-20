"""Django settings API."""

from datetime import datetime

from django.conf import settings
from django.core.exceptions import (
    FieldError, ValidationError, SuspiciousOperation
)
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


class FilteredAPI(object):
    """Return User list."""

    ignored_fields = ['page', 'page_size', 'q']
    default_query_filter = []

    def filter_query(self, request, query, fields: list = None):
        """Return filter query."""
        # This is for default query
        parameters = request.GET.copy()
        try:
            if self.default_query_filter and parameters['q']:
                for field in self.default_query_filter:
                    parameters[field] = parameters['q']
        except KeyError:
            pass

        for param, value in parameters.items():
            field = param.split('__')[0]
            if field in self.ignored_fields:
                continue

            if fields and field not in fields:
                continue

            if '_in' in param:
                value = value.split(',')

            if 'date' in param:
                try:
                    value = datetime.fromtimestamp(int(value))
                except (ValueError, TypeError):
                    pass
            try:
                if 'NaN' in value or 'None' in value:
                    param = f'{field}__isnull'
                    value = True
                    query = query.filter(**{param: value})
                else:
                    query = query.filter(**{param: value})
            except FieldError:
                raise SuspiciousOperation(f'Can not query param {param}')
            except ValidationError as e:
                raise SuspiciousOperation(e)
        return query

    def get_queryset(self):
        """Return queryset of API."""
        query = self.queryset
        return self.filter_query(self.request, query)
