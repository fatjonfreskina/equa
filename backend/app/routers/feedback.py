"""Public feedback intake; message content is never persisted by Equa."""

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session

from .. import schemas
from ..database import get_db
from ..email_delivery import (
    EmailDeliveryError,
    EmailSettings,
    get_feedback_settings,
    send_feedback,
)
from .email_links import cleanup_expired, reserve_limit, utcnow

router = APIRouter(tags=["feedback"])


def require_settings() -> EmailSettings:
    settings = get_feedback_settings()
    if settings is None:
        raise HTTPException(503, "Feedback non disponibile.")
    return settings


@router.get("/feedback/options", response_model=schemas.FeedbackOptions)
def feedback_options(response: Response):
    response.headers["Cache-Control"] = "no-store"
    settings = get_feedback_settings()
    return {
        "enabled": settings is not None,
        "privacy_url": settings.privacy_url if settings else None,
    }


@router.post("/feedback", status_code=204)
def submit_feedback(
    payload: schemas.FeedbackRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    settings = require_settings()
    now = utcnow()
    cleanup_expired(db, now)
    address = request.client.host if request.client else "unknown"
    detail = "Troppe segnalazioni. Riprova più tardi."
    reserve_limit(db, settings, "feedback-ip", address, 3600, 3, now, detail)
    reserve_limit(db, settings, "feedback-global", "all", 3600, 100, now, detail)
    db.commit()
    try:
        send_feedback(
            settings,
            payload.category,
            payload.message,
            payload.contact_email,
            payload.locale,
        )
    except EmailDeliveryError:
        raise HTTPException(
            503, "Invio del feedback non riuscito. Riprova più tardi."
        ) from None
