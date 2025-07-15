from sqlalchemy import Column, Integer, String, Float, Boolean
from .base import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    home_lat = Column(Float, nullable=True)
    home_lon = Column(Float, nullable=True)
    is_admin = Column(Boolean, default=False) 