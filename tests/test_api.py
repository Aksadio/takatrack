from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import get_db
from app.main import app
from app.models import Base

SAMPLES = Path(__file__).resolve().parents[1] / "samples"
TEST_ENGINE = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(bind=TEST_ENGINE, autoflush=False, expire_on_commit=False)


@pytest.fixture(autouse=True)
def reset_test_database():
    Base.metadata.drop_all(bind=TEST_ENGINE)
    Base.metadata.create_all(bind=TEST_ENGINE)
    yield
    Base.metadata.drop_all(bind=TEST_ENGINE)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


def client():
    return TestClient(app)


def test_health_and_route_manifest_are_served():
    with client() as test_client:
        health = test_client.get("/healthz")
        routes = test_client.get("/manus-routes.json")
    assert health.status_code == 200
    assert health.json()["status"] == "ok"
    assert routes.status_code == 200
    assert routes.json() == {"routes": [{"path": "/", "title": "TakaTrack dashboard"}]}


def test_import_skips_duplicate_transaction_id_and_fingerprint():
    sms = (SAMPLES / "bkash_received.txt").read_text().strip()
    with client() as test_client:
        first = test_client.post("/api/transactions/import", json={"messages": [sms]})
        second = test_client.post("/api/transactions/import", json={"messages": [sms, sms]})
    assert first.status_code == 200
    assert first.json()["saved_count"] == 1
    assert second.json()["saved_count"] == 0
    assert second.json()["duplicate_count"] == 2


def test_edit_keeps_parsed_amount_and_currency_as_original():
    sms = (SAMPLES / "bkash_received.txt").read_text().strip()
    with client() as test_client:
        imported = test_client.post("/api/transactions/import", json={"messages": [sms]}).json()
        transaction_id = imported["saved"][0]["id"]
        edited = test_client.put(
            f"/api/transactions/{transaction_id}",
            json={"amount": "1500", "currency": "USD", "category": "food", "counterparty": "Corrected shop"},
        )
        listed = test_client.get("/api/transactions", params={"category": "food"}).json()
    assert edited.status_code == 200
    row = edited.json()
    assert row["amount"] == "1500"
    assert row["currency"] == "USD"
    assert row["original_amount"] == "1250"
    assert row["original_currency"] == "BDT"
    assert row["is_corrected"] is True
    assert row["category"] == "food"
    assert listed["total"] == 1


def test_dashboard_returns_totals_and_period_views():
    sms = (SAMPLES / "bkash_received.txt").read_text().strip()
    with client() as test_client:
        test_client.post("/api/transactions/import", json={"messages": [sms]})
        response = test_client.get("/api/dashboard", params={"period": "monthly"})
    assert response.status_code == 200
    dashboard = response.json()
    assert dashboard["base_currency"] == "BDT"
    assert dashboard["total_received"] == "1250"
    assert dashboard["total_spent"] == "0"
    assert len(dashboard["cash_flow"]) >= 28


def test_manual_rate_can_be_saved_and_used_without_network(monkeypatch):
    from app.routers import settings as settings_routes

    monkeypatch.setattr(settings_routes, "get_supported_currencies", lambda: ([{"code": "BDT", "name": "Bangladeshi Taka"}], False))
    sms = "Bank alert: Debit USD 45.20 at Green Basket. Transaction ID USDBK998877. Available balance USD 904.80."
    with client() as test_client:
        imported = test_client.post("/api/transactions/import", json={"messages": [sms]})
        saved = test_client.post("/api/settings/manual-rate", json={"from_currency": "USD", "to_currency": "BDT", "rate": "120.5"})
        settings = test_client.get("/api/settings")
        dashboard = test_client.get("/api/dashboard", params={"period": "monthly"}).json()
    assert imported.json()["saved_count"] == 1
    assert saved.status_code == 200
    assert saved.json()["status"] == "manual"
    assert settings.status_code == 200
    assert any(rate["from_currency"] == "USD" and rate["to_currency"] == "BDT" for rate in settings.json()["manual_rates"])
    assert dashboard["total_spent"] == "5446.6"
    assert dashboard["rate_status"]["USD"] == "manual"


def test_csv_and_pdf_exports_have_correct_media_types():
    sms = (SAMPLES / "bkash_received.txt").read_text().strip()
    with client() as test_client:
        test_client.post("/api/transactions/import", json={"messages": [sms]})
        csv_response = test_client.get("/api/exports/csv")
        pdf_response = test_client.get("/api/exports/pdf")
    assert csv_response.status_code == 200
    assert "text/csv" in csv_response.headers["content-type"]
    assert b"original_amount" in csv_response.content
    assert pdf_response.status_code == 200
    assert pdf_response.content.startswith(b"%PDF-")


def test_search_filter_is_applied_to_csv_and_pdf_exports():
    bKash_sms = (SAMPLES / "bkash_received.txt").read_text().strip()
    nagad_sms = (SAMPLES / "nagad_cashout.txt").read_text().strip()
    with client() as test_client:
        imported = test_client.post("/api/transactions/import", json={"messages": [bKash_sms, nagad_sms]})
        csv_response = test_client.get("/api/exports/csv", params={"search": "Agent"})
        pdf_response = test_client.get("/api/exports/pdf", params={"search": "Agent"})
    assert imported.status_code == 200
    assert imported.json()["saved_count"] == 2
    assert csv_response.status_code == 200
    assert b"NGD9X8Y7Z6" in csv_response.content
    assert b"AB12CD34EF" not in csv_response.content
    assert pdf_response.status_code == 200
    assert pdf_response.content.startswith(b"%PDF-")


def test_category_only_edit_does_not_create_financial_correction():
    sms = (SAMPLES / "bkash_received.txt").read_text().strip()
    with client() as test_client:
        imported = test_client.post("/api/transactions/import", json={"messages": [sms]}).json()
        transaction_id = imported["saved"][0]["id"]
        edited = test_client.put(
            f"/api/transactions/{transaction_id}",
            json={"amount": "1250", "currency": "BDT", "category": "food"},
        )
    assert edited.status_code == 200
    row = edited.json()
    assert row["category"] == "food"
    assert row["amount"] == row["original_amount"] == "1250"
    assert row["currency"] == row["original_currency"] == "BDT"
    assert row["is_corrected"] is False


def test_invalid_upload_is_rejected_cleanly():
    with client() as test_client:
        response = test_client.post("/api/transactions/upload", files={"file": ("transactions.exe", b"no", "application/octet-stream")})
    assert response.status_code == 415


def test_new_visitor_starts_empty_and_data_is_private_per_browser():
    sms = (SAMPLES / "bkash_received.txt").read_text().strip()
    with client() as alice, client() as bob:
        fresh = alice.get("/api/transactions").json()
        assert fresh["total"] == 0  # nobody starts with sample numbers
        alice.post("/api/transactions/import", json={"messages": [sms]})
        assert alice.get("/api/transactions").json()["total"] == 1
        assert bob.get("/api/transactions").json()["total"] == 0
        assert bob.get("/api/dashboard", params={"period": "monthly"}).json()["has_transactions"] is False
        # Bob can import the very same SMS (unique per owner) but cannot touch Alice's rows.
        assert bob.post("/api/transactions/import", json={"messages": [sms]}).json()["saved_count"] == 1
        alice_id = alice.get("/api/transactions").json()["items"][0]["id"]
        assert bob.delete(f"/api/transactions/{alice_id}").status_code == 404
        assert bob.put(f"/api/transactions/{alice_id}", json={"category": "food"}).status_code == 404
