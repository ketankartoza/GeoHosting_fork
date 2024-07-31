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
    """
    Fetch data from ERPNext.

    Parameters:
        doctype (str): The document type to fetch the data from.
        filters (dict): Filters for the search

    Returns:
        response (dict): The response from the ERPNext API.
    """
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


def post_to_erpnext(data, doctype):
    """
    Post data to ERPNext and handle conflict if the data already exists.

    Parameters:
        data (dict): The data to post.
        doctype (str): The document type to post the data to.

    Returns:
        result (dict): The result containing the status and message.
    """
    url = f"{settings.ERPNEXT_BASE_URL}/api/resource/{doctype}"
    headers = {
        "Authorization": f"token {settings.ERPNEXT_API_KEY}:"
                         f"{settings.ERPNEXT_API_SECRET}",
        "Content-Type": "application/json"
    }
    response = None
    try:
        response = requests.post(url, headers=headers, data=json.dumps(data))
        response.raise_for_status()
        response_data = response.json()
        record_id = response_data.get("data", {}).get("name")
        return {"status": "success", "id": record_id}
    except requests.exceptions.HTTPError as err:
        if response.status_code == 409:
            return {
                "status": "conflict",
                "message": "Data already exists."}
        else:
            return {
                "status": "error",
                "message": str(err)
            }
