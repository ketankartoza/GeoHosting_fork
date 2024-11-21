# Generated by Django 4.2.15 on 2024-11-21 10:14

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('geohosting', '0026_userbillinginformation_country'),
    ]

    operations = [
        migrations.CreateModel(
            name='Company',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('erpnext_code', models.CharField(blank=True, max_length=100, null=True)),
                ('name', models.CharField(max_length=255)),
                ('avatar', models.ImageField(blank=True, null=True, upload_to='avatars/')),
            ],
            options={
                'verbose_name_plural': 'Companies',
                'ordering': ('name',),
            },
        ),
        migrations.CreateModel(
            name='CompanyContact',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('erpnext_code', models.CharField(blank=True, max_length=100, null=True)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geohosting.company')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='CompanyBillingInformation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('erpnext_code', models.CharField(blank=True, max_length=100, null=True)),
                ('name', models.TextField(blank=True, null=True)),
                ('address', models.TextField(blank=True, null=True)),
                ('postal_code', models.CharField(blank=True, max_length=256, null=True)),
                ('city', models.CharField(blank=True, max_length=256, null=True)),
                ('region', models.CharField(blank=True, max_length=256, null=True)),
                ('tax_number', models.CharField(blank=True, max_length=256, null=True)),
                ('company', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='geohosting.company')),
                ('country', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='geohosting.country')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
