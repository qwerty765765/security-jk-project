from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    apartment_number: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class AccessPassBase(BaseModel):
    visitor_name: str
    purpose: Optional[str] = None
    date_from: date
    date_to: date

class AccessPassCreate(AccessPassBase):
    pass

class AccessPassResponse(AccessPassBase):
    id: int
    status: str
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class AccessPassUpdate(BaseModel):
    status: str

class SecurityIncidentBase(BaseModel):
    title: str
    description: Optional[str] = None
    severity: str = "medium"
    location: Optional[str] = None

class SecurityIncidentCreate(SecurityIncidentBase):
    pass

class SecurityIncidentResponse(SecurityIncidentBase):
    id: int
    reported_by: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
