from decimal import Decimal
from pathlib import Path

import pytest

from app.parser import SMSParseError, message_fingerprint, parse_sms

SAMPLES = Path(__file__).resolve().parents[1] / "samples"


def test_bkash_received_extracts_amount_currency_id_party_balance_and_date():
    parsed = parse_sms((SAMPLES / "bkash_received.txt").read_text())
    assert parsed.amount == Decimal("1250")
    assert parsed.currency == "BDT"
    assert parsed.transaction_type == "received"
    assert parsed.transaction_id == "AB12CD34EF"
    assert parsed.counterparty == "01712345678"
    assert parsed.balance_amount == Decimal("5240")
    assert parsed.occurred_at is not None
    assert parsed.category == "other"
    assert parsed.parse_source == "regex"
    assert parsed.needs_review is False


def test_nagad_cashout_extracts_fee_and_cash_out_type():
    parsed = parse_sms((SAMPLES / "nagad_cashout.txt").read_text())
    assert parsed.amount == Decimal("2000")
    assert parsed.currency == "BDT"
    assert parsed.transaction_type == "cash-out"
    assert parsed.fee_amount == Decimal("18.5")
    assert parsed.balance_amount == Decimal("3221.5")
    assert parsed.transaction_id == "NGD9X8Y7Z6"


def test_rocket_payment_parses_bangla_currency_code_and_food_category():
    parsed = parse_sms((SAMPLES / "rocket_payment.txt").read_text())
    assert parsed.amount == Decimal("570")
    assert parsed.currency == "BDT"
    assert parsed.transaction_type == "payment"
    assert parsed.transaction_id == "RKT778899"
    assert parsed.counterparty == "Fresh Mart"
    assert parsed.category == "food"


def test_generic_recharge_parses_usd_fee_and_recharge_type():
    parsed = parse_sms((SAMPLES / "generic_recharge.txt").read_text())
    assert parsed.amount == Decimal("12.99")
    assert parsed.currency == "USD"
    assert parsed.transaction_type == "recharge"
    assert parsed.fee_amount == Decimal("0.5")
    assert parsed.category == "recharge"


def test_usd_bank_sms_extracts_debit_and_balance():
    parsed = parse_sms((SAMPLES / "usd_bank.txt").read_text())
    assert parsed.amount == Decimal("45.2")
    assert parsed.currency == "USD"
    assert parsed.transaction_type == "sent"
    assert parsed.balance_amount == Decimal("904.8")
    assert parsed.transaction_id == "USDBK998877"
    assert parsed.counterparty == "Green Basket"


@pytest.mark.parametrize("amount_phrase", ["BWP 850.00", "850.00 BWP"])
def test_explicit_iso_currency_codes_outside_common_aliases_parse_without_network(amount_phrase):
    # The deterministic regex parser recognizes less-common explicit currency codes without Gemini or FX access.
    parsed = parse_sms(f"Payment of {amount_phrase} to Fresh Market. TrxID PX901234. 2026-09-20 10:30", allow_gemini=False)
    assert parsed.amount == Decimal("850")
    assert parsed.currency == "BWP"
    assert parsed.transaction_type == "payment"
    assert parsed.counterparty == "Fresh Market"
    assert parsed.parse_source == "regex"
    assert parsed.needs_review is False


def test_ambiguous_low_confidence_message_calls_gemini_and_validates(monkeypatch):
    from app import parser

    called = []

    def fake_gemini(raw_sms: str):
        called.append(raw_sms)
        return {
            "amount": "240.75",
            "currency": "USD",
            "transaction_id": "AI112233",
            "transaction_type": "payment",
            "counterparty": "Corner Shop",
            "fee_amount": "1.25",
            "balance_amount": "800.00",
            "occurred_at": "2026-09-20T10:30:00",
            "category": "shopping",
            "confidence": 0.91,
        }

    monkeypatch.setattr(parser, "_gemini_extract", fake_gemini)
    parsed = parse_sms("Processed transaction ref AI112233; some details are missing.")
    assert called == ["Processed transaction ref AI112233; some details are missing."]
    assert parsed.amount == Decimal("240.75")
    assert parsed.currency == "USD"
    assert parsed.fee_amount == Decimal("1.25")
    assert parsed.parse_source == "gemini"
    assert parsed.needs_review is False


def test_no_key_or_low_confidence_fallback_keeps_regex_preview_for_manual_review(monkeypatch):
    from app import parser

    monkeypatch.setattr(parser, "_gemini_extract", lambda _: None)
    parsed = parse_sms("Payment USD 25.00 to Shop.")
    assert parsed.amount == Decimal("25")
    assert parsed.needs_review is True
    assert parsed.parse_source == "regex"


def test_invalid_gemini_json_is_not_accepted_and_regex_preview_needs_review(monkeypatch):
    from app import parser

    monkeypatch.setattr(parser, "_gemini_extract", lambda _: {"amount": -50, "currency": "USD"})
    parsed = parse_sms("Payment USD 25.00 to Shop.")
    assert parsed.amount == Decimal("25")
    assert parsed.parse_source == "regex"
    assert parsed.needs_review is True


def test_message_without_amount_fails_cleanly_when_gemini_has_no_result(monkeypatch):
    from app import parser

    monkeypatch.setattr(parser, "_gemini_extract", lambda _: None)
    with pytest.raises(SMSParseError, match="transaction amount"):
        parse_sms("Your account update is ready.")


def test_empty_and_oversized_messages_are_rejected():
    with pytest.raises(SMSParseError, match="Paste"):
        parse_sms("  ")
    with pytest.raises(SMSParseError, match="characters or fewer"):
        parse_sms("x" * 6_001)


def test_message_fingerprint_is_stable_for_spacing_and_case():
    assert message_fingerprint("Paid  Tk 50\nRef: X") == message_fingerprint("paid tk 50 ref: x")
