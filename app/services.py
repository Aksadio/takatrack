from __future__ import annotations

import re
from collections import defaultdict
from datetime import date, datetime, time, timedelta
from decimal import Decimal
from typing import Any

from sqlalchemy import func, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.currency import ConversionQuote, get_conversion_quote
from app.models import AppSettings, Transaction, utcnow_naive
from app.parser import SMSParseError, message_fingerprint, parse_sms

ZERO = Decimal("0")
INFLOW_TYPES = {"received", "cash-in"}
OUTFLOW_TYPES = {"sent", "cash-out", "payment", "recharge"}


def decimal_text(value: Decimal | None) -> str | None:
    if value is None:
        return None
    formatted = format(Decimal(value), "f")
    if "." in formatted:
        formatted = formatted.rstrip("0").rstrip(".")
    return formatted or "0"


def effective_amount(row: Transaction) -> Decimal:
    return Decimal(row.corrected_amount if row.corrected_amount is not None else row.amount)


def effective_currency(row: Transaction) -> str | None:
    return row.corrected_currency if row.corrected_currency is not None else row.currency


def transaction_to_dict(row: Transaction) -> dict[str, Any]:
    return {
        "id": row.id,
        "amount": decimal_text(effective_amount(row)),
        "currency": effective_currency(row),
        "original_amount": decimal_text(Decimal(row.amount)),
        "original_currency": row.currency,
        "is_corrected": row.corrected_amount is not None or row.corrected_currency is not None,
        "transaction_id": row.transaction_id,
        "transaction_type": row.transaction_type,
        "counterparty": row.counterparty,
        "fee_amount": decimal_text(Decimal(row.fee_amount)),
        "balance_amount": decimal_text(Decimal(row.balance_amount)) if row.balance_amount is not None else None,
        "occurred_at": row.occurred_at.isoformat() if row.occurred_at else None,
        "category": row.category,
        "raw_sms": row.raw_sms,
        "parse_confidence": round(row.parse_confidence, 2),
        "parse_source": row.parse_source,
        "needs_review": row.needs_review,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
    }


def split_sms_messages(text: str) -> list[str]:
    normalized = text.replace("\r\n", "\n").replace("\r", "\n").strip()
    if not normalized:
        return []
    blocks = [part.strip() for part in re.split(r"\n\s*\n+", normalized) if part.strip()]
    if len(blocks) > 1:
        return blocks
    lines = [line.strip() for line in normalized.splitlines() if line.strip()]
    return lines if len(lines) > 1 else [normalized]


def import_sms_messages(db: Session, owner_id: str, messages: list[str]) -> dict[str, Any]:
    saved: list[dict[str, Any]] = []
    duplicates = 0
    failed: list[dict[str, str]] = []
    for raw_sms in messages:
        raw = raw_sms.strip()
        fingerprint = message_fingerprint(raw)
        try:
            parsed = parse_sms(raw)
        except SMSParseError as exc:
            failed.append({"message": raw[:160], "error": str(exc)})
            continue

        if db.query(Transaction.id).filter(Transaction.owner_id == owner_id, Transaction.sms_fingerprint == fingerprint).first():
            duplicates += 1
            continue
        if parsed.transaction_id and db.query(Transaction.id).filter(Transaction.owner_id == owner_id, Transaction.transaction_id == parsed.transaction_id).first():
            duplicates += 1
            continue

        row = Transaction(
            owner_id=owner_id,
            amount=parsed.amount,
            currency=parsed.currency,
            transaction_id=parsed.transaction_id,
            transaction_type=parsed.transaction_type,
            counterparty=parsed.counterparty,
            fee_amount=parsed.fee_amount,
            balance_amount=parsed.balance_amount,
            occurred_at=parsed.occurred_at,
            category=parsed.category,
            raw_sms=raw,
            sms_fingerprint=fingerprint,
            parse_confidence=parsed.confidence,
            parse_source=parsed.parse_source,
            needs_review=parsed.needs_review,
        )
        try:
            with db.begin_nested():
                db.add(row)
                db.flush()
            saved.append(transaction_to_dict(row))
        except IntegrityError:
            duplicates += 1
    db.commit()
    return {"saved": saved, "saved_count": len(saved), "duplicate_count": duplicates, "failed": failed}


def transaction_query(
    db: Session,
    owner_id: str,
    *,
    search: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    transaction_type: str | None = None,
    category: str | None = None,
):
    query = db.query(Transaction).filter(Transaction.owner_id == owner_id)
    if search and search.strip():
        pattern = f"%{search.strip()}%"
        query = query.filter(or_(Transaction.counterparty.ilike(pattern), Transaction.transaction_id.ilike(pattern), Transaction.raw_sms.ilike(pattern)))
    if start_date:
        query = query.filter(func.date(func.coalesce(Transaction.occurred_at, Transaction.created_at)) >= start_date.isoformat())
    if end_date:
        query = query.filter(func.date(func.coalesce(Transaction.occurred_at, Transaction.created_at)) <= end_date.isoformat())
    if transaction_type:
        query = query.filter(Transaction.transaction_type == transaction_type)
    if category:
        query = query.filter(Transaction.category == category)
    return query.order_by(func.coalesce(Transaction.occurred_at, Transaction.created_at).desc(), Transaction.id.desc())


