# coding=utf-8
"""
GeoHosting Controller.

.. note:: Sync to jenkins.
"""

from django.core.management.base import BaseCommand

from geohosting.models import Activity, ActivityStatus


class Command(BaseCommand):
    """Sync activity to jenkins."""

    def handle(self, *args, **options):
        """Command handler."""
        print('------------------ SYNC JENKINS ------------------')
        for activity in Activity.objects.filter(
                status=ActivityStatus.BUILD_JENKINS
        ):
            print(activity.id)
            activity.get_jenkins_status()
