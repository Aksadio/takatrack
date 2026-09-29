from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

TransactionType = Literal["sent", "received", "cash-in", "cash-out", "payment", "recharge"]
Category = Literal["food", "transport", "recharge", "bills", "shopping", "other"]


class ParsedSMS(BaseModel):
    """Validated, normalized transaction fields; original SMS text is stored separately."""

    model_config = ConfigDict(extra="forbid")

    amount: Decimal = Field(gt=0, max_digits=20, decimal_places=6)
    currency: str | None = Field(default=None, pattern=r"^[A-Z]{3}$")
    transaction_id: str | None = Field(default=None, max_length=128)
    transaction_type: TransactionType
    counterparty: str | None = Field(default=None, max_length=200)
    fee_amount: Decimal = Field(default=Decimal("0"), ge=0, max_digits=20, decimal_places=6)
    balance_amount: Decimal | None = Field(default=None, ge=0, max_digits=20, decimal_places=6)
    occurred_at: datetime | None = None
    category: Category = "other"
    confidence: float = Field(ge=0, le=1)
    parse_source: Literal["regex", "gemini"] = "regex"
    needs_review: bool = False

    @field_validator("currency", mode="before")
    @classmethod
    def normalize_currency(cls, value: object) -> object:
        if value is None or (isinstance(value, str) and value.strip().lower() in {"", "unknown", "unk", "null"}):
            return None
        if isinstance(value, str):
            return value.strip().upper()
        return value

    @field_validator("transaction_id", "counterparty", mode="before")
    @classmethod
    def normalize_optional_text(cls, value: object) -> object:
        if value is None:
            return None
        if isinstance(value, str):
            clean = value.strip()
            return clean or None
        return value


class ImportRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    messages: list[str] = Field(min_length=1, max_length=100)

    @field_validator("messages")
    @classmethod
    def validate_messages(cls, messages: list[str]) -> list[str]:
        clean = [message.strip() for message in messages]
        if any(not message for message in clean):
            raise ValueError("Messages cannot be blank.")
        if any(len(message) > 6_000 for message in clean):
            raise ValueError("Each message must be 6,000 characters or fewer.")
        if sum(map(len, clean)) > 100_000:
            raise ValueError("The total import text must be 100,000 characters or fewer.")
        return clean


class TransactionUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    amount: Decimal | None = Field(default=None, gt=0, max_digits=20, decimal_places=6)
    currency: str | None = Field(default=None, pattern=r"^[A-Z]{3}$")
    transaction_id: str | None = Field(default=None, max_length=128)
    transaction_type: TransactionType | None = None
    counterparty: str | None = Field(default=None, max_length=200)
    fee_amount: Decimal | None = Field(default=None, ge=0, max_digits=20, decimal_places=6)
    balance_amount: Decimal | None = Field(default=None, ge=0, max_digits=20, decimal_places=6)
    occurred_at: datetime | None = None
    category: Category | None = None
    needs_review: bool | None = None

    @field_validator("currency", mode="before")
    @classmethod
    def normalize_update_currency(cls, value: object) -> object:
        if value is None or (isinstance(value, str) and not value.strip()):
            return None
        if isinstance(value, str):
            return value.strip().upper()
        return value

    @field_validator("transaction_id", "counterparty", mode="before")
    @classmethod
    def normalize_update_text(cls, value: object) -> object:
        if value is None:
            return None
        if isinstance(value, str):
            return value.strip() or None
        return value


class SettingsUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    base_currency: str | None = Field(default=None, pattern=r"^[A-Z]{3}$")
    language: Literal["en", "bn"] | None = None

    @field_validator("base_currency", mode="before")
    @classmethod
    def normalize_base_currency(cls, value: object) -> object:
        return value.strip().upper() if isinstance(value, str) else value


class ManualRateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    from_currency: str = Field(pattern=r"^[A-Z]{3}$")
    to_currency: str = Field(pattern=r"^[A-Z]{3}$")
    rate: Decimal = Field(gt=0, max_digits=24, decimal_places=12)

    @field_validator("from_currency", "to_currency", mode="before")
    @classmethod
    def normalize_pair_currency(cls, value: object) -> object:
        return value.strip().upper() if isinstance(value, str) else value
