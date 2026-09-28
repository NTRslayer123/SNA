from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine, AsyncSessionLocal
from app.models.base import State, District, Role, Project, StakeholderInteraction
from app.api.v1 import api_router


async def seed_initial_foundation():
    """Seeds baseline reference states, districts, and demo project if database is freshly initialized."""
    async with AsyncSessionLocal() as session:
        # Check if states exist
        existing_state = await session.scalar(select(State).limit(1))
        if not existing_state:
            # Seed reference State and District
            karnataka = State(state_id="KA", state_name="Karnataka", state_code="29")
            session.add(karnataka)
            await session.flush()

            bengaluru = District(district_id="KA-BLRU", state_id="KA", district_name="Bengaluru Urban", census_code="572")
            session.add(bengaluru)

            # Seed base Roles
            admin_role = Role(role_id="ROLE_NATIONAL_ADMIN", role_name="National Administrator", description="MoRD / DoLR Central Oversight")
            cala_role = Role(role_id="ROLE_CALA_COLLECTOR", role_name="Competent Authority (District Collector)", description="Statutory Land Acquisition Head")
            req_role = Role(role_id="ROLE_REQUIRING_BODY", role_name="Land Requiring Body (NHAI/Railways)", description="Project Sponsoring Agency")
            session.add_all([admin_role, cala_role, req_role])

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
