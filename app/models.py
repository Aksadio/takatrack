from __future__ import annotations

from datetime import date, datetime, timezone
from decimal import Decimal

from sqlalchemy import Boolean, Date, DateTime, Float, Integer, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


def utcnow_naive() -> datetime:
    """Store UTC timestamps as naive datetimes for portable SQLite comparisons."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Transaction(Base):
    __tablename__ = "transactions"
    __table_args__ = (
        UniqueConstraint("owner_id", "transaction_id", name="uq_transaction_owner_txid"),
        UniqueConstraint("owner_id", "sms_fingerprint", name="uq_transaction_owner_fingerprint"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    # Anonymous per-browser owner id: every visitor only ever sees their own ledger.
    owner_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    # amount/currency are the immutable values parsed from the original SMS.
    amount: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    currency: Mapped[str | None] = mapped_column(String(3), nullable=True)
    corrected_amount: Mapped[Decimal | None] = mapped_column(Numeric(20, 6), nullable=True)
    corrected_currency: Mapped[str | None] = mapped_column(String(3), nullable=True)
    transaction_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    transaction_type: Mapped[str] = mapped_column(String(16), nullable=False)
    counterparty: Mapped[str | None] = mapped_column(String(200), nullable=True)
    fee_amount: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False, default=Decimal("0"))
    balance_amount: Mapped[Decimal | None] = mapped_column(Numeric(20, 6), nullable=True)
    occurred_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=False), nullable=True)
    category: Mapped[str] = mapped_column(String(24), nullable=False, default="other")
    raw_sms: Mapped[str] = mapped_column(Text, nullable=False)
    sms_fingerprint: Mapped[str] = mapped_column(String(64), nullable=False)
    parse_confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    parse_source: Mapped[str] = mapped_column(String(16), nullable=False, default="regex")
    needs_review: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False, default=utcnow_naive, server_default=func.current_timestamp())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False, default=utcnow_naive, onupdate=utcnow_naive)


class AppSettings(Base):
    __tablename__ = "app_settings"

    owner_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    base_currency: Mapped[str] = mapped_column(String(3), nullable=False, default="BDT")
    language: Mapped[str] = mapped_column(String(2), nullable=False, default="en")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False, default=utcnow_naive, onupdate=utcnow_naive)


class ExchangeRate(Base):
    __tablename__ = "exchange_rates"
    __table_args__ = (UniqueConstraint("owner_id", "base_currency", "quote_currency", name="uq_exchange_rate_pair"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    # "" = shared market-rate cache; otherwise the visitor who saved a manual rate.
    owner_id: Mapped[str] = mapped_column(String(64), nullable=False, default="", index=True)
    base_currency: Mapped[str] = mapped_column(String(3), nullable=False)
    quote_currency: Mapped[str] = mapped_column(String(3), nullable=False)
    rate: Mapped[Decimal] = mapped_column(Numeric(24, 12), nullable=False)
    rate_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False, default=utcnow_naive)
    source: Mapped[str] = mapped_column(String(32), nullable=False, default="frankfurter")
    is_manual: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
