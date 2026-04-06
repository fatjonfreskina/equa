from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
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


@router.delete("/{group_id}", status_code=204)
def delete_group(group_id: str, db: Session = Depends(get_db)):
    db_group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="Gruppo non trovato")
    db.delete(db_group)
    db.commit()