# coding=utf-8
"""
GeoHosting.

.. note:: Instance create form.
"""
from django import forms
from django.contrib.auth import get_user_model

from geohosting.models.activity import Activity, ActivityType
from geohosting.models.package import Package
from geohosting.models.product import ProductCluster
from geohosting.models.region import Region
from geohosting.models.sales_order import SalesOrder
from geohosting.validators import app_name_validator, name_validator
from geohosting_controller.exceptions import (
    NoClusterException
)
from geohosting_controller.variables import ActivityTypeTerm

User = get_user_model()


class CreateInstanceForm(forms.ModelForm):
    """Instance create form.

    Creating instance through activity.
    """

    activity_identifier = ActivityTypeTerm.CREATE_INSTANCE.value
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
                activity.activity_type.identifier == self.activity_identifier
        ):
            data = activity.client_data
            try:
                app_name = data['app_name']
                package_id = data['package_id']
                package = Package.objects.get(id=package_id)
                product_cluster_id = data['product_cluster_id']
                product_cluster = ProductCluster.objects.get(
                    id=product_cluster_id
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
        try:
            # Check package group
            if not package.package_group.package_code:
                raise Exception('No package group code')

            # Check activity
            self.instance.activity_type_id = ActivityType.objects.get(
                identifier=self.activity_identifier,
                product=package.product
            ).id
            self.instance.triggered_by = self.user

            # Check product cluster
            product = package.product
            product_cluster = product.get_product_cluster(region)

            data = {
                'app_name': app_name,
                'package_id': package.id,
                'package_code': package.package_group.package_code,
                'product_name': package.product.name,
                'region_id': region.id,
                'region_name': region.name,
                'product_cluster_id': product_cluster.id
            }
            cleaned_data['client_data'] = data
            self.instance.client_data = data

            # Get post data
            self.instance.post_data = self._post_data()
        except AttributeError:
            raise forms.ValidationError('User is missing.')
        except ProductCluster.DoesNotExist:
            raise forms.ValidationError(
                f'Product cluster for region {region.name} does not exist.'
            )
        except ActivityType.DoesNotExist:
            raise forms.ValidationError(
                f'Activity type {self.activity_identifier} does not exist.'
            )
        except Exception as e:
            raise forms.ValidationError(f'{e}')
        return cleaned_data
