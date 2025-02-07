import re

from django.contrib import messages
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
    fetch_erpnext_data, fetch_erpnext_detail_data, download_erp_file
)
from geohosting_controller.default_data import (
    generate_regions, generate_cluster
)


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
        image_file = download_erp_file(image_path)
        if not image_file:
            raise AttributeError()
        media, _ = ProductMedia.objects.update_or_create(
            product=obj,
            title=title,
            defaults={
                'image': image_file,
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

        # Currently we focus on DO
        if name.endswith('DO'):
            packages.append(product_detail)

        description = product_detail.get('description', None)
        if description:
            desc = parse_description(description)
            if not desc.get('short_description'):
                continue

            # -----------------------
            # Extract attributes
            _product_detail = fetch_erpnext_detail_data(
                f'{doctype}/{name}'
            )
            attributes = _product_detail.get('attributes', [])
            host_attributes = {}
            for attribute in attributes:
                if 'host specifications' in attribute.get('attribute').lower():
                    attribute_detail = fetch_erpnext_detail_data(
                        f'Item Attribute/{attribute["attribute"]}'
                    )
                    if attribute_detail:
                        for value in attribute_detail[
                            'item_attribute_values'
                        ]:
                            host_attributes[value['abbr'].lower()] = value[
                                'attribute_value'
                            ]
            product_detail['host_attributes'] = host_attributes
            # -----------------------
            products.append(product_detail)

            # Extracting data from the product_detail dictionary
            upstream_id = product_detail.get('name', '')
            description = desc.get('short_description', '')
            image_path = product_detail.get('image', '')
            available = product_detail.get(
                'available_in_geohosting', 0) == 1

            defaults = {
                'name': name,
                'description': description,
                'available': available
            }
            if image_path:
                defaults['image'] = download_erp_file(image_path)
            product_obj, created = Product.objects.update_or_create(
                upstream_id=upstream_id,
                defaults=defaults
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
                metadata, _ = ProductMetadata.objects.update_or_create(
                    product=product_obj,
                    key=key,
                    defaults={
                        'value': value,
                    }
                )

    # Get pricing
    for package_detail in packages:
        name = package_detail.get("name", "")
        package_detail = fetch_erpnext_detail_data(f'{doctype}/{name}')
        product_name = package_detail.get('variant_of', '')
        try:
            product_detail = [
                product
                for product in products if product['name'] == product_name
            ][0]
        except IndexError:
            continue

        if package_detail:
            spec = {}
            for key, value in product_detail.get(
                    'host_attributes', {}
            ).items():
                if key in name.lower():
                    spec = {
                        'spec': [spec.strip() for spec in value.split(';')]
                    }
            pricing_list = fetch_erpnext_detail_data(
                'Item Price', {
                    'item_code': name
                }
            )
            product = Product.objects.get(
                upstream_id=product_name
            )
            package_group, _ = PackageGroup.objects.update_or_create(
                name=name
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
                            'package_group': package_group,
                            'price_list': item_price.get('price_list')
                        }
                    )
                except Product.DoesNotExist:
                    continue
    return products


@api_view(['GET'])
@permission_classes([IsAdminUser])
def fetch_products(request):
    fetching_data = "Products fetch initiated in the background."

    fetch_products_from_erpnext_task.delay()

    messages.add_message(
        request,
        messages.SUCCESS,
        f'{fetching_data}')
    return Response({
        'status': 'success',
        'message': fetching_data
    }, status=status.HTTP_200_OK)
