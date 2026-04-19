from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
from .. import models
from ..database import get_db

router = APIRouter(prefix="/groups/{group_id}/members", tags=["members"])


@router.delete("/{member_id}", status_code=204)
def delete_member(group_id: str, member_id: int, db: Session = Depends(get_db)):
    db_group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="Gruppo non trovato")

    member = db.query(models.Member).filter(
        models.Member.id == member_id,
        models.Member.group_id == group_id
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Membro non trovato")

    # Controlla se il membro è pagante in qualche spesa
    as_payer = db.query(models.Expense).filter(
        models.Expense.paid_by_member_id == member_id,
        models.Expense.group_id == group_id
    ).first()
    if as_payer:
        raise HTTPException(
            status_code=400,
            detail="Impossibile eliminare: il membro ha pagato una o più spese"
        )

    # Controlla se il membro è coinvolto in qualche split
    in_split = db.query(models.ExpenseSplit).join(models.Expense).filter(
        models.ExpenseSplit.member_id == member_id,
        models.Expense.group_id == group_id
    ).first()
    if in_split:
        raise HTTPException(
            status_code=400,
            detail="Impossibile eliminare: il membro è coinvolto in una o più spese"
        )

    db.delete(member)
    db.commit()