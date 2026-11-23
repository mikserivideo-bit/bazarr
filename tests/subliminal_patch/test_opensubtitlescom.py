import json

import pytest
from dogpile.cache.api import NO_VALUE
from requests import Response

from subliminal.exceptions import DownloadLimitExceeded
from subliminal_patch.providers import opensubtitlescom
from subliminal_patch.providers.opensubtitlescom import OpenSubtitlesComProvider


def _response(status_code, payload=None):
    response = Response()
    response.status_code = status_code
    response._content = json.dumps(payload or {}).encode()
    return response


def test_legacy_single_account_settings_are_supported():
    provider = OpenSubtitlesComProvider(username='legacy-user', password='legacy-password', api_key='key')

    assert provider.accounts == [{'username': 'legacy-user', 'password': 'legacy-password'}]


def test_shared_password_is_applied_to_each_username():
    provider = OpenSubtitlesComProvider(
        accounts='{"usernames": ["first-user", "second-user"], "password": "shared-password"}',
        api_key='key',
    )

    assert provider.accounts == [
        {'username': 'first-user', 'password': 'shared-password'},
        {'username': 'second-user', 'password': 'shared-password'},
    ]


@pytest.fixture
def provider(monkeypatch):
    instance = OpenSubtitlesComProvider(
        accounts=[
            {'username': 'first@example.com', 'password': 'first'},
            {'username': 'second@example.com', 'password': 'second'},
        ],
        api_key='key',
    )
    monkeypatch.setattr(opensubtitlescom.region, 'get', lambda *args, **kwargs: NO_VALUE)
    monkeypatch.setattr(opensubtitlescom.region, 'set', lambda *args, **kwargs: None)
    monkeypatch.setattr(instance, 'login', lambda **kwargs: None)
    monkeypatch.setattr(instance, 'reset_token', lambda: None)
    return instance


def test_daily_download_limit_switches_to_next_account(provider):
    responses = iter([
        _response(406, {'requests': 5, 'remaining': 0, 'reset_time': 'tomorrow'}),
        _response(200),
    ])

    assert provider.checked(lambda: next(responses)).status_code == 200
    assert provider.username == 'second@example.com'


def test_daily_download_limit_is_reported_when_every_account_is_limited(provider):
    responses = iter([
        _response(406, {'requests': 5, 'remaining': 0, 'reset_time': 'tomorrow'}),
        _response(406, {'requests': 5, 'remaining': 0, 'reset_time': 'tomorrow'}),
    ])

    with pytest.raises(DownloadLimitExceeded, match='Daily download limit reached'):
        provider.checked(lambda: next(responses))

