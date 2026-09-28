from datetime import datetime, timezone, timedelta
from typing import Optional, List
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy import select, func, desc, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.base import Project, ProjectMilestone, StakeholderInteraction, State, District, User
from app.core.rbac import get_current_user

router = APIRouter(prefix="/projects", tags=["Project Management (Layer 1)"])

# 10 Statutory Stages and SLAs per RFCTLARR Act 2013 & workflow.md
STATUTORY_STAGES_METADATA = [
    {
        "stage_id": "STAGE_PROPOSAL",
        "stage_order": 1,
        "title": "Requisition Submission & DPR Alignment",
        "sla_days": 30,
        "role_permitted": "ROLE_REQUIRING_BODY",
        "interaction_type": "REQUISITION_SUBMISSION",
    },
    {
        "stage_id": "STAGE_SCRUTINY",
        "stage_order": 2,
        "title": "Revenue Records & Cadastral Scrutiny",
        "sla_days": 45,
        "role_permitted": "ROLE_LAO",
        "interaction_type": "SCRUTINY_CLEARANCE",
    },
    {
        "stage_id": "STAGE_APPROVAL",
        "stage_order": 3,
        "title": "Administrative Sanction & SIA Recommendation",
        "sla_days": 30,
        "role_permitted": "ROLE_STATE_OFFICER",
        "interaction_type": "ADMIN_SANCTION",
    },
    {
        "stage_id": "STAGE_SEC11_NOTIF",
        "stage_order": 4,
        "title": "Section 11 Preliminary Notification (Gazette)",
        "sla_days": 60,
        "role_permitted": "ROLE_CALA_COLLECTOR",
        "interaction_type": "GAZETTE_PUBLICATION",
    },
    {
        "stage_id": "STAGE_SEC19_DECL",
        "stage_order": 5,
        "title": "Section 19 Final Acquisition Declaration",
        "sla_days": 365,
        "role_permitted": "ROLE_STATE_OFFICER",
        "interaction_type": "DECLARATION_SEC19",
    },
    {
        "stage_id": "STAGE_AWARD",
        "stage_order": 6,
        "title": "Section 23/30 Award Determination & Solatium",
        "sla_days": 180,
        "role_permitted": "ROLE_CALA_COLLECTOR",
        "interaction_type": "AWARD_DECLARATION",
    },
    {
        "stage_id": "STAGE_COMPENSATION",
        "stage_order": 7,
        "title": "Compensation Disbursal & DBT Execution",
        "sla_days": 90,
        "role_permitted": "ROLE_CALA_COLLECTOR",
        "interaction_type": "COMPENSATION_DISBURSED",
    },
    {
        "stage_id": "STAGE_POSSESSION",
        "stage_order": 8,
        "title": "Section 38 Physical Possession Takeover",
        "sla_days": 60,
        "role_permitted": "ROLE_CALA_COLLECTOR",
        "interaction_type": "POSSESSION_HANDOVER",
    },
    {
        "stage_id": "STAGE_RR_EXECUTION",
        "stage_order": 9,
        "title": "R&R Resettlement Colony & Family Rehabilitation",
        "sla_days": 180,
        "role_permitted": "ROLE_RR_OFFICER",
        "interaction_type": "RR_COMPLETION_REPORT",
    },
    {
        "stage_id": "STAGE_CLOSURE",
        "stage_order": 10,
        "title": "Cadastral RoR Mutation & Final Handover",
        "sla_days": 30,
        "role_permitted": "ROLE_STATE_OFFICER",
        "interaction_type": "FINAL_CLOSURE_ORDER",
    },
]


def generate_default_milestones(project_id: str, start_date: datetime, current_stage: str = "STAGE_PROPOSAL") -> list[ProjectMilestone]:
    """Generates standard 10 statutory milestones with calculated target dates and statuses based on current_stage."""
    milestones = []
    accumulated_days = 0
    current_stage_idx = 0
    for idx, stage in enumerate(STATUTORY_STAGES_METADATA):
        if stage["stage_id"] == current_stage:
            current_stage_idx = idx
            break

    for idx, meta in enumerate(STATUTORY_STAGES_METADATA):
        accumulated_days += meta["sla_days"]
        target_dt = start_date + timedelta(days=accumulated_days)

        if idx < current_stage_idx:
            status_val = "COMPLETED"
            comp_dt = start_date + timedelta(days=accumulated_days - 5)
        elif idx == current_stage_idx:
            status_val = "IN_PROGRESS"
            comp_dt = None
        else:
            status_val = "PENDING"
            comp_dt = None

        m = ProjectMilestone(
            milestone_id=str(uuid.uuid4()),
            project_id=project_id,
            stage_id=meta["stage_id"],
            stage_order=meta["stage_order"],
            title=meta["title"],
            statutory_sla_days=meta["sla_days"],
            target_date=target_dt,
            completed_date=comp_dt,
            status=status_val,
            remarks=f"Statutory deadline binding per RFCTLARR Act (SLA: {meta['sla_days']} days)",
        )
        milestones.append(m)

    return milestones


