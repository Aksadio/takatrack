from __future__ import annotations

import csv
import io
from datetime import date
from decimal import Decimal
from html import escape
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy.orm import Session

from app.currency import get_conversion_quote
from app.database import get_db
from app.owner import get_owner
from app.services import effective_amount, effective_currency, get_or_create_settings, transaction_query

router = APIRouter(prefix="/api/exports", tags=["exports"])


def _rows(db: Session, owner: str, start_date: str | None, end_date: str | None, transaction_type: str | None, category: str | None, search: str | None):
    try:
        start = date.fromisoformat(start_date) if start_date else None
        end = date.fromisoformat(end_date) if end_date else None
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="Use YYYY-MM-DD for export date filters.") from exc
    if start and end and start > end:
        raise HTTPException(status_code=422, detail="Start date must be before end date.")
    if transaction_type and transaction_type not in {"sent", "received", "cash-in", "cash-out", "payment", "recharge"}:
        raise HTTPException(status_code=422, detail="Choose a supported transaction type.")
    if category and category not in {"food", "transport", "recharge", "bills", "shopping", "other"}:
        raise HTTPException(status_code=422, detail="Choose a supported category.")
    query = transaction_query(db, owner, search=search, start_date=start, end_date=end, transaction_type=transaction_type, category=category)
    return query.limit(10_000).all()


def _report_records(db: Session, owner: str, rows: list, base_currency: str) -> list[dict[str, str]]:
    records = []
    for row in rows:
        amount = effective_amount(row)
        currency = effective_currency(row)
        quote = get_conversion_quote(db, currency, base_currency, owner)
        converted = amount * quote.rate if quote.rate is not None else None
        records.append({
            "id": str(row.id),
            "date": row.occurred_at.isoformat(sep=" ") if row.occurred_at else "",
            "transaction_type": row.transaction_type,
            "counterparty": row.counterparty or "",
            "amount": format(amount, "f"),
            "currency": currency or "",
            "original_amount": format(Decimal(row.amount), "f"),
            "original_currency": row.currency or "",
            "fee_amount": format(Decimal(row.fee_amount), "f"),
            "balance_amount": format(Decimal(row.balance_amount), "f") if row.balance_amount is not None else "",
            "category": row.category,
            "transaction_id": row.transaction_id or "",
            "base_amount": format(converted, "f") if converted is not None else "",
            "base_currency": base_currency,
            "rate_status": quote.status,
        })
    return records


def _safe_csv_cell(value: str) -> str:
    return "'" + value if value.startswith(("=", "+", "-", "@", "\t", "\r")) else value


def _export_data(db: Session, owner: str, start_date: str | None, end_date: str | None, transaction_type: str | None, category: str | None, search: str | None):
    rows = _rows(db, owner, start_date, end_date, transaction_type, category, search)
    settings = get_or_create_settings(db, owner)
    return _report_records(db, owner, rows, settings.base_currency)


@router.get("/csv")
def export_csv(
    start_date: str | None = None,
    end_date: str | None = None,
    transaction_type: str | None = None,
    category: str | None = None,
    search: str | None = Query(default=None, max_length=200),
    db: Session = Depends(get_db),
    owner: str = Depends(get_owner),
):
    records = _export_data(db, owner, start_date, end_date, transaction_type, category, search)
    output = io.StringIO(newline="")
    fields = ["id", "date", "transaction_type", "counterparty", "amount", "currency", "original_amount", "original_currency", "fee_amount", "balance_amount", "category", "transaction_id", "base_amount", "base_currency", "rate_status"]
    writer = csv.DictWriter(output, fieldnames=fields, extrasaction="ignore")
    writer.writeheader()
    for record in records:
        writer.writerow({key: _safe_csv_cell(value) for key, value in record.items()})
    return Response(
        output.getvalue().encode("utf-8-sig"),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="takatrack-report.csv"', "Cache-Control": "private, no-store"},
    )


@router.get("/pdf")
def export_pdf(
    start_date: str | None = None,
    end_date: str | None = None,
    transaction_type: str | None = None,
    category: str | None = None,
    search: str | None = Query(default=None, max_length=200),
    db: Session = Depends(get_db),
    owner: str = Depends(get_owner),
):
    records = _export_data(db, owner, start_date, end_date, transaction_type, category, search)
    settings = get_or_create_settings(db, owner)
    buffer = io.BytesIO()
    document = SimpleDocTemplate(buffer, pagesize=landscape(A4), rightMargin=12 * mm, leftMargin=12 * mm, topMargin=12 * mm, bottomMargin=12 * mm)
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="SmallCell", parent=styles["BodyText"], fontName="Helvetica", fontSize=7, leading=8, alignment=TA_LEFT))
    story: list[Any] = [Paragraph("TakaTrack transaction report", styles["Title"]), Paragraph(f"Base display currency: {escape(settings.base_currency)} · {len(records)} transactions", styles["Normal"]), Spacer(1, 6 * mm)]
    headers = ["Date", "Type", "Counterparty", "Amount", "Fee", "Category", "Reference", "Base amount"]
    table_data: list[list[Any]] = [headers]
    for record in records:
        party = escape(record["counterparty"][:48])
        table_data.append([
            Paragraph(escape(record["date"][:16]), styles["SmallCell"]),
            Paragraph(escape(record["transaction_type"]), styles["SmallCell"]),
            Paragraph(party, styles["SmallCell"]),
            Paragraph(escape(f"{record['amount']} {record['currency']}".strip()), styles["SmallCell"]),
            Paragraph(escape(record["fee_amount"]), styles["SmallCell"]),
            Paragraph(escape(record["category"]), styles["SmallCell"]),
            Paragraph(escape(record["transaction_id"][:24]), styles["SmallCell"]),
            Paragraph(escape(f"{record['base_amount']} {record['base_currency']}".strip()), styles["SmallCell"]),
        ])
    table = Table(table_data, repeatRows=1, colWidths=[30 * mm, 22 * mm, 45 * mm, 35 * mm, 20 * mm, 24 * mm, 34 * mm, 35 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0B1730")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 8),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#DCE3EC")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F4F7FA")]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(table)
    document.build(story)
    return Response(
        buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="takatrack-report.pdf"', "Cache-Control": "private, no-store"},
    )
