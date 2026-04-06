from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/groups/{group_id}/balances", tags=["balances"])


def calculate_balances(group: models.Group) -> List[schemas.Balance]:
    # Calcola quanto ogni membro ha pagato e quanto deve
    net = {m.id: Decimal("0") for m in group.members}
    member_names = {m.id: m.name for m in group.members}

    for expense in group.expenses:
        # Chi ha pagato riceve credito
        net[expense.paid_by_member_id] += expense.amount
        # Ogni split è un debito
        for split in expense.splits:
            net[split.member_id] -= split.share_amount

    # Algoritmo greedy: minimizza il numero di transazioni
    creditors = [(mid, amt) for mid, amt in net.items() if amt > 0]
    debtors = [(mid, -amt) for mid, amt in net.items() if amt < 0]

    creditors.sort(key=lambda x: x[1], reverse=True)
    debtors.sort(key=lambda x: x[1], reverse=True)

    transactions = []
    i, j = 0, 0
    while i < len(creditors) and j < len(debtors):
        cred_id, cred_amt = creditors[i]
        debt_id, debt_amt = debtors[j]

        amount = min(cred_amt, debt_amt)
        transactions.append(schemas.Balance(
            from_member_id=debt_id,
            from_member_name=member_names[debt_id],
            to_member_id=cred_id,
            to_member_name=member_names[cred_id],
            amount=round(amount, 2),
        ))

        creditors[i] = (cred_id, cred_amt - amount)
        debtors[j] = (debt_id, debt_amt - amount)

        if creditors[i][1] < Decimal("0.01"):
            i += 1
        if debtors[j][1] < Decimal("0.01"):
            j += 1

    return transactions


@router.get("/", response_model=List[schemas.Balance])
def get_balances(group_id: str, db: Session = Depends(get_db)):
    db_group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="Gruppo non trovato")
    return calculate_balances(db_group)