# Pydantic Schemas
class MilestoneOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    milestone_id: str
    stage_id: str
    stage_order: int
    title: str
    statutory_sla_days: int
    target_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    status: str
    remarks: Optional[str] = None


class InteractionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    interaction_id: str
    timestamp: datetime
    source_stakeholder: str
    target_stakeholder: str
    interaction_type: str
    workflow_stage: str
    state: str
    district: str
    duration_hours: float


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    project_id: str
    project_name: str
    project_code: str
    category: str
    sponsoring_agency: str
    state_id: Optional[str] = None
    district_id: Optional[str] = None
    estimated_cost_inr: float
    total_area_hectares: float
    current_stage: str
    delay_risk_status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # Aggregated metrics
    milestones_total: int = 10
    milestones_completed: int = 0
    progress_percentage: int = 0
    active_milestone_title: Optional[str] = None
    active_milestone_target: Optional[datetime] = None


class ProjectDetailOut(ProjectOut):
    milestones: List[MilestoneOut] = []
    recent_interactions: List[InteractionOut] = []


class ProjectCreateRequest(BaseModel):
    project_name: str = Field(..., min_length=5, max_length=255)
    project_code: str = Field(..., min_length=3, max_length=50)
    category: str = Field("Highway", max_length=50)
    sponsoring_agency: str = Field(..., min_length=2, max_length=100)
    state_id: str = Field(..., min_length=2, max_length=10)
    district_id: str = Field(..., min_length=2, max_length=20)
    estimated_cost_inr: float = Field(..., gt=0)
    total_area_hectares: float = Field(..., gt=0)
    initial_stage: str = Field("STAGE_PROPOSAL")


class ProjectUpdateRequest(BaseModel):
    project_name: Optional[str] = None
    category: Optional[str] = None
    sponsoring_agency: Optional[str] = None
    estimated_cost_inr: Optional[float] = None
    total_area_hectares: Optional[float] = None
    delay_risk_status: Optional[str] = None


class StageTransitionRequest(BaseModel):
    next_stage: str = Field(..., description="Target statutory stage (e.g. STAGE_SCRUTINY)")
    action_note: Optional[str] = Field("Statutory stage transitioned via digital portal")


class ProjectStatisticsOut(BaseModel):
    total_projects: int
    total_area_hectares: float
    total_estimated_cost_inr: float
    total_estimated_cost_cr: float
    stage_breakdown: dict
    category_breakdown: dict
    risk_breakdown: dict


# Endpoints
@router.get("/categories", response_model=List[str])
async def list_project_categories():
    """Returns available infrastructure project categories."""
    return [
        "Highway",
        "Railway",
        "Energy",
        "Urban Transit",
        "Port & Shipping",
        "Industrial Corridor",
        "Irrigation & Water",
    ]


@router.get("/agencies", response_model=List[str])
async def list_sponsoring_agencies():
    """Returns official sponsoring infrastructure agencies."""
    return [
        "National Highways Authority of India (NHAI)",
        "Dedicated Freight Corridor Corporation (DFCCIL)",
        "Indian Railways (Ministry of Railways)",
        "NTPC Renewable Energy Ltd",
        "Bangalore Metro Rail Corporation (BMRCL)",
        "Delhi Metro Rail Corporation (DMRC)",
        "National Industrial Corridor Development Corp (NICDC)",
        "State Public Works Department (PWD)",
        "Jawaharlal Nehru Port Trust (JNPT)",
    ]


@router.get("/statistics", response_model=ProjectStatisticsOut)
async def get_project_statistics(db: AsyncSession = Depends(get_db)):
    """Computes high-level macro statistics across all land acquisition projects."""
    result = await db.execute(select(Project))
    projects = result.scalars().all()

    total_projects = len(projects)
    total_area = sum(float(p.total_area_hectares or 0.0) for p in projects)
    total_cost = sum(float(p.estimated_cost_inr or 0.0) for p in projects)

    stage_counts: dict[str, int] = {}
    category_counts: dict[str, int] = {}
    risk_counts: dict[str, int] = {}

    for p in projects:
        stage_counts[p.current_stage] = stage_counts.get(p.current_stage, 0) + 1
        category_counts[p.category] = category_counts.get(p.category, 0) + 1
        risk_counts[p.delay_risk_status] = risk_counts.get(p.delay_risk_status, 0) + 1

    return ProjectStatisticsOut(
        total_projects=total_projects,
        total_area_hectares=round(total_area, 2),
        total_estimated_cost_inr=round(total_cost, 2),
        total_estimated_cost_cr=round(total_cost / 10000000.0, 2),
        stage_breakdown=stage_counts,
        category_breakdown=category_counts,
        risk_breakdown=risk_counts,
    )


