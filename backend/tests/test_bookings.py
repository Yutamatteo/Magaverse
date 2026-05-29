"""Backend API tests for Nello Ocean Beach."""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://coastal-venue-pro.preview.emergentagent.com').rstrip('/')


@pytest.fixture
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Health & Root ----------
def test_health(api_client):
    r = api_client.get(f"{BASE_URL}/api/health", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "healthy"


def test_root(api_client):
    r = api_client.get(f"{BASE_URL}/api/", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "message" in data
    assert data.get("status") == "ok"


# ---------- Bookings: valid create + persistence ----------
def test_create_booking_valid_and_list(api_client):
    payload = {
        "name": "TEST_Mario Rossi",
        "phone": "+393331112222",
        "date": "2026-07-15",
        "guests": 4,
        "service": "umbrella",
        "notes": "TEST booking",
        "language": "it",
    }
    r = api_client.post(f"{BASE_URL}/api/bookings", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
    assert data["name"] == payload["name"]
    assert data["service"] == "umbrella"
    assert data["guests"] == 4

    # verify persisted via GET
    r2 = api_client.get(f"{BASE_URL}/api/bookings", timeout=15)
    assert r2.status_code == 200
    items = r2.json()
    assert isinstance(items, list)
    assert any(b.get("id") == data["id"] for b in items)


# ---------- Bookings: invalid service ----------
def test_create_booking_invalid_service(api_client):
    payload = {
        "name": "TEST_X",
        "phone": "+393331112222",
        "date": "2026-07-15",
        "guests": 2,
        "service": "foo",
    }
    r = api_client.post(f"{BASE_URL}/api/bookings", json=payload, timeout=15)
    assert r.status_code == 400


# ---------- Bookings: invalid guests ----------
def test_create_booking_guests_zero(api_client):
    payload = {
        "name": "TEST_X",
        "phone": "+393331112222",
        "date": "2026-07-15",
        "guests": 0,
        "service": "umbrella",
    }
    r = api_client.post(f"{BASE_URL}/api/bookings", json=payload, timeout=15)
    assert r.status_code == 400


def test_create_booking_guests_too_many(api_client):
    payload = {
        "name": "TEST_X",
        "phone": "+393331112222",
        "date": "2026-07-15",
        "guests": 51,
        "service": "umbrella",
    }
    r = api_client.post(f"{BASE_URL}/api/bookings", json=payload, timeout=15)
    assert r.status_code == 400
