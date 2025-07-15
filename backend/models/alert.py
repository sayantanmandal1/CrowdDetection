from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from .base import Base

class Alert(Base):
    __tablename__ = 'alerts'
    id = Column(Integer, primary_key=True, index=True)
    poi_id = Column(Integer, ForeignKey('pois.id'))
    level = Column(String, index=True)  # e.g., LOW, MEDIUM, HIGH
    message = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now()) 