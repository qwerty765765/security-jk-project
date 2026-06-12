from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import schemas, models, auth as auth_utils
from app.database import get_db

router = APIRouter(prefix="/api/incidents", tags=["security incidents"])

@router.post("/", response_model=schemas.SecurityIncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(
    incident_data: schemas.SecurityIncidentCreate,
    current_user: models.User = Depends(auth_utils.get_current_active_user),
    db: Session = Depends(get_db)
):
    db_incident = models.SecurityIncident(
        **incident_data.dict(),
        reported_by=current_user.id
    )
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    return db_incident

@router.get("/", response_model=List[schemas.SecurityIncidentResponse])
def get_incidents(
    skip: int = 0,
    limit: int = 10,
    severity: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_active_user)
):
    query = db.query(models.SecurityIncident)
    if severity:
        query = query.filter(models.SecurityIncident.severity == severity)
    incidents = query.order_by(models.SecurityIncident.created_at.desc()).offset(skip).limit(limit).all()
    return incidents

@router.delete("/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_incident(
    incident_id: int,
    current_user: models.User = Depends(auth_utils.get_current_admin_user),
    db: Session = Depends(get_db)
):
    incident = db.query(models.SecurityIncident).filter(models.SecurityIncident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    db.delete(incident)
    db.commit()
    return None
