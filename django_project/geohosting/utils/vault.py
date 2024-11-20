import os

import requests


def get_token():
    """Get token of vault."""
    VAULT_BASE_URL = os.environ.get('VAULT_BASE_URL', '')
    VAULT_ROLE_ID = os.environ.get('VAULT_ROLE_ID', '')
    VAULT_SECRET_ID = os.environ.get('VAULT_SECRET_ID', '')
    if not VAULT_BASE_URL:
        raise Exception('VAULT_BASE_URL environment variable not set')
    if not VAULT_ROLE_ID:
        raise Exception('VAULT_ROLE_ID environment variable not set')
    if not VAULT_SECRET_ID:
        raise Exception('VAULT_SECRET_ID environment variable not set')

    url = f"{VAULT_BASE_URL}/v1/auth/kartoza-apps/login"
    response = requests.post(
        url,
        data={
            "role_id": VAULT_ROLE_ID,
            "secret_id": VAULT_SECRET_ID
        },
        verify=False
    )
    if response.status_code != 200:
        raise Exception(response.text)
    return response.json()['auth']['client_token']


def get_credentials(url, appname: str, params=None):
    """Return credentials on vault."""
    token = get_token()
    response = requests.get(
        url + appname,
        params=params if params else {},
        headers={
            'X-Vault-Token': token
        },
        verify=False
    )
    if response.status_code != 200:
        raise Exception(response.text)
    return {
        key: value for key, value in response.json()['data']['data'].items()
        if 'password' in key.lower()
    }
