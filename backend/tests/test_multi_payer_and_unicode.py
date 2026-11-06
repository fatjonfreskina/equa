from decimal import Decimal

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app import models, schemas
from backend.app.database import Base
from backend.app.routers import expenses, groups
from backend.app.routers.balances import calculate_balances


@pytest.fixture
def db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()
    yield session
    session.close()
    engine.dispose()


@pytest.fixture
def group(db):
    value = models.Group(
        name="Weekend 🏖️",
        currency="EUR",
        members=[
            models.Member(name="Anna 👩"),
            models.Member(name="Bruno 🧔"),
            models.Member(name="Carlo 🧑"),
        ],
    )
    db.add(value)
    db.commit()
    return value


def payload(group, payments):
    ids = [member.id for member in group.members]
    return schemas.ExpenseCreate(
        paid_by_member_id=payments[0][0],
        description="Cena 🍕",
        amount="60",
        currency="EUR",
        payments=[
            schemas.ExpensePaymentCreate(member_id=member_id, amount=amount)
            for member_id, amount in payments
        ],
        splits=[
            schemas.SplitCreate(member_id=member_id, share_amount="20")
            for member_id in ids
        ],
    )


def test_multi_payer_expense_drives_balances(db, group):
    anna, bruno, carlo = group.members
    saved = expenses.add_expense(
        group.id,
        payload(group, [(anna.id, "40"), (bruno.id, "20")]),
        db,
    )

    assert [(item.member_id, item.amount) for item in saved.payments] == [
        (anna.id, Decimal("40.00")),
        (bruno.id, Decimal("20.00")),
    ]
    assert [
        (balance.from_member_id, balance.to_member_id, balance.amount)
        for balance in calculate_balances(group)
    ] == [(carlo.id, anna.id, Decimal("20.00"))]


def test_multi_payer_total_and_duplicates_are_validated(db, group):
    anna, bruno, _ = group.members
    with pytest.raises(HTTPException, match="somma dei versamenti"):
        expenses.add_expense(
            group.id,
            payload(group, [(anna.id, "30"), (bruno.id, "20")]),
            db,
        )

    with pytest.raises(HTTPException, match="duplicati"):
        expenses.add_expense(
            group.id,
            payload(group, [(anna.id, "30"), (anna.id, "30")]),
            db,
        )


def test_legacy_single_payer_request_creates_payment(db, group):
    anna = group.members[0]
    request = payload(group, [(anna.id, "60")])
    request.payments = None

    saved = expenses.add_expense(group.id, request, db)

    assert len(saved.payments) == 1
    assert saved.payments[0].member_id == anna.id
    assert saved.payments[0].amount == Decimal("60.00")


def test_emoji_round_trip_in_group_and_expense(db):
    created = groups.create_group(
        schemas.GroupCreate(
            name="Vacanza 🏝️",
            description="Estate ☀️",
            currency="EUR",
            members=[schemas.MemberCreate(name="Giulia 👩‍🚀")],
        ),
        db,
    )
    saved = expenses.add_expense_equal(
        created.id,
        schemas.ExpenseCreateEqual(
            paid_by_member_id=created.members[0].id,
            description="Gelato 🍦",
            amount="5",
            currency="EUR",
        ),
        db,
    )

    db.expire_all()
    loaded = groups.get_group(created.id, db)
    assert loaded.name == "Vacanza 🏝️"
    assert loaded.description == "Estate ☀️"
    assert loaded.members[0].name == "Giulia 👩‍🚀"
    assert saved.description == "Gelato 🍦"
