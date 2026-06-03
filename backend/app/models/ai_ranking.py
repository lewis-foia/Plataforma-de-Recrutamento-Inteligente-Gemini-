import uuid
from sqlalchemy import Column, ForeignKey, Float, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.models.base import Base

class AIRanking(Base):
    __tablename__ = "ai_rankings"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), unique=True, nullable=False)
    compatibility_score = Column(Float, nullable=False)
    justification = Column(Text(), nullable=True)
    raw_response = Column(JSONB(), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    application = relationship("Application", back_populates="ai_ranking")
