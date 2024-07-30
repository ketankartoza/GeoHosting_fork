from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
import requests
import os

from django.contrib import messages
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

from geohosting.utils.erpnext import fetch_erpnext_data
from geohosting.models.product import Product


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


@api_view(['GET'])
@permission_classes([IsAdminUser])
def fetch_products(request):
    fetched_data = "Products fetched successfully!"
    doctype = 'Products'

    product_list = fetch_erpnext_data(doctype)
    products = []

    for product in product_list:
        product_detail = fetch_erpnext_data(
            f'{doctype}/{product.get("name", "")}')
        if product_detail:
            products.append(product_detail)

            # Extracting data from the product_detail dictionary
            name = product_detail.get('product_name', '')
            order = product_detail.get('idx', 0)
            upstream_id = product_detail.get('name', '')
            description = product_detail.get('product_description', '')
            image_path = product_detail.get('product_image', '')
            available = product_detail.get('docstatus', 0) == 1
            image_file = None

            if image_path:
                image_file = handle_image(image_path)

            product_obj, created = Product.objects.update_or_create(
                upstream_id=upstream_id,
                defaults={
                    'name': name,
                    'order': order,
                    'description': description,
                    'image': image_file,
                    'available': available
                }
            )

    messages.add_message(
        request,
        messages.SUCCESS,
        f'{fetched_data} {len(products)}')
    return Response({
        'status': 'success',
        'message': fetched_data
    }, status=status.HTTP_200_OK)
