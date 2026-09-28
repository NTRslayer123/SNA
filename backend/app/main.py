from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, func
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
            await session.flush()

        # Seed additional reference States & Districts for multi-state synthetic infrastructure corridors
        states_to_seed = [
            ("KA", "Karnataka", "29"),
            ("MH", "Maharashtra", "27"),
            ("HR", "Haryana", "06"),
            ("UP", "Uttar Pradesh", "09"),
            ("TN", "Tamil Nadu", "33"),
        ]
        for st_id, st_name, st_code in states_to_seed:
            exists = await session.get(State, st_id)
            if not exists:
                session.add(State(state_id=st_id, state_name=st_name, state_code=st_code))
        await session.flush()

        districts_to_seed = [
            ("KA-BLRU", "KA", "Bengaluru Urban", "572"),
            ("KA-TUM", "KA", "Tumakuru", "557"),
            ("MH-MUM", "MH", "Mumbai Suburban", "518"),
            ("MH-THN", "MH", "Thane", "517"),
            ("HR-GGN", "HR", "Gurugram", "086"),
            ("UP-LKO", "UP", "Lucknow", "157"),
            ("TN-CHN", "TN", "Chennai", "603"),
        ]
        for dst_id, st_id, dst_name, c_code in districts_to_seed:
            exists = await session.get(District, dst_id)
            if not exists:
                session.add(District(district_id=dst_id, state_id=st_id, district_name=dst_name, census_code=c_code))
        await session.flush()

        # Synthetic Infrastructure Projects (Week 3 Requirement)
        from datetime import datetime, timezone, timedelta
        from app.models.base import ProjectMilestone
        from app.api.v1.projects import generate_default_milestones

        synthetic_projects = [
            {
                "project_id": "PRJ-NHAI-2026-001",
                "project_name": "Bengaluru-Mysuru Expressway Expansion (Phase II)",
                "project_code": "NHAI/KA/BNG-MYS/02",
                "category": "Highway",
                "sponsoring_agency": "National Highways Authority of India (NHAI)",
                "state_id": "KA",
                "district_id": "KA-BLRU",
                "estimated_cost_inr": 14500000000.00,
                "total_area_hectares": 342.50,
                "current_stage": "STAGE_SEC11_NOTIF",
                "delay_risk_status": "LOW",
                "created_days_ago": 120,
            },
            {
                "project_id": "PRJ-DFCC-2026-002",
                "project_name": "Western Dedicated Freight Corridor (Vadodara-JNPT Feeder)",
                "project_code": "DFCCIL/MH/WDFC-FEEDER/04",
                "category": "Railway",
                "sponsoring_agency": "Dedicated Freight Corridor Corporation (DFCCIL)",
                "state_id": "MH",
                "district_id": "MH-MUM",
                "estimated_cost_inr": 38900000000.00,
                "total_area_hectares": 520.80,
                "current_stage": "STAGE_AWARD",
                "delay_risk_status": "MEDIUM",
                "created_days_ago": 280,
            },
            {
                "project_id": "PRJ-NHAI-2026-003",
                "project_name": "Delhi-Mumbai Expressway Greenfield Link (Sohna-Dausa Spur)",
                "project_code": "NHAI/HR/DME-SPUR/01",
                "category": "Highway",
                "sponsoring_agency": "National Highways Authority of India (NHAI)",
                "state_id": "HR",
                "district_id": "HR-GGN",
                "estimated_cost_inr": 56000000000.00,
                "total_area_hectares": 780.20,
                "current_stage": "STAGE_COMPENSATION",
                "delay_risk_status": "LOW",
                "created_days_ago": 340,
            },
            {
                "project_id": "PRJ-NTPC-2026-004",
                "project_name": "Ultra-Mega Solar Renewable Energy Park (Pavagada Expansion)",
                "project_code": "NTPC/KA/SOLAR-PVG/03",
                "category": "Energy",
                "sponsoring_agency": "NTPC Renewable Energy Ltd",
                "state_id": "KA",
                "district_id": "KA-TUM",
                "estimated_cost_inr": 24000000000.00,
                "total_area_hectares": 1250.00,
                "current_stage": "STAGE_POSSESSION",
                "delay_risk_status": "LOW",
                "created_days_ago": 410,
            },
            {
                "project_id": "PRJ-BMRC-2026-005",
                "project_name": "Bengaluru Namma Metro Airport Blue Line Corridor",
                "project_code": "BMRCL/KA/METRO-BLUE/2B",
                "category": "Urban Transit",
                "sponsoring_agency": "Bangalore Metro Rail Corporation (BMRCL)",
                "state_id": "KA",
                "district_id": "KA-BLRU",
                "estimated_cost_inr": 19800000000.00,
                "total_area_hectares": 85.40,
                "current_stage": "STAGE_RR_EXECUTION",
                "delay_risk_status": "HIGH",
                "created_days_ago": 490,
            },
            {
                "project_id": "PRJ-UPEX-2026-006",
                "project_name": "Ganga Expressway Strategic Corridor (Meerut-Prayagraj)",
                "project_code": "UPEIDA/UP/GNGA-EXP/01",
                "category": "Highway",
                "sponsoring_agency": "State Public Works Department (PWD)",
                "state_id": "UP",
                "district_id": "UP-LKO",
                "estimated_cost_inr": 92000000000.00,
                "total_area_hectares": 1650.00,
                "current_stage": "STAGE_SCRUTINY",
                "delay_risk_status": "MEDIUM",
                "created_days_ago": 45,
            },
        ]

        now = datetime.now(timezone.utc)

        for p_data in synthetic_projects:
            existing_p = await session.get(Project, p_data["project_id"])
            if not existing_p:
                created_dt = now - timedelta(days=p_data["created_days_ago"])
                p = Project(
                    project_id=p_data["project_id"],
                    project_name=p_data["project_name"],
                    project_code=p_data["project_code"],
                    category=p_data["category"],
                    sponsoring_agency=p_data["sponsoring_agency"],
                    state_id=p_data["state_id"],
                    district_id=p_data["district_id"],
                    estimated_cost_inr=p_data["estimated_cost_inr"],
                    total_area_hectares=p_data["total_area_hectares"],
                    current_stage=p_data["current_stage"],
                    delay_risk_status=p_data["delay_risk_status"],
                )
                session.add(p)
                await session.flush()

                # Generate 10 statutory milestones
                milestones = generate_default_milestones(
                    p_data["project_id"],
                    start_date=created_dt,
                    current_stage=p_data["current_stage"]
                )
                session.add_all(milestones)

                # Organic initial SNA event
                inter = StakeholderInteraction(
                    project_id=p_data["project_id"],
                    source_stakeholder=p_data["sponsoring_agency"].replace(" ", "_").upper()[:50],
                    target_stakeholder="DISTRICT_COLLECTOR_CALA",
                    interaction_type="REQUISITION_SUBMISSION",
                    workflow_stage="STAGE_PROPOSAL",
                    state=p_data["state_id"],
                    district=p_data["district_id"],
                    duration_hours=18.0,
                )
                session.add(inter)
            else:
                # Check if existing project has milestones
                ms_count = await session.scalar(
                    select(func.count(ProjectMilestone.milestone_id)).where(ProjectMilestone.project_id == p_data["project_id"])
                )
                if not ms_count:
                    created_dt = now - timedelta(days=p_data["created_days_ago"])
                    milestones = generate_default_milestones(
                        p_data["project_id"],
                        start_date=created_dt,
                        current_stage=existing_p.current_stage
                    )
                    session.add_all(milestones)

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
