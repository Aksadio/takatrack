from __future__ import annotations

import csv
import io
import os
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.owner import get_owner
from app.models import Transaction, utcnow_naive
from app.schemas import ImportRequest, TransactionUpdate
from app.services import import_sms_messages, transaction_query, transaction_to_dict

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


def _max_upload_bytes() -> int:
    try:
        return max(1, min(int(os.getenv("MAX_UPLOAD_BYTES", "1048576")), 5_000_000))
    except ValueError:
        return 1_048_576


def _csv_messages(text: str) -> list[str]:
    rows = list(csv.reader(io.StringIO(text)))
    if not rows:
        return []
    first = [cell.strip().casefold() for cell in rows[0]]
    column = next((first.index(name) for name in ("sms", "message", "text", "body") if name in first), None)
    start_at = 1 if column is not None else 0
    messages: list[str] = []
    for row in rows[start_at:]:
        if not row:
            continue
        if column is not None and column < len(row):
            value = row[column].strip()
        elif len(row) == 1:
            value = row[0].strip()
        else:
            value = " ".join(cell.strip() for cell in row if cell.strip())
        if value:
            messages.append(value)
    return messages


def _validated_import(messages: list[str]) -> ImportRequest:
    try:
        return ImportRequest(messages=messages)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post("/import")
def import_messages(payload: ImportRequest, db: Session = Depends(get_db), owner: str = Depends(get_owner)):
    """Parse pasted SMS messages and save only schema-validated nonduplicates."""
    return import_sms_messages(db, owner, payload.messages)


@router.post("/upload")
async def upload_messages(file: UploadFile = File(...), db: Session = Depends(get_db), owner: str = Depends(get_owner)):
    filename = (file.filename or "").lower()
    if Path(filename).suffix not in {".txt", ".csv"}:
        raise HTTPException(status_code=415, detail="Upload a plain-text .txt or .csv file.")
    raw = await file.read(_max_upload_bytes() + 1)
    if len(raw) > _max_upload_bytes():
        raise HTTPException(status_code=413, detail=f"The upload must be {_max_upload_bytes():,} bytes or smaller.")
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise HTTPException(status_code=400, detail="The file must use UTF-8 text encoding.") from exc
    if Path(filename).suffix == ".csv":
        messages = _csv_messages(text)
    else:
        from app.services import split_sms_messages

        messages = split_sms_messages(text)
    payload = _validated_import(messages)
    return import_sms_messages(db, owner, payload.messages)


@router.get("")
def list_transactions(
    search: str | None = Query(default=None, max_length=120),
    start_date: str | None = Query(default=None),
    end_date: str | None = Query(default=None),
    transaction_type: str | None = Query(default=None),
    category: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    owner: str = Depends(get_owner),
):
    from datetime import date

    try:
        parsed_start = date.fromisoformat(start_date) if start_date else None
        parsed_end = date.fromisoformat(end_date) if end_date else None
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="Use YYYY-MM-DD for date filters.") from exc
    if transaction_type and transaction_type not in {"sent", "received", "cash-in", "cash-out", "payment", "recharge"}:
        raise HTTPException(status_code=422, detail="Choose a supported transaction type.")
    if category and category not in {"food", "transport", "recharge", "bills", "shopping", "other"}:
        raise HTTPException(status_code=422, detail="Choose a supported category.")
    if parsed_start and parsed_end and parsed_start > parsed_end:
        raise HTTPException(status_code=422, detail="Start date must be before end date.")
    query = transaction_query(
        db,
        owner,
        search=search,
        start_date=parsed_start,
        end_date=parsed_end,
        transaction_type=transaction_type,
        category=category,
    )
    total = query.count()
    rows = query.offset(offset).limit(limit).all()
    return {"items": [transaction_to_dict(row) for row in rows], "total": total, "limit": limit, "offset": offset}


@router.put("/{transaction_pk}")
def update_transaction(transaction_pk: int, payload: TransactionUpdate, db: Session = Depends(get_db), owner: str = Depends(get_owner)):
    row = db.get(Transaction, transaction_pk)
    if row is None or row.owner_id != owner:
        raise HTTPException(status_code=404, detail="That transaction could not be found.")
    changes = payload.model_dump(exclude_unset=True)
    if "transaction_id" in changes and changes["transaction_id"]:
        conflict = db.query(Transaction.id).filter(
            Transaction.owner_id == owner, Transaction.transaction_id == changes["transaction_id"], Transaction.id != transaction_pk
        ).first()
        if conflict:
            raise HTTPException(status_code=409, detail="That transaction ID is already in your ledger.")
    if "amount" in changes:
        amount = changes.pop("amount")
        row.corrected_amount = None if amount is None or amount == row.amount else amount
    if "currency" in changes:
        currency = changes.pop("currency")
        row.corrected_currency = None if currency == row.currency else currency
    for field, value in changes.items():
        setattr(row, field, value)
    if changes or payload.amount is not None or payload.currency is not None:
        row.needs_review = False
    row.updated_at = utcnow_naive()
    try:
        db.commit()
        db.refresh(row)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="That transaction ID is already in your ledger.") from exc
    return transaction_to_dict(row)


@router.delete("/{transaction_pk}")
def delete_transaction(transaction_pk: int, db: Session = Depends(get_db), owner: str = Depends(get_owner)):
    row = db.get(Transaction, transaction_pk)
    if row is None or row.owner_id != owner:
        raise HTTPException(status_code=404, detail="That transaction could not be found.")
    db.delete(row)
    db.commit()
    return {"deleted": True, "id": transaction_pk}
