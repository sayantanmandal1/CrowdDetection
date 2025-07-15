from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime, String
from sqlalchemy.sql import func
from .base import Base

class Route(Base):
    __tablename__ = 'routes'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    start_lat = Column(Float)
    start_lon = Column(Float)
    end_lat = Column(Float)
    end_lon = Column(Float)
    path = Column(String)  # Store as JSON string (list of [lat, lon])
    created_at = Column(DateTime(timezone=True), server_default=func.now()) 