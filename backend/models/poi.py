from sqlalchemy import Column, Integer, String, Float, Boolean
from .base import Base

class POI(Base):
    __tablename__ = 'pois'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String, index=True)
    lat = Column(Float, index=True)
    lon = Column(Float, index=True)
    accessibility = Column(Boolean, default=False)
    extra = Column(String, nullable=True)  # For future expansion (JSON, etc.) 