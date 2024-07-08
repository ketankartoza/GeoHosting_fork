"""
GeoHosting Controller.

.. note:: Application setup.
"""
# !/usr/bin/env python

import io

from setuptools import setup, find_packages

__version__ = io.open('django_project/version.txt', encoding='utf-8').read()

setup(
    name='GeoHosting Controller Client',
    version=__version__,
    author='Irwan Fathurrahman',
    author_email='irwan@kartoza.com',
    packages=find_packages(
        where='django_project',
        include=['geohosting_controller_client*'],
    ),
    package_dir={'': 'django_project'},
    scripts=[],
    url='https://github.com/kartoza/GeoHosting-Controller.git',
    license='MIT',
    description=(
        'Python library to handle client request to GeoHosting Controller.'
    ),
    include_package_data=True,
    long_description=io.open('README.md', encoding='utf-8').read(),
    classifiers=[
        'Development Status :: 2 - Pre-Alpha',
        'Environment :: Web Environment',
        'License :: OSI Approved :: MIT License',
        'Topic :: Software Development :: Libraries :: Python Modules'
    ],
    install_requires=[
        'requests>=2.28.2'
    ],
)
