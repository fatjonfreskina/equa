from datetime import datetime

import pytest
from fastapi import HTTPException, Request, Response
from pydantic import ValidationError
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.database import Base
from backend.app.email_delivery import EmailDeliveryError, EmailSettings
from backend.app.models import EmailLinkRateLimit
from backend.app.routers import feedback
from backend.app.schemas import FeedbackRequest


@pytest.fixture
def context(monkeypatch):
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()
    settings = EmailSettings(
        secret="f" * 40,
        service_url="https://email.example",
        service_token="t" * 40,
        privacy_url="https://equa.example/privacy",
    )
    sent = []
    monkeypatch.setattr(feedback, "get_feedback_settings", lambda: settings)
    monkeypatch.setattr(feedback, "send_feedback", lambda *args: sent.append(args))
    monkeypatch.setattr(feedback, "utcnow", lambda: datetime(2026, 9, 12, 12, 0))
    try:
        yield session, settings, sent
    finally:
        session.close()
        engine.dispose()


def submit(context, message="Il pulsante non risponde correttamente."):
    request = Request({"type": "http", "client": ("192.0.2.10", 1234)})
    feedback.submit_feedback(
        FeedbackRequest(
            category="bug", message=message, contact_email=None, locale="it"
        ),
        request,
        context[0],
    )


def test_feedback_is_forwarded_without_persistence(context):
    submit(context)
    assert context[2][0][1:] == (
        "bug",
        "Il pulsante non risponde correttamente.",
        None,
        "it",
    )
    assert context[0].query(EmailLinkRateLimit).count() == 2


def test_feedback_is_limited_per_ip(context):
    for _ in range(3):
        submit(context)
    with pytest.raises(HTTPException) as error:
        submit(context)
    assert error.value.status_code == 429
    assert len(context[2]) == 3


def test_delivery_failure_is_private(context, monkeypatch):
    def fail(*args):
        raise EmailDeliveryError("private service detail")

    monkeypatch.setattr(feedback, "send_feedback", fail)
    with pytest.raises(HTTPException) as error:
        submit(context)
    assert error.value.status_code == 503
    assert "private" not in error.value.detail


def test_disabled_feedback_is_hidden(context, monkeypatch):
    monkeypatch.setattr(feedback, "get_feedback_settings", lambda: None)
    assert feedback.feedback_options(Response()) == {
        "enabled": False,
        "privacy_url": None,
    }
    with pytest.raises(HTTPException) as error:
        submit(context)
    assert error.value.status_code == 503


@pytest.mark.parametrize(
    "payload",
    [
        {"category": "other", "message": "A valid message", "locale": "it"},
        {"category": "bug", "message": "short", "locale": "it"},
        {"category": "bug", "message": "A valid message", "locale": "fr"},
        {
            "category": "bug",
            "message": "A valid message",
            "locale": "it",
            "unexpected": "field",
        },
    ],
)
def test_feedback_validation(payload):
    with pytest.raises(ValidationError):
        FeedbackRequest(**payload)