@router.get("", response_model=List[ProjectOut])
async def list_projects(
    state_id: Optional[str] = Query(None, description="Filter by State code (e.g. KA)"),
    district_id: Optional[str] = Query(None, description="Filter by District code"),
    category: Optional[str] = Query(None, description="Filter by category (Highway, Railway, etc.)"),
    stage: Optional[str] = Query(None, description="Filter by statutory stage"),
    risk_status: Optional[str] = Query(None, description="Filter by delay risk status"),
    search: Optional[str] = Query(None, description="Search by project name or code"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves paginated projects matching search and statutory filters."""
    query = select(Project).options(selectinload(Project.milestones)).order_by(desc(Project.created_at))

    if state_id:
        query = query.where(Project.state_id == state_id)
    if district_id:
        query = query.where(Project.district_id == district_id)
    if category:
        query = query.where(Project.category == category)
    if stage:
        query = query.where(Project.current_stage == stage)
    if risk_status:
        query = query.where(Project.delay_risk_status == risk_status)
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            or_(
                Project.project_name.ilike(search_filter),
                Project.project_code.ilike(search_filter),
                Project.sponsoring_agency.ilike(search_filter),
            )
        )

    result = await db.execute(query)
    projects = result.scalars().all()

    output = []
    for p in projects:
        milestones = p.milestones or []
        completed = sum(1 for m in milestones if m.status == "COMPLETED")
        active_m = next((m for m in milestones if m.stage_id == p.current_stage), None)
        pct = int((completed / len(milestones) * 100)) if milestones else 10

        item = ProjectOut(
            project_id=p.project_id,
            project_name=p.project_name,
            project_code=p.project_code,
            category=p.category,
            sponsoring_agency=p.sponsoring_agency,
            state_id=p.state_id,
            district_id=p.district_id,
            estimated_cost_inr=float(p.estimated_cost_inr or 0.0),
            total_area_hectares=float(p.total_area_hectares or 0.0),
            current_stage=p.current_stage,
            delay_risk_status=p.delay_risk_status,
            created_at=p.created_at,
            updated_at=p.updated_at,
            milestones_total=len(milestones),
            milestones_completed=completed,
            progress_percentage=pct,
            active_milestone_title=active_m.title if active_m else None,
            active_milestone_target=active_m.target_date if active_m else None,
        )
        output.append(item)

    return output


@router.get("/{project_id}", response_model=ProjectDetailOut)
async def get_project_detail(project_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieves full details of a specific project, including statutory milestones and recent audit interactions."""
    query = (
        select(Project)
        .options(selectinload(Project.milestones))
        .where(Project.project_id == project_id)
    )
    result = await db.execute(query)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID '{project_id}' not found.",
        )

    # Fetch recent interactions
    int_query = (
        select(StakeholderInteraction)
        .where(StakeholderInteraction.project_id == project_id)
        .order_by(desc(StakeholderInteraction.timestamp))
        .limit(15)
    )
    int_res = await db.execute(int_query)
    interactions = int_res.scalars().all()

    milestones = project.milestones or []
    completed = sum(1 for m in milestones if m.status == "COMPLETED")
    active_m = next((m for m in milestones if m.stage_id == project.current_stage), None)
    pct = int((completed / len(milestones) * 100)) if milestones else 10

    return ProjectDetailOut(
        project_id=project.project_id,
        project_name=project.project_name,
        project_code=project.project_code,
        category=project.category,
        sponsoring_agency=project.sponsoring_agency,
        state_id=project.state_id,
        district_id=project.district_id,
        estimated_cost_inr=float(project.estimated_cost_inr or 0.0),
        total_area_hectares=float(project.total_area_hectares or 0.0),
        current_stage=project.current_stage,
        delay_risk_status=project.delay_risk_status,
        created_at=project.created_at,
        updated_at=project.updated_at,
        milestones_total=len(milestones),
        milestones_completed=completed,
        progress_percentage=pct,
        active_milestone_title=active_m.title if active_m else None,
        active_milestone_target=active_m.target_date if active_m else None,
        milestones=[MilestoneOut.model_validate(m) for m in milestones],
        recent_interactions=[InteractionOut.model_validate(i) for i in interactions],
    )


@router.post("", response_model=ProjectDetailOut, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Submits a new statutory Land Requisition (Proposal stage).
    - Automatically builds all 10 statutory milestones.
    - Atomically emits the initial REQUISITION_SUBMISSION event into the SNA interaction log!
    """
    # Check project code uniqueness
    existing = await db.execute(select(Project).where(Project.project_code == data.project_code))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Project Code '{data.project_code}' already exists. Please specify a unique code.",
        )

    project_id = f"PRJ-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc)

    new_project = Project(
        project_id=project_id,
        project_name=data.project_name,
        project_code=data.project_code,
        category=data.category,
        sponsoring_agency=data.sponsoring_agency,
        state_id=data.state_id,
        district_id=data.district_id,
        estimated_cost_inr=data.estimated_cost_inr,
        total_area_hectares=data.total_area_hectares,
        current_stage=data.initial_stage,
        delay_risk_status="LOW",
    )
    db.add(new_project)
    await db.flush()

    # Create 10 statutory milestones
    milestones = generate_default_milestones(project_id, now, current_stage=data.initial_stage)
    db.add_all(milestones)

    # Organically emit SNA Interaction Event
    initial_event = StakeholderInteraction(
        interaction_id=str(uuid.uuid4()),
        timestamp=now,
        project_id=project_id,
        source_stakeholder=data.sponsoring_agency.replace(" ", "_").upper(),
        target_stakeholder="DISTRICT_COLLECTOR_CALA",
        interaction_type="REQUISITION_SUBMISSION",
        workflow_stage=data.initial_stage,
        state=data.state_id,
        district=data.district_id,
        duration_hours=24.0,
    )
    db.add(initial_event)

    await db.commit()

    return await get_project_detail(project_id, db)


@router.put("/{project_id}", response_model=ProjectDetailOut)
async def update_project(
    project_id: str,
    data: ProjectUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Updates core project metadata."""
    query = select(Project).where(Project.project_id == project_id)
    res = await db.execute(query)
    project = res.scalar_one_or_none()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID '{project_id}' not found.",
        )

    if data.project_name is not None:
        project.project_name = data.project_name
    if data.category is not None:
        project.category = data.category
    if data.sponsoring_agency is not None:
        project.sponsoring_agency = data.sponsoring_agency
    if data.estimated_cost_inr is not None:
        project.estimated_cost_inr = data.estimated_cost_inr
    if data.total_area_hectares is not None:
        project.total_area_hectares = data.total_area_hectares
    if data.delay_risk_status is not None:
        project.delay_risk_status = data.delay_risk_status

    await db.commit()
    return await get_project_detail(project_id, db)


@router.patch("/{project_id}/stage", response_model=ProjectDetailOut)
async def advance_project_stage(
    project_id: str,
    data: StageTransitionRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Transitions a project to the next statutory stage.
    - Updates milestone statuses (marks previous as COMPLETED, next as IN_PROGRESS).
    - Organically records an interaction event in the SNA table.
    """
    query = (
        select(Project)
        .options(selectinload(Project.milestones))
        .where(Project.project_id == project_id)
    )
    res = await db.execute(query)
    project = res.scalar_one_or_none()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project '{project_id}' not found.",
        )

    valid_stage_ids = [s["stage_id"] for s in STATUTORY_STAGES_METADATA]
    if data.next_stage not in valid_stage_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid stage '{data.next_stage}'. Valid stages are: {valid_stage_ids}",
        )

    old_stage = project.current_stage
    project.current_stage = data.next_stage
    now = datetime.now(timezone.utc)

    # Update milestones
    next_stage_order = next(
        (s["stage_order"] for s in STATUTORY_STAGES_METADATA if s["stage_id"] == data.next_stage),
        1
    )

    for m in project.milestones:
        if m.stage_order < next_stage_order:
            m.status = "COMPLETED"
            if not m.completed_date:
                m.completed_date = now
        elif m.stage_order == next_stage_order:
            m.status = "IN_PROGRESS"
        else:
            m.status = "PENDING"

    # Emit organic SNA interaction event
    stage_meta = next((s for s in STATUTORY_STAGES_METADATA if s["stage_id"] == data.next_stage), None)
    int_type = stage_meta["interaction_type"] if stage_meta else "STAGE_TRANSITION"

    event = StakeholderInteraction(
        interaction_id=str(uuid.uuid4()),
        timestamp=now,
        project_id=project_id,
        source_stakeholder=f"AUTHORITY_{project.current_stage}",
        target_stakeholder="DISTRICT_OFFICE",
        interaction_type=int_type,
        workflow_stage=data.next_stage,
        state=project.state_id or "KA",
        district=project.district_id or "KA-BLRU",
        duration_hours=48.0,
    )
    db.add(event)

    await db.commit()
    return await get_project_detail(project_id, db)
