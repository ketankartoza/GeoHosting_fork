import os
import re

import requests
from django.conf import settings
from django.contrib import messages
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from geohosting.models.package import Package, PackageGroup
from geohosting.models.product import (
    Product, ProductMetadata, ProductMedia
)
from geohosting.tasks.products import (
    fetch_products_from_erpnext_task
)
from geohosting.utils.erpnext import (
    fetch_erpnext_data,
    fetch_erpnext_detail_data
)
from geohosting_controller.default_data import (
    generate_regions, generate_cluster
)


def handle_image(image_path):
    image_url = f"{settings.ERPNEXT_BASE_URL}{image_path}"
    response = requests.get(image_url)

    if response.status_code == 200:
        image_filename = os.path.basename(image_path)
        image_content = ContentFile(response.content)
        image_saved_path = (
            default_storage.save(
                f'product_images/{image_filename}',
                image_content)
        )
        return image_saved_path
    else:
        print(f"Failed to download image: {image_url}")
        return None


def parse_description(html_content: str) -> dict:
    """Parse description from html content of product page."""
    html_content = html_content.replace(
        "\uFEFF", ""
    ).replace('<strong></strong>', '')
    pattern = re.compile(r'<strong>(.*?)</strong></p><p>(.*?)</p>')
    matches = pattern.findall(html_content)
    data = {
        match[0].strip().lower().replace(" ", "_"):
            match[1].strip() for match in matches
    }
    return data


def save_product_image(
        obj, product_desc: dict, title_key, description_key, image_path: str
):
    """Save product image from description of dict."""
    try:
        title = product_desc[title_key]
        description = product_desc[description_key]
        image_file = handle_image(image_path)
        if not image_file:
            raise AttributeError()
        media, _ = ProductMedia.objects.update_or_create(
            product=obj,
            title=title,
            defaults={
                'image': handle_image(image_path),
                'description': description
            }
        )
    except (KeyError, AttributeError):
        pass


def fetch_products_from_erpnext():
    """Fetch products from ERPNEXT API."""
    generate_regions()
    generate_cluster()

    doctype = 'Item'
    product_list = fetch_erpnext_data(
        doctype,
        {
            'item_group': 'GeoHosting'
        }
    )
    products = []
    packages = []

    for product_detail in product_list:
        name = product_detail.get('item_name', '')
        if name.endswith('DO'):
            packages.append(product_detail)
        description = product_detail.get('description', None)
        if description:
            desc = parse_description(description)
            if not desc.get('short_description'):
                continue
            products.append(product_detail)

            # Extracting data from the product_detail dictionary
            upstream_id = product_detail.get('name', '')
            description = desc.get('short_description', '')
            image_path = product_detail.get('image', '')
            available = product_detail.get(
                'available_in_geohosting', 0) == 1
            image_file = None

            if image_path:
                image_file = handle_image(image_path)

            product_obj, created = Product.objects.update_or_create(
                upstream_id=upstream_id,
                defaults={
                    'name': name,
                    'description': description,
                    'image': image_file,
                    'available': available
                }
            )
            save_product_image(
                product_obj, desc, 'overview_header',
                'overview_description',
                f'/assets/geohosting/images/Product_Images/{name}/main.png'
            )
            save_product_image(
                product_obj, desc, 'overview_continuation_header',
                'overview_continuation',
                f'/assets/geohosting/images/Product_Images/{name}/'
                f'secondary.png'
            )

            # Save all description to product metadata
            for key, value in desc.items():
                ProductMetadata.objects.update_or_create(
                    product=product_obj,
                    key=key,
                    defaults={
                        'value': value,
                    }
                )

    # Get pricing
    for package_detail in packages:
        package_detail = fetch_erpnext_detail_data(
            f'{doctype}/{package_detail.get("name", "")}')
        if package_detail:
            attributes = package_detail.get('attributes', [])
            spec = {}
            for attribute in attributes:
                if 'host specifications' in attribute.get('attribute').lower():
                    spec = {
                        'spec': attribute.get('attribute_value').split(';')
                    }
            pricing_list = fetch_erpnext_detail_data(
                'Item Price', {
                    'item_code': package_detail.get("name", "")
                }
            )
            product = Product.objects.get(
                upstream_id=package_detail.get('variant_of', '')
            )
            package_group, _ = PackageGroup.objects.update_or_create(
                name=package_detail.get("name", "")
            )
            for item_price in pricing_list:
                currency = item_price.get('currency', 'USD')
                price = item_price.get('price_list_rate', 0)
                try:
                    Package.objects.update_or_create(
                        product=product,
                        erpnext_code=item_price.get('name'),
                        defaults={
                            'feature_list': spec,
                            'price': price,
                            'currency': currency,
                            'name': item_price.get('item_name'),
                            'erpnext_item_code': item_price.get('item_code'),
                            'package_group': package_group
                        }
                    )
                except Product.DoesNotExist:
                    continue
    return products


@api_view(['GET'])
@permission_classes([IsAdminUser])
def fetch_products(request):
    fetching_data = "Products fetch initiated in the background."

    fetch_products_from_erpnext_task()

    messages.add_message(
        request,
        messages.SUCCESS,
        f'{fetching_data}')
    return Response({
        'status': 'success',
        'message': fetching_data
    }, status=status.HTTP_200_OK)
