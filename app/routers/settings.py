from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.currency import get_supported_currencies, remove_manual_rate, set_manual_rate
from app.database import get_db
from app.models import ExchangeRate
from app.owner import get_owner
from app.schemas import ManualRateRequest, SettingsUpdate
from app.services import decimal_text, get_or_create_settings

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("")
def read_settings(db: Session = Depends(get_db), owner: str = Depends(get_owner)):
    settings = get_or_create_settings(db, owner)
    currencies, live = get_supported_currencies()
    manual_rates = db.query(ExchangeRate).filter(ExchangeRate.owner_id == owner, ExchangeRate.is_manual.is_(True)).order_by(ExchangeRate.base_currency, ExchangeRate.quote_currency).all()
    return {
        "base_currency": settings.base_currency,
        "language": settings.language,
        "currencies": currencies,
        "currency_list_live": live,
        "manual_rates": [
            {
                "from_currency": row.base_currency,
                "to_currency": row.quote_currency,
                "rate": decimal_text(row.rate),
                "rate_date": row.rate_date.isoformat() if row.rate_date else None,
            }
            for row in manual_rates
        ],
    }


@router.put("")
def update_settings(payload: SettingsUpdate, db: Session = Depends(get_db), owner: str = Depends(get_owner)):
    changes = payload.model_dump(exclude_unset=True)
    settings = get_or_create_settings(db, owner)
    for field, value in changes.items():
        setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    return {"base_currency": settings.base_currency, "language": settings.language}


@router.post("/manual-rate")
def create_manual_rate(payload: ManualRateRequest, db: Session = Depends(get_db), owner: str = Depends(get_owner)):
    try:
        row = set_manual_rate(db, owner, payload.from_currency, payload.to_currency, payload.rate)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return {
        "from_currency": row.base_currency,
        "to_currency": row.quote_currency,
        "rate": decimal_text(row.rate),
        "status": "manual",
        "rate_date": (row.rate_date or date.today()).isoformat(),
    }


@router.delete("/manual-rate")
def delete_manual_rate(
    from_currency: str = Query(min_length=3, max_length=3, pattern=r"^[A-Za-z]{3}$"),
    to_currency: str = Query(min_length=3, max_length=3, pattern=r"^[A-Za-z]{3}$"),
    db: Session = Depends(get_db),
    owner: str = Depends(get_owner),
):
    removed = remove_manual_rate(db, owner, from_currency, to_currency)
    return {"deleted": removed, "from_currency": from_currency.upper(), "to_currency": to_currency.upper()}
