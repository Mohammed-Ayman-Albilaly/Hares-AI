from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime

class DepartmentBase(BaseModel):
    name: str

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentRead(DepartmentBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class RoleBase(BaseModel):
    name: str
    permissions: str

class RoleCreate(RoleBase):
    pass

class RoleRead(RoleBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    dept_id: Optional[int] = None
    role_id: int

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: UUID
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class UserAuth(BaseModel):
    email: EmailStr
    password: str
