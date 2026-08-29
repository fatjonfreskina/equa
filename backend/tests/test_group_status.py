from decimal import Decimal

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.database import Base
from backend.app.models import Expense, ExpenseSplit, Group, Member
from backend.app.routers.groups import update_group_status
from backend.app.schemas import GroupStatusUpdate


def test_closing_count_increments_for_each_closing_cycle():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()

    try:
        giulia = Member(name="Giulia")
        marco = Member(name="Marco")
        group = Group(name="Weekend", currency="EUR", members=[giulia, marco])
        expense = Expense(
            description="Cena",
            amount=Decimal("40.00"),
            paid_by=giulia,
            splits=[
                ExpenseSplit(member=giulia, share_amount=Decimal("20.00")),
                ExpenseSplit(member=marco, share_amount=Decimal("20.00")),
            ],
        )
        group.expenses.append(expense)
        session.add(group)
        session.commit()

        first_closing = update_group_status(
            group.id, GroupStatusUpdate(status="closing"), session
        )
        assert first_closing.closing_count == 1

        update_group_status(group.id, GroupStatusUpdate(status="active"), session)
        second_closing = update_group_status(
            group.id, GroupStatusUpdate(status="closing"), session
        )
        assert second_closing.closing_count == 2
    finally:
        session.close()
        engine.dispose()
