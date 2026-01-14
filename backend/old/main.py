from fastapi import FastAPI, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from fastapi.middleware.cors import CORSMiddleware

from . import crud, models,utils
from .database import create_db_and_tables, get_session

create_db_and_tables()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/roles/", response_model=models.Role)
def create_role(role: models.Role, db: Session = Depends(get_session)):
    db.add(role)
    db.commit()
    db.refresh(role)
    return role

@app.post("/users/", response_model=models.User)
def create_user(user: models.UserCreate, db: Session = Depends(get_session)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    return crud.create_user(db=db, user=user)

@app.get("/users/", response_model=List[models.User])
def read_users(db: Session = Depends(get_session)):
    db_users = crud.get_users(db)
    return db_users

@app.get("/users/{user_id}", response_model=models.User)
def read_user(user_id: int, db: Session = Depends(get_session)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.post("/login/", response_model=models.Token)
def login_user(user: models.UserLogin, db: Session = Depends(get_session)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user == None:
        raise HTTPException(status_code=400, detail="Login informations incorrect")
    
    verified_user = utils.verify_password(user.password, db_user.password_hash)
    if verified_user == False:
        raise HTTPException(status_code=400, detail="Login informations incorrect")

    token = utils.create_access_token({"email": db_user.email, "role": db_user.role_id})

    return {"access_token": token, "token_type": "bearer"}