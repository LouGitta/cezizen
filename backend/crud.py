from sqlmodel import Session
from . import models, utils


def create_user(db: Session, user: models.UserCreate):
    hashed_password = utils.get_password_hash(user.password)
    
    db_user = models.User(
        email=user.email,
        password_hash=hashed_password,
        role_id=user.role_id
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users(db: Session):
    return db.query(models.User).all()

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()