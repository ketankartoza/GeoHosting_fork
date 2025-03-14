# coding=utf-8
"""
GeoHosting.

.. note:: Instance deleting form.
"""
from django import forms
from django.contrib.auth import get_user_model

from geohosting.models.activity import Activity, ActivityType
from geohosting.models.instance import Instance
from geohosting.models.region import Region
from geohosting_controller.variables import ActivityTypeTerm

User = get_user_model()


class DeletingInstanceForm(forms.ModelForm):
    """Instance deleting instance.

    Creating instance through activity.
    """

    activity_identifier = ActivityTypeTerm.DELETE_INSTANCE.value
    application = forms.ModelChoiceField(queryset=Instance.objects.all())

    class Meta:  # noqa: D106
        model = Activity
        fields = ['application']

    def _post_data(self, application):
        """Refactor data."""
        activity = self.instance
        if (
                activity.activity_type.identifier == self.activity_identifier
        ):
            product_cluster = application.price.product.get_product_cluster(
                Region.default_region()
            )
            data = {
                'cluster': application.cluster.code,
                'environment': product_cluster.environment,
                'app_name': application.name
            }
            return activity.activity_type.mapping_data(data)
        raise ActivityType.DoesNotExist()

    def clean(self):
        """Clean form."""
        cleaned_data = super().clean()

        try:
            # Check activity
            application = cleaned_data['application']
            if not self.user.is_superuser and application.owner != self.user:
                raise forms.ValidationError(
                    'You are not allowed to delete this instance.'
                )
            if not application.is_ready:
                raise forms.ValidationError(
                    'Instance is not ready.'
                )

            if application.is_lock:
                raise Exception('Instance is already being deleted.')

            product = application.price.product
            self.instance.activity_type_id = ActivityType.objects.get(
                identifier=self.activity_identifier,
                product=product
            ).id
            self.instance.instance = application
            self.instance.triggered_by = self.user

            # Check product cluster
            product_cluster = product.get_product_cluster(
                Region.default_region()
            )

            data = {
                'app_name': application.name,
                'package_id': application.price.id,
                'product_cluster_id': product_cluster.id,
            }
            cleaned_data['client_data'] = data
            self.instance.client_data = data

            # Get post data
            self.instance.post_data = self._post_data(application)
        except AttributeError:
            raise forms.ValidationError('User is missing.')
        except ActivityType.DoesNotExist:
            raise forms.ValidationError(
                f'Activity type {self.activity_identifier} does not exist.'
            )
        except Exception as e:
            raise forms.ValidationError(f'{e}')
        return cleaned_data