def _period_window(period: str, today: date) -> tuple[datetime, datetime, list[str], str]:
    if period == "daily":
        start = datetime.combine(today, time.min)
        end = start + timedelta(days=1)
        labels = [f"{hour:02d}:00" for hour in range(24)]
        return start, end, labels, "Today"
    if period == "weekly":
        monday = today - timedelta(days=today.weekday())
        start = datetime.combine(monday, time.min)
        end = start + timedelta(days=7)
        labels = [(monday + timedelta(days=i)).strftime("%a") for i in range(7)]
        return start, end, labels, "This week"
    start_date = today.replace(day=1)
    if start_date.month == 12:
        end_date = start_date.replace(year=start_date.year + 1, month=1)
    else:
        end_date = start_date.replace(month=start_date.month + 1)
    days = (end_date - start_date).days
    labels = [str(day) for day in range(1, days + 1)]
    return datetime.combine(start_date, time.min), datetime.combine(end_date, time.min), labels, "This month"


def _quote_map(db: Session, owner_id: str, currencies: set[str], base_currency: str) -> dict[str, ConversionQuote]:
    return {currency: get_conversion_quote(db, currency, base_currency, owner_id) for currency in currencies}


def _convert(amount: Decimal, currency: str | None, quotes: dict[str, ConversionQuote]) -> tuple[Decimal | None, str]:
    if not currency:
        return None, "unknown"
    quote = quotes.get(currency)
    if not quote or quote.rate is None:
        return None, "unavailable"
    return amount * quote.rate, quote.status


def dashboard_summary(db: Session, owner_id: str, base_currency: str, period: str = "monthly") -> dict[str, Any]:
    today = date.today()
    start, end, labels, period_label = _period_window(period, today)
    rows = db.query(Transaction).filter(
        Transaction.owner_id == owner_id,
        func.coalesce(Transaction.occurred_at, Transaction.created_at) >= start,
        func.coalesce(Transaction.occurred_at, Transaction.created_at) < end,
    ).all()
    currencies: set[str] = set()
    for row in rows:
        currency = effective_currency(row)
        if currency:
            currencies.add(currency)
    quotes = _quote_map(db, owner_id, currencies, base_currency)
    received = spent = fees = ZERO
    unconverted: set[str] = set()
    status_by_currency: dict[str, str] = {}
    category_totals: defaultdict[str, Decimal] = defaultdict(lambda: ZERO)
    counterparty_totals: defaultdict[str, Decimal] = defaultdict(lambda: ZERO)
    received_buckets: defaultdict[str, Decimal] = defaultdict(lambda: ZERO)
    spent_buckets: defaultdict[str, Decimal] = defaultdict(lambda: ZERO)

    for row in rows:
        amount = effective_amount(row)
        currency = effective_currency(row)
        amount_base, status = _convert(amount, currency, quotes)
        if amount_base is None:
            unconverted.add(currency or "Unknown currency")
            continue
        if currency:
            status_by_currency[currency] = status
        fee_base, fee_status = _convert(Decimal(row.fee_amount), currency, quotes)
        if fee_base is not None:
            fees += fee_base
            if currency:
                status_by_currency[currency] = "manual" if fee_status == "manual" else status_by_currency.get(currency, fee_status)

        moment = row.occurred_at or row.created_at or datetime.combine(today, time.min)
        if period == "daily":
            bucket = f"{moment.hour:02d}:00"
        elif period == "weekly":
            bucket = moment.strftime("%a")
        else:
            bucket = str(moment.day)
        if row.transaction_type in INFLOW_TYPES:
            received += amount_base
            received_buckets[bucket] += amount_base
        else:
            spent += amount_base
            spent_buckets[bucket] += amount_base
            category_totals[row.category] += amount_base
            if row.counterparty:
                counterparty_totals[row.counterparty] += amount_base

    cash_flow = [
        {"label": label, "received": decimal_text(received_buckets[label]) or "0", "spent": decimal_text(spent_buckets[label]) or "0"}
        for label in labels
    ]
    categories = [
        {"category": category, "amount": decimal_text(category_totals[category]) or "0"}
        for category in ("food", "transport", "recharge", "bills", "shopping", "other")
    ]
    top_counterparties = [
        {"name": name, "amount": decimal_text(amount)}
        for name, amount in sorted(counterparty_totals.items(), key=lambda item: item[1], reverse=True)[:5]
    ]
    return {
        "period": period,
        "period_label": period_label,
        "base_currency": base_currency,
        "total_received": decimal_text(received) or "0",
        "total_spent": decimal_text(spent) or "0",
        "total_fees": decimal_text(fees) or "0",
        "net_balance": decimal_text(received - spent) or "0",
        "transaction_count": len(rows),
        "cash_flow": cash_flow,
        "category_breakdown": categories,
        "top_counterparties": top_counterparties,
        "rate_status": status_by_currency,
        "unconverted_currencies": sorted(unconverted),
        "has_transactions": bool(rows),
    }


def get_or_create_settings(db: Session, owner_id: str) -> AppSettings:
    settings = db.query(AppSettings).filter_by(owner_id=owner_id).one_or_none()
    if settings is None:
        settings = AppSettings(owner_id=owner_id, base_currency="BDT", language="en")
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings
