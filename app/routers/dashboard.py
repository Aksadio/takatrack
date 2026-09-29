from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.owner import get_owner
from app.services import dashboard_summary, get_or_create_settings

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("")
def read_dashboard(
    period: str = Query(default="monthly", pattern=r"^(daily|weekly|monthly)$"),
    db: Session = Depends(get_db),
    owner: str = Depends(get_owner),
):
    settings = get_or_create_settings(db, owner)
    try:
        return dashboard_summary(db, owner, settings.base_currency, period)
    except Exception as exc:
        # Keep financial data and provider internals out of unexpected error text.
        raise HTTPException(status_code=503, detail="The dashboard could not be refreshed. Please try again.") from exc
