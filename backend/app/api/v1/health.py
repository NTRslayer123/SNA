from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy import text, select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.db.session import get_db
from app.models.base import Project, LandParcel, StakeholderInteraction

router = APIRouter(tags=["Health & Diagnostics"])


@router.get("/health", summary="Health & Database Connectivity Check")
async def health_check(db: AsyncSession = Depends(get_db)):
    """Verifies backend API operational status and executes an active probe to the database engine."""
    db_status = "disconnected"
    db_error = None
    counts = {"projects": 0, "parcels": 0, "stakeholder_interactions": 0}

    try:
        # Probe DB connectivity
        result = await db.execute(text("SELECT 1"))
        probe_val = result.scalar()
        if probe_val == 1:
            db_status = "connected"

        # Count records if tables exist
        try:
            p_cnt = await db.scalar(select(func.count()).select_from(Project))
            counts["projects"] = p_cnt or 0

            lp_cnt = await db.scalar(select(func.count()).select_from(LandParcel))
            counts["parcels"] = lp_cnt or 0

            si_cnt = await db.scalar(select(func.count()).select_from(StakeholderInteraction))
            counts["stakeholder_interactions"] = si_cnt or 0
        except Exception:
            # Tables might not be initialized yet in early probe
            pass

    except Exception as e:
        db_status = "error"
        db_error = str(e)

    payload = {
        "status": "healthy" if db_status == "connected" else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": {
            "status": db_status,
            "engine": "postgresql" if "postgresql" in settings.DATABASE_URL else "sqlite",
            "error": db_error,
        },
        "statistics": counts,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    status_code = status.HTTP_200_OK if db_status == "connected" else status.HTTP_503_SERVICE_UNAVAILABLE
    return JSONResponse(status_code=status_code, content=payload)


@router.get("/system/info", summary="System Information & Layer Status")
async def system_info(db: AsyncSession = Depends(get_db)):
    """Provides high-level architectural metadata for Layer 1 and Layer 2."""
    return {
        "system": "National Land Acquisition & Management System (NLAMS)",
        "department": "Department of Land Resources (DoLR), Ministry of Rural Development",
        "problem_statement_id": "26016",
        "layers": {
            "layer_1_land_acquisition": {
                "name": "National Land Acquisition System",
                "status": "active",
                "subsystems": ["Projects", "Workflow Engine", "PostGIS GIS", "Compensation", "R&R"]
            },
            "layer_2_sna": {
                "name": "Social Network Analysis of Stakeholder Ecosystem",
                "status": "active",
                "subsystems": ["NetworkX Pipeline", "Centrality Engine", "Community Detection", "Resilience Analysis"]
            }
        },
        "statutory_act": "RFCTLARR Act, 2013",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
