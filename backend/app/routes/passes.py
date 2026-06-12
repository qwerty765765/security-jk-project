from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import schemas, models, auth as auth_utils
from app.database import get_db

router = APIRouter(prefix="/api/passes", tags=["access passes"])

@router.post("/", response_model=schemas.AccessPassResponse, status_code=status.HTTP_201_CREATED)
def create_pass(
    pass_data: schemas.AccessPassCreate,
    current_user: models.User = Depends(auth_utils.get_current_active_user),
    db: Session = Depends(get_db)
):
    db_pass = models.AccessPass(
        **pass_data.dict(),
        user_id=current_user.id
    )
    db.add(db_pass)
    db.commit()
    db.refresh(db_pass)
    return db_pass

@router.get("/", response_model=List[schemas.AccessPassResponse])
def get_my_passes(
    skip: int = 0,
    limit: int = 10,
    current_user: models.User = Depends(auth_utils.get_current_active_user),
    db: Session = Depends(get_db)
):
    passes = db.query(models.AccessPass).filter(
        models.AccessPass.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return passes

@router.get("/all", response_model=List[schemas.AccessPassResponse])
def get_all_passes(
    skip: int = 0,
    limit: int = 10,
    current_user: models.User = Depends(auth_utils.get_current_admin_user),
    db: Session = Depends(get_db)
):
    passes = db.query(models.AccessPass).offset(skip).limit(limit).all()
    return passes

@router.put("/{pass_id}", response_model=schemas.AccessPassResponse)
def update_pass_status(
    pass_id: int,
    update_data: schemas.AccessPassUpdate,
    current_user: models.User = Depends(auth_utils.get_current_admin_user),
    db: Session = Depends(get_db)
):
    db_pass = db.query(models.AccessPass).filter(models.AccessPass.id == pass_id).first()
    if not db_pass:
        raise HTTPException(status_code=404, detail="Pass not found")
    
    db_pass.status = update_data.status
    db.commit()
    db.refresh(db_pass)
    return db_pass

@router.delete("/{pass_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pass(
    pass_id: int,
    current_user: models.User = Depends(auth_utils.get_current_active_user),
    db: Session = Depends(get_db)
):
    db_pass = db.query(models.AccessPass).filter(models.AccessPass.id == pass_id).first()
    if not db_pass:
        raise HTTPException(status_code=404, detail="Pass not found")
    
    if db_pass.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db.delete(db_pass)
    db.commit()
    return None
