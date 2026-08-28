from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/groups", tags=["groups"])


@router.post("/", response_model=schemas.GroupOut)
def create_group(group: schemas.GroupCreate, db: Session = Depends(get_db)):
    # Crea il gruppo
    db_group = models.Group(
        name=group.name,
        description=group.description,
        currency=group.currency,
    )
    db.add(db_group)
    db.flush()  # per ottenere l'id prima del commit

    # Crea i membri
    for member in group.members:
        db_member = models.Member(
            group_id=db_group.id,
            name=member.name,
            email=member.email,
        )
        db.add(db_member)

    db.commit()
    db.refresh(db_group)
    return db_group


@router.get("/{group_id}", response_model=schemas.GroupOut)
def get_group(group_id: str, db: Session = Depends(get_db)):
    db_group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="Gruppo non trovato")
    return db_group


@router.patch("/{group_id}/status", response_model=schemas.GroupOut)
def update_group_status(
    group_id: str,
    payload: schemas.GroupStatusUpdate,
    db: Session = Depends(get_db),
):
    db_group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="Gruppo non trovato")

    transitions = {
        "active": {"closing"},
        "closing": {"active", "closed"},
        "closed": {"active"},
    }
    if payload.status not in transitions[db_group.status]:
        raise HTTPException(
            status_code=409, detail="Transizione di stato non consentita"
        )

    if payload.status == "closing" and not db_group.expenses:
        raise HTTPException(
            status_code=400,
            detail="Aggiungi almeno una spesa prima di chiudere i conti",
        )

    if payload.status == "closing":
        from .balances import calculate_balances

        db_group.closing_count += 1
        for balance in calculate_balances(db_group):
            db.add(
                models.Settlement(
                    group_id=group_id,
                    from_member_id=balance.from_member_id,
                    to_member_id=balance.to_member_id,
                    amount=balance.amount,
                )
            )

    if payload.status == "active":
        for settlement in db_group.settlements:
            settlement.status = "cancelled"

    if payload.status == "closed":
        has_open_settlements = any(
            settlement.status not in {"confirmed", "cancelled"}
            for settlement in db_group.settlements
        )
        if has_open_settlements:
            raise HTTPException(
                status_code=409,
                detail="Conferma tutti i pagamenti prima di chiudere il gruppo",
            )

    db_group.status = payload.status
    db.commit()
    db.refresh(db_group)
    return db_group


@router.delete("/{group_id}", status_code=204)
def delete_group(group_id: str, db: Session = Depends(get_db)):
    db_group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="Gruppo non trovato")
    db.delete(db_group)
    db.commit()
