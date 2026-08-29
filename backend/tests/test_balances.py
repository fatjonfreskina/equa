from decimal import Decimal

from backend.app.models import Expense, ExpenseSplit, Group, Member
from backend.app.routers.balances import calculate_balances


def make_member(member_id: int, name: str) -> Member:
    return Member(id=member_id, name=name)


def test_balances_minimize_transfers_and_preserve_amounts():
    marco = make_member(1, "Marco")
    giulia = make_member(2, "Giulia")
    luca = make_member(3, "Luca")
    group = Group(members=[marco, giulia, luca])

    dinner = Expense(paid_by_member_id=2, amount=Decimal("230.00"))
    dinner.splits = [
        ExpenseSplit(member_id=1, share_amount=Decimal("76.67")),
        ExpenseSplit(member_id=2, share_amount=Decimal("76.66")),
        ExpenseSplit(member_id=3, share_amount=Decimal("76.67")),
    ]
    group.expenses = [dinner]

    balances = calculate_balances(group)

    assert {(b.from_member_name, b.to_member_name, b.amount) for b in balances} == {
        ("Luca", "Giulia", Decimal("76.67")),
        ("Marco", "Giulia", Decimal("76.67")),
    }
    assert sum(balance.amount for balance in balances) == Decimal("153.34")


def test_balances_are_empty_when_everyone_is_even():
    marco = make_member(1, "Marco")
    giulia = make_member(2, "Giulia")
    group = Group(members=[marco, giulia])

    expense = Expense(paid_by_member_id=1, amount=Decimal("20.00"))
    expense.splits = [
        ExpenseSplit(member_id=1, share_amount=Decimal("10.00")),
        ExpenseSplit(member_id=2, share_amount=Decimal("10.00")),
    ]
    reimbursement = Expense(paid_by_member_id=2, amount=Decimal("10.00"))
    reimbursement.splits = [ExpenseSplit(member_id=1, share_amount=Decimal("10.00"))]
    group.expenses = [expense, reimbursement]

    assert calculate_balances(group) == []
