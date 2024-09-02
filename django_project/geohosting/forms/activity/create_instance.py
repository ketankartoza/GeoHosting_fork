# coding=utf-8
"""
GeoHosting.

.. note:: Instance create form.
"""
from django import forms
from django.contrib.auth import get_user_model
from django.db.models import Q

from geohosting.models import (
    Activity, ActivityType, ActivityStatus, Instance, Package,
    ProductCluster
)
from geohosting.models.activity import name_validator
from geohosting.models.region import Region
from geohosting_controller.exceptions import (
    NoClusterException, ActivityException
)
from geohosting_controller.variables import ActivityTypeTerm

User = get_user_model()


class CreateInstanceForm(forms.ModelForm):
    """Instance create form.

    Creating instance through activity.
    """

    app_name = forms.CharField(
        validators=[name_validator]
    )
    package = forms.ModelChoiceField(
        queryset=Package.objects.all()
    )
    region = forms.ModelChoiceField(
        queryset=Region.objects.all()
    )

    class Meta:  # noqa: D106
        model = Activity
        fields = ['app_name', 'package', 'region']

    def _post_data(self):
        """Refactor data."""
        activity = self.instance
        activity_type = activity.activity_type.identifier
        if activity_type == ActivityTypeTerm.CREATE_INSTANCE.value:
            data = activity.client_data
            try:
                # TODO:
                #  Later fix using region input
                #  Change keys when API is universal

                app_name = data['app_name']
                package_id = data['package_id']
                region_id = data['region_id']

                if Instance.objects.filter(name=app_name).count():
                    raise ActivityException('Instance already exists')

                if Activity.objects.filter(
                        client_data__app_name=app_name
                ).exclude(
                    Q(status=ActivityStatus.ERROR) |
                    Q(status=ActivityStatus.SUCCESS)
                ):
                    raise ActivityException(
                        'Some of activity is already running'
                    )

                package = Package.objects.get(id=package_id)
                product = package.product
                return {
                    'subdomain': app_name,
                    'k8s_cluster': product.productcluster_set.get(
                        cluster__region_id=region_id
                    ).cluster.code,
                    'geonode_size': package.package_code,
                    'geonode_name': app_name
                }
            except ProductCluster.DoesNotExist:
                raise NoClusterException()
        raise ActivityType.DoesNotExist()

    def clean(self):
        cleaned_data = super().clean()
        app_name = cleaned_data.get('app_name')
        package = cleaned_data.get('package')
        region = cleaned_data.get('region')

        data = {
            'app_name': app_name,
            'package_id': package.id,
            'package_code': package.package_code,
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
        except ActivityException as e:
            raise forms.ValidationError(
                f'{e}'
            )
        return cleaned_data
