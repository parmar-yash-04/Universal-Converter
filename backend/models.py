from sqlalchemy import Column, Integer, String, DateTime
from database import Base
import datetime

class ConversionLog(Base):
    __tablename__ = "conversion_logs"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    source_format = Column(String)
    target_format = Column(String)
    file_size = Column(Integer)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
