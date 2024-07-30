import json
import requests
from django.conf import settings


def fetch_erpnext_detail_data(doctype, filters=None):
    url = f"{settings.ERPNEXT_BASE_URL}/api/resource/{doctype}"
    params = {
        'fields': '["*"]'
    }

    headers = {
        'Authorization': f'token {settings.ERPNEXT_API_KEY}:'
                         f'{settings.ERPNEXT_API_SECRET}'
    }

    if filters:
        params['filters'] = json.dumps(filters)

    try:
        response = requests.get(url, headers=headers, params=params)

        if response.status_code == 200:
            data = response.json()
            if 'data' in data:
                return data['data']
            return data
        else:
            return (
                f"Error: Unable to fetch data. Status code: "
                f"{response.status_code}, "
                f"Message: {response.text}"
            )
    except Exception as e:
        return f"Exception occurred: {str(e)}"


def fetch_erpnext_data(doctype, filters=None):
    url = f"{settings.ERPNEXT_BASE_URL}/api/resource/{doctype}"
    params = {
        'fields': '["*"]'
    }

    headers = {
        'Authorization': f'token {settings.ERPNEXT_API_KEY}:'
                         f'{settings.ERPNEXT_API_SECRET}'
    }

    if filters:
        params['filters'] = json.dumps(filters)

    all_data = []
    page = 1
    page_length = 20
    max_try = 10
    current_try = 1

    try:
        while True:
            current_try += 1
            if current_try > max_try:
                break

            params['limit_start'] = (page - 1) * page_length
            params['limit_page_length'] = page_length

            response = requests.get(url, headers=headers, params=params)

            if response.status_code == 200:
                data = response.json()
                if 'data' in data:
                    all_data.extend(data['data'])
                    if len(data['data']) < page_length:
                        break  # Exit loop if this is the last page
                    page += 1
                else:
                    break  # Exit loop if no data found in response
            else:
                return (
                    f"Error: Unable to fetch data. Status code: "
                    f"{response.status_code}, "
                    f"Message: {response.text}"
                )
        return all_data
    except Exception as e:
        return f"Exception occurred: {str(e)}"
