import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import (
    String,
    Text,
    Boolean,
    Numeric,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class State(Base):
    __tablename__ = "states"

    state_id: Mapped[str] = mapped_column(String(10), primary_key=True)
    state_name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    state_code: Mapped[str] = mapped_column(String(5), unique=True, nullable=False)

    districts: Mapped[list["District"]] = relationship("District", back_populates="state")


class District(Base):
    __tablename__ = "districts"

    district_id: Mapped[str] = mapped_column(String(10), primary_key=True)
    state_id: Mapped[str] = mapped_column(String(10), ForeignKey("states.state_id"), nullable=False)
    district_name: Mapped[str] = mapped_column(String(100), nullable=False)
    census_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    state: Mapped["State"] = relationship("State", back_populates="districts")


class Role(Base):
    __tablename__ = "roles"

    role_id: Mapped[str] = mapped_column(String(30), primary_key=True)
    role_name: Mapped[str] = mapped_column(String(60), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class User(Base, TimestampMixin):
    __tablename__ = "users"

    user_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    role_id: Mapped[str] = mapped_column(String(30), ForeignKey("roles.role_id"), nullable=False)
    state_id: Mapped[Optional[str]] = mapped_column(String(10), ForeignKey("states.state_id"), nullable=True)
    district_id: Mapped[Optional[str]] = mapped_column(String(10), ForeignKey("districts.district_id"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    project_id: Mapped[str] = mapped_column(String(30), primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255), nullable=False)
    project_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)  # Highway, Railway, Energy, Urban
    sponsoring_agency: Mapped[str] = mapped_column(String(100), nullable=False)
    state_id: Mapped[Optional[str]] = mapped_column(String(10), ForeignKey("states.state_id"), nullable=True)
    district_id: Mapped[Optional[str]] = mapped_column(String(10), ForeignKey("districts.district_id"), nullable=True)
    estimated_cost_inr: Mapped[float] = mapped_column(Numeric(15, 2), default=0.0)
    total_area_hectares: Mapped[float] = mapped_column(Numeric(10, 4), default=0.0)
    current_stage: Mapped[str] = mapped_column(String(30), default="STAGE_PROPOSAL")
    delay_risk_status: Mapped[str] = mapped_column(String(20), default="LOW")


class LandParcel(Base, TimestampMixin):
    __tablename__ = "land_parcels"

    parcel_id: Mapped[str] = mapped_column(String(40), primary_key=True)
    project_id: Mapped[str] = mapped_column(String(30), ForeignKey("projects.project_id"), nullable=False, index=True)
    khasra_survey_number: Mapped[str] = mapped_column(String(50), nullable=False)
    village: Mapped[str] = mapped_column(String(100), nullable=False)
    taluk: Mapped[str] = mapped_column(String(100), nullable=False)
    land_type: Mapped[str] = mapped_column(String(50), nullable=False)
    total_area_sqm: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    notified_area_sqm: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    acquisition_status: Mapped[str] = mapped_column(String(30), default="NOTIFIED")
    geojson_geometry: Mapped[str] = mapped_column(Text, nullable=False)  # GeoJSON string for cross-database spatial compatibility


class StakeholderInteraction(Base):
    __tablename__ = "stakeholder_interactions"

    interaction_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    project_id: Mapped[str] = mapped_column(String(30), ForeignKey("projects.project_id"), nullable=False, index=True)
    source_stakeholder: Mapped[str] = mapped_column(String(60), nullable=False, index=True)
    target_stakeholder: Mapped[str] = mapped_column(String(60), nullable=False, index=True)
    interaction_type: Mapped[str] = mapped_column(String(50), nullable=False)
    workflow_stage: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(50), nullable=False)
    district: Mapped[str] = mapped_column(String(50), nullable=False)
    duration_hours: Mapped[float] = mapped_column(Numeric(8, 2), default=24.0)
