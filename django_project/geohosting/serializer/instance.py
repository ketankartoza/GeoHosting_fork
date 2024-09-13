from rest_framework import serializers

from geohosting.models import Instance


class InstanceSerializer(serializers.ModelSerializer):
    """Sales instance serializer."""

    url = serializers.SerializerMethodField()

    class Meta:
        model = Instance
        fields = '__all__'

    def get_url(self, obj: Instance):
        """Return url."""
        return f'https://{obj.name}.{obj.cluster.domain}'
