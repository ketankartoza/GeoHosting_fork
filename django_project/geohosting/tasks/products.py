from celery import shared_task


@shared_task
def fetch_products_from_erpnext_task():
    from geohosting.views.products import fetch_products_from_erpnext
    products = fetch_products_from_erpnext()
    return len(products)
