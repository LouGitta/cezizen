from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel
from datetime import datetime

class Role(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    label: str = Field(unique=True)

    # Relationship: One role has many users
    users: List["User"] = Relationship(back_populates="role")

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    role_id: Optional[int] = Field(default=None, foreign_key="role.id")
    
    role: Optional[Role] = Relationship(back_populates="users")

class UserCreate(SQLModel):
    email: str
    password: str 
    role_id: int

class UserLogin(SQLModel):
    email: str
    password: str 

class Token(SQLModel):
    access_token: str
    token_type: str