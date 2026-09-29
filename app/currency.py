from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta
from decimal import Decimal, InvalidOperation
from typing import Any

import httpx
from sqlalchemy.orm import Session

from app.models import ExchangeRate, utcnow_naive

FRANKFURTER_API = "https://api.frankfurter.dev/v2"
RATE_CACHE_TTL = timedelta(hours=24)
_CURRENCY_LIST_CACHE: tuple[datetime, list[dict[str, str]]] | None = None
COMMON_CURRENCIES = [
    {"code": code, "name": name}
    for code, name in [
        ("BDT", "Bangladeshi Taka"), ("USD", "US Dollar"), ("EUR", "Euro"), ("GBP", "British Pound"),
        ("INR", "Indian Rupee"), ("SAR", "Saudi Riyal"), ("AED", "UAE Dirham"), ("PKR", "Pakistani Rupee"),
        ("NPR", "Nepalese Rupee"), ("LKR", "Sri Lankan Rupee"), ("JPY", "Japanese Yen"), ("CNY", "Chinese Yuan"),
        ("CAD", "Canadian Dollar"), ("AUD", "Australian Dollar"), ("SGD", "Singapore Dollar"), ("HKD", "Hong Kong Dollar"),
        ("MYR", "Malaysian Ringgit"), ("THB", "Thai Baht"), ("KWD", "Kuwaiti Dinar"), ("QAR", "Qatari Riyal"),
        ("OMR", "Omani Rial"), ("ZAR", "South African Rand"), ("NGN", "Nigerian Naira"), ("GHS", "Ghanaian Cedi"),
        ("KES", "Kenyan Shilling"), ("TZS", "Tanzanian Shilling"), ("UGX", "Ugandan Shilling"), ("IDR", "Indonesian Rupiah"),
        ("TRY", "Turkish Lira"), ("CHF", "Swiss Franc"), ("SEK", "Swedish Krona"), ("NOK", "Norwegian Krone"),
        ("DKK", "Danish Krone"), ("PLN", "Polish Zloty"), ("RUB", "Russian Ruble"), ("KRW", "South Korean Won"),
        ("BRL", "Brazilian Real"), ("MXN", "Mexican Peso"), ("PHP", "Philippine Peso"), ("VND", "Vietnamese Dong"),
        ("NZD", "New Zealand Dollar"), ("EGP", "Egyptian Pound"), ("MAD", "Moroccan Dirham"), ("ILS", "Israeli New Shekel"),
        ("MNT", "Mongolian Tugrik"), ("MMK", "Myanmar Kyat"), ("ARS", "Argentine Peso"), ("CLP", "Chilean Peso"),
        ("COP", "Colombian Peso"), ("RWF", "Rwandan Franc"), ("XOF", "West African CFA Franc"), ("XAF", "Central African CFA Franc"),
    ]
]


@dataclass(frozen=True)
class ConversionQuote:
    rate: Decimal | None
    status: str
    rate_date: date | None = None


def _query_pair(db: Session, base: str, quote: str, owner_id: str = "") -> ExchangeRate | None:
    return db.query(ExchangeRate).filter_by(owner_id=owner_id, base_currency=base, quote_currency=quote).one_or_none()


def _cached_quote(row: ExchangeRate, now: datetime, *, inverse: bool = False) -> ConversionQuote:
    rate = Decimal(row.rate)
    if inverse:
        rate = Decimal("1") / rate
    if row.is_manual:
        status = "manual"
    elif now - row.fetched_at <= RATE_CACHE_TTL:
        status = "cached"
    else:
        status = "stale"
    return ConversionQuote(rate=rate, status=status, rate_date=row.rate_date)


def _refresh_pair(db: Session, base: str, quote: str) -> ExchangeRate | None:
    try:
        response = httpx.get(
            f"{FRANKFURTER_API}/rate/{base.lower()}/{quote.lower()}",
            timeout=httpx.Timeout(8.0, connect=3.0),
            headers={"Accept": "application/json"},
        )
        response.raise_for_status()
        payload: Any = response.json()
        rate = Decimal(str(payload["rate"]))
        if not rate.is_finite() or rate <= 0:
            return None
        rate_date = date.fromisoformat(str(payload["date"])) if payload.get("date") else None
    except (httpx.HTTPError, ValueError, TypeError, KeyError, InvalidOperation):
        return None

    row = _query_pair(db, base, quote, "")
    if row is None:
        row = ExchangeRate(owner_id="", base_currency=base, quote_currency=quote, rate=rate)
        db.add(row)
    row.rate = rate
    row.rate_date = rate_date
    row.fetched_at = utcnow_naive()
    row.source = "frankfurter"
    row.is_manual = False
    db.commit()
    db.refresh(row)
    return row


