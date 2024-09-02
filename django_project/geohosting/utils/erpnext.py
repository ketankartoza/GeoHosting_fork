import json

import requests
from django.conf import settings

headers = {
    "Authorization": (
        f"token {settings.ERPNEXT_API_KEY}:"
        f"{settings.ERPNEXT_API_SECRET}"
    ),
}


def fetch_erpnext_detail_data(doctype, filters=None):
    url = f"{settings.ERPNEXT_BASE_URL}/api/resource/{doctype}"
    params = {
        'fields': '["*"]'
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


def post_to_erpnext(data, doctype, file=None):
    """Post data to ERPNext and handle conflict if the data already exists.

    Parameters:
        data (dict): The data to post.
        doctype (str): The document type to post the data to.
        file (file, optional): The file to upload.

    Returns:
        result (dict): The result containing the status and message.
    """
    url = f"{settings.ERPNEXT_BASE_URL}/api/resource/{doctype}"

    files = {'file': file} if file else None

    try:
        if files:
            response = requests.post(
                url, headers=headers,
                data=data, files=files
            )
        else:
            headers["Content-Type"] = "application/json"
            response = requests.post(
                url, headers=headers,
                data=json.dumps(data)
            )

        response.raise_for_status()
        response_data = response.json()
        record_id = response_data.get("data", {}).get("name")
        return {"status": "success", "id": record_id}

    except requests.exceptions.HTTPError as err:
        if response.status_code == 409:
            return {"status": "conflict", "message": "Data already exists."}
        else:
            return {"status": "error", "message": str(err)}


def put_to_erpnext(data, doctype, id, file=None):
    """Put data to ERPNext.

    Parameters:
        data (dict): The data to post.
        doctype (str): The document type to post the data to.
        id (str): Id of doc that needs to be put.
        file (file, optional): The file to upload.

    Returns:
        result (dict): The result containing the status and message.
    """
    url = f"{settings.ERPNEXT_BASE_URL}/api/resource/{doctype}/{id}"

    files = {'file': file} if file else None

    try:
        if files:
            response = requests.put(
                url, headers=headers,
                data=data, files=files
            )
        else:
            headers["Content-Type"] = "application/json"
            response = requests.put(
                url, headers=headers,
                data=json.dumps(data)
            )

        response.raise_for_status()
        response_data = response.json()
        data = response_data.get("data", {})
        return {"status": "success", "data": data}

    except requests.exceptions.HTTPError as err:
        return {"status": "error", "message": str(err)}


def add_erp_next_comment(user, doctype: str, id: str, comment: str):
    """Add a comment to ERPNext."""
    url = (
        f"{settings.ERPNEXT_BASE_URL}/api/method/"
        f"frappe.desk.form.utils.add_comment"
    )
    data = {
        "reference_doctype": doctype,
        "reference_name": id,
        "content": comment,
        "comment_email": user.email,
        "comment_by": f"{user.first_name} {user.last_name}"
    }
    try:
        headers["Content-Type"] = "application/json"
        response = requests.post(
            url, headers=headers, data=json.dumps(data)
        )

        response.raise_for_status()
        response_data = response.json()
        data = response_data.get("data", {})
        return {"status": "success", "data": data}
    except requests.exceptions.HTTPError as err:
        return {"status": "error", "message": str(err)}
