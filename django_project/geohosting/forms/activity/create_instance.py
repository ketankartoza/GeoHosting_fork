# coding=utf-8
"""
GeoHosting.

.. note:: Instance create form.
"""
from django import forms
from django.contrib.auth import get_user_model

from geohosting.models.activity import (
    Activity, ActivityType, name_validator
)
from geohosting.models.package import Package
from geohosting.models.product import ProductCluster
from geohosting.models.region import Region
from geohosting.models.sales_order import SalesOrder
from geohosting.validators import app_name_validator
from geohosting_controller.exceptions import (
    NoClusterException
)
from geohosting_controller.variables import ActivityTypeTerm

User = get_user_model()


class CreateInstanceForm(forms.ModelForm):
    """Instance create form.

    Creating instance through activity.
    """

    app_name = forms.CharField(
        validators=[name_validator, app_name_validator]
    )
    package = forms.ModelChoiceField(
        queryset=Package.objects.all()
    )
    region = forms.ModelChoiceField(
        queryset=Region.objects.all()
    )
    sales_order = forms.ModelChoiceField(
        queryset=SalesOrder.objects.all(),
        required=False
    )

    class Meta:  # noqa: D106
        model = Activity
        fields = ['app_name', 'package', 'region', 'sales_order']

    def _post_data(self):
        """Refactor data."""
        activity = self.instance
        if (
                activity.activity_type.identifier ==
                ActivityTypeTerm.CREATE_INSTANCE.value
        ):
            data = activity.client_data
            try:
                app_name = data['app_name']
                package_id = data['package_id']
                region_id = data['region_id']
                package = Package.objects.get(id=package_id)
                product = package.product
                product_cluster = product.productcluster_set.get(
                    cluster__region_id=region_id
                )
                data = {
                    'cluster': product_cluster.cluster.code,
                    'environment': product_cluster.environment,
                    'package': package.package_group.package_code,
                    'app_name': app_name
                }
                return activity.activity_type.mapping_data(data)
            except ProductCluster.DoesNotExist:
                raise NoClusterException()
        raise ActivityType.DoesNotExist()

    def clean(self):
        """Clean form."""
        cleaned_data = super().clean()
        app_name = cleaned_data.get('app_name')
        package = cleaned_data.get('package')
        region = cleaned_data.get('region')

        data = {
            'app_name': app_name,
            'package_id': package.id,
            'package_code': package.package_group.package_code,
            'product_name': package.product.name,
            'region_id': region.id,
            'region_name': region.name
        }
        cleaned_data['client_data'] = data
        self.instance.client_data = data
        activity_type_id = ''
        try:
            activity_type_id = ActivityTypeTerm.CREATE_INSTANCE.value
            self.instance.activity_type_id = ActivityType.objects.get(
                identifier=activity_type_id
            ).id
            self.instance.triggered_by = self.user

            # Get post data
            self.instance.post_data = self._post_data()
        except AttributeError:
            raise forms.ValidationError('User is missing.')
        except ActivityType.DoesNotExist:
            raise forms.ValidationError(
                f'Activity type {activity_type_id} does not exist.'
            )
        except Exception as e:
            raise forms.ValidationError(f'{e}')
        return cleaned_data