def get_conversion_quote(db: Session, from_currency: str | None, to_currency: str, owner_id: str = "") -> ConversionQuote:
    """Resolve 1 source-currency unit to target currency, preferring manual then fresh rates."""
    if not from_currency:
        return ConversionQuote(rate=None, status="unknown")
    source, target = from_currency.upper(), to_currency.upper()
    if source == target:
        return ConversionQuote(rate=Decimal("1"), status="same-currency", rate_date=date.today())

    now = utcnow_naive()
    # Manual rates belong to this visitor only; market-rate cache rows are shared.
    manual_direct = _query_pair(db, source, target, owner_id) if owner_id else None
    if manual_direct is not None and manual_direct.is_manual:
        return _cached_quote(manual_direct, now)
    manual_inverse = _query_pair(db, target, source, owner_id) if owner_id else None
    if manual_inverse is not None and manual_inverse.is_manual:
        return _cached_quote(manual_inverse, now, inverse=True)
    direct = _query_pair(db, source, target, "")
    inverse = _query_pair(db, target, source, "")
    if direct is not None and now - direct.fetched_at <= RATE_CACHE_TTL:
        return _cached_quote(direct, now)

    updated = _refresh_pair(db, source, target)
    if updated is not None:
        return _cached_quote(updated, utcnow_naive())
    if direct is not None:
        return _cached_quote(direct, now)
    if inverse is not None:
        return _cached_quote(inverse, now, inverse=True)
    return ConversionQuote(rate=None, status="unavailable")


def set_manual_rate(db: Session, owner_id: str, from_currency: str, to_currency: str, rate: Decimal) -> ExchangeRate:
    source, target = from_currency.upper(), to_currency.upper()
    if source == target:
        raise ValueError("Choose two different currencies for a manual exchange rate.")
    value = Decimal(rate)
    if not value.is_finite() or value <= 0:
        raise ValueError("The manual rate must be greater than zero.")
    row = _query_pair(db, source, target, owner_id)
    if row is None:
        row = ExchangeRate(owner_id=owner_id, base_currency=source, quote_currency=target, rate=value)
        db.add(row)
    row.rate = value
    row.rate_date = date.today()
    row.fetched_at = utcnow_naive()
    row.source = "manual"
    row.is_manual = True
    db.commit()
    db.refresh(row)
    return row


def remove_manual_rate(db: Session, owner_id: str, from_currency: str, to_currency: str) -> bool:
    row = _query_pair(db, from_currency.upper(), to_currency.upper(), owner_id)
    if row is None or not row.is_manual:
        return False
    db.delete(row)
    db.commit()
    return True


def get_supported_currencies(*, force_refresh: bool = False) -> tuple[list[dict[str, str]], bool]:
    """Return Frankfurter's keyless currency list, falling back to a bundled common set."""
    global _CURRENCY_LIST_CACHE
    now = utcnow_naive()
    if not force_refresh and _CURRENCY_LIST_CACHE and now - _CURRENCY_LIST_CACHE[0] <= RATE_CACHE_TTL:
        return _CURRENCY_LIST_CACHE[1], False
    try:
        response = httpx.get(f"{FRANKFURTER_API}/currencies", timeout=httpx.Timeout(8.0, connect=3.0))
        response.raise_for_status()
        body = response.json()
        result: list[dict[str, str]] = []
        for item in body:
            code = str(item.get("iso_code") or item.get("code") or item.get("currency") or "").upper()
            name = str(item.get("name") or item.get("currency_name") or code)
            if len(code) == 3 and code.isalpha():
                result.append({"code": code, "name": name})
        if not result:
            raise ValueError("Currency response contained no usable entries.")
        result.sort(key=lambda item: item["code"])
        _CURRENCY_LIST_CACHE = (now, result)
        return result, True
    except (httpx.HTTPError, ValueError, TypeError, AttributeError):
        if _CURRENCY_LIST_CACHE:
            return _CURRENCY_LIST_CACHE[1], False
        return COMMON_CURRENCIES, False
