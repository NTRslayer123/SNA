from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine, AsyncSessionLocal
from app.models.base import State, District, Role, User, Project, StakeholderInteraction
from app.api.v1 import api_router


async def seed_initial_foundation():
    """Seeds baseline reference states, districts, and demo project if database is freshly initialized."""
    async with AsyncSessionLocal() as session:
        # Check if roles and users exist
        existing_role = await session.scalar(select(Role).limit(1))
        if not existing_role:
            # Seed reference State and District
            karnataka = State(state_id="KA", state_name="Karnataka", state_code="29")
            session.add(karnataka)
            await session.flush()

            bengaluru = District(district_id="KA-BLRU", state_id="KA", district_name="Bengaluru Urban", census_code="572")
            session.add(bengaluru)

            # Seed all 8 statutory roles per requirements.md & architecture.md
            roles_to_seed = [
                Role(role_id="ROLE_NATIONAL_ADMIN", role_name="National Administrator", description="MoRD / DoLR Central Oversight"),
                Role(role_id="ROLE_STATE_OFFICER", role_name="State Nodal Officer", description="State Revenue Department Sanctions"),
                Role(role_id="ROLE_CALA_COLLECTOR", role_name="Competent Authority (District Collector)", description="Statutory Land Acquisition Head & Award Sanction"),
                Role(role_id="ROLE_LAO", role_name="Land Acquisition Officer (SDM)", description="Claims Scrutiny, JMS Supervision & Award Inquiry"),
                Role(role_id="ROLE_REQUIRING_BODY", role_name="Land Requiring Body (NHAI/Railways)", description="Project Sponsoring Agency & Requisitioner"),
                Role(role_id="ROLE_RR_OFFICER", role_name="R&R Commissioner", description="Rehabilitation & Resettlement Schemes"),
                Role(role_id="ROLE_FIELD_SURVEYOR", role_name="Field Surveyor / Amin", description="Cadastral Geo-tagging & Field Ground-truthing"),
                Role(role_id="ROLE_CITIZEN", role_name="Project Affected Landowner / Public", description="Section 15 Objection Filing & Compensation Claims"),
            ]
            session.add_all(roles_to_seed)
            await session.flush()

            # Seed demo users for each of the 8 roles
            from app.core.security import get_password_hash
            default_hashed_pwd = get_password_hash("nlams@password2026")

            demo_users = [
                User(
                    email="admin@nlams.gov.in",
                    hashed_password=default_hashed_pwd,
                    full_name="Dr. Rajeshwar Sharma, IAS",
                    role_id="ROLE_NATIONAL_ADMIN",
                    state_id="KA",
                    district_id="KA-BLRU",
                    is_active=True,
                ),
                User(
                    email="state.revenue@karnataka.gov.in",
                    hashed_password=default_hashed_pwd,
                    full_name="Smt. Vandana Rao, IAS (Principal Secy)",
                    role_id="ROLE_STATE_OFFICER",
                    state_id="KA",
                    district_id="KA-BLRU",
                    is_active=True,
                ),
                User(
                    email="collector.bengaluru@nlams.gov.in",
                    hashed_password=default_hashed_pwd,
                    full_name="Shri K. Dayananda, IAS (District Collector)",
                    role_id="ROLE_CALA_COLLECTOR",
                    state_id="KA",
                    district_id="KA-BLRU",
                    is_active=True,
                ),
                User(
                    email="lao.bengaluru@nlams.gov.in",
                    hashed_password=default_hashed_pwd,
                    full_name="Shri Manjunath K. (Special LAO)",
                    role_id="ROLE_LAO",
                    state_id="KA",
                    district_id="KA-BLRU",
                    is_active=True,
                ),
                User(
                    email="nhai.officer@nhai.gov.in",
                    hashed_password=default_hashed_pwd,
                    full_name="Col. Arvind Deshmukh (Project Director NHAI)",
                    role_id="ROLE_REQUIRING_BODY",
                    state_id="KA",
                    district_id="KA-BLRU",
                    is_active=True,
                ),
                User(
                    email="rr.officer@nlams.gov.in",
                    hashed_password=default_hashed_pwd,
                    full_name="Smt. Geeta Patil (R&R Commissioner)",
                    role_id="ROLE_RR_OFFICER",
                    state_id="KA",
                    district_id="KA-BLRU",
                    is_active=True,
                ),
                User(
                    email="surveyor.amin@nlams.gov.in",
                    hashed_password=default_hashed_pwd,
                    full_name="Ramesh Kumar (Taluk Revenue Inspector)",
                    role_id="ROLE_FIELD_SURVEYOR",
                    state_id="KA",
                    district_id="KA-BLRU",
                    is_active=True,
                ),
                User(
                    email="citizen.owner@nlams.gov.in",
                    hashed_password=default_hashed_pwd,
                    full_name="Basavarajappa H. (Landowner, Survey No. 44)",
                    role_id="ROLE_CITIZEN",
                    state_id="KA",
                    district_id="KA-BLRU",
                    is_active=True,
                ),
            ]
            session.add_all(demo_users)

            # Seed foundation Demo Project
            demo_project = Project(
                project_id="PRJ-NHAI-2026-001",
                project_name="Bengaluru-Mysuru Expressway Expansion (Phase II)",
                project_code="NHAI/KA/BNG-MYS/02",
                category="Highway",
                sponsoring_agency="National Highways Authority of India (NHAI)",
                state_id="KA",
                district_id="KA-BLRU",
                estimated_cost_inr=1450000000.00,
                total_area_hectares=342.50,
                current_stage="STAGE_SEC11_NOTIF",
                delay_risk_status="LOW"
            )
            session.add(demo_project)

            # Seed initial organic workflow event
            initial_interaction = StakeholderInteraction(
                project_id="PRJ-NHAI-2026-001",
                source_stakeholder="LAND_REQUIRING_BODY_NHAI",
                target_stakeholder="DISTRICT_COLLECTOR_BENGALURU",
                interaction_type="REQUISITION_SUBMISSION",
                workflow_stage="STAGE_PROPOSAL",
                state="Karnataka",
                district="Bengaluru Urban",
                duration_hours=12.0
            )
            session.add(initial_interaction)

            await session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Seed baseline foundation
    await seed_initial_foundation()
    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for National Land Acquisition & Management System (Problem Statement 26016) and SNA Mini Project",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
async def root():
    return {
        "title": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
