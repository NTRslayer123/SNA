import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_list_projects_and_categories():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Check categories
        cat_res = await client.get("/api/v1/projects/categories")
        assert cat_res.status_code == 200
        cats = cat_res.json()
        assert "Highway" in cats
        assert "Railway" in cats
        assert "Energy" in cats

        # Check agencies
        agency_res = await client.get("/api/v1/projects/agencies")
        assert agency_res.status_code == 200
        agencies = agency_res.json()
        assert any("NHAI" in a for a in agencies)

        # List all projects
        list_res = await client.get("/api/v1/projects")
        assert list_res.status_code == 200
        projects = list_res.json()
        assert len(projects) >= 1
        first = projects[0]
        assert "project_id" in first
        assert "project_code" in first
        assert "milestones_total" in first
        assert first["milestones_total"] == 10
        assert "progress_percentage" in first


@pytest.mark.asyncio
async def test_project_statistics():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/projects/statistics")
        assert res.status_code == 200
        stats = res.json()
        assert "total_projects" in stats
        assert stats["total_projects"] >= 1
        assert "total_area_hectares" in stats
        assert stats["total_area_hectares"] > 0
        assert "total_estimated_cost_cr" in stats
        assert "stage_breakdown" in stats
        assert "category_breakdown" in stats


@pytest.mark.asyncio
async def test_project_detail_and_milestones():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Fetch list to get a valid project_id
        list_res = await client.get("/api/v1/projects")
        projects = list_res.json()
        p_id = projects[0]["project_id"]

        detail_res = await client.get(f"/api/v1/projects/{p_id}")
        assert detail_res.status_code == 200
        detail = detail_res.json()
        assert detail["project_id"] == p_id
        assert len(detail["milestones"]) == 10
        assert detail["milestones"][0]["stage_id"] == "STAGE_PROPOSAL"
        assert detail["milestones"][0]["statutory_sla_days"] == 30
        assert "recent_interactions" in detail


@pytest.mark.asyncio
async def test_create_project_and_stage_transition():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        import uuid
        unique_code = f"TEST/CORR/{uuid.uuid4().hex[:6].upper()}"

        create_payload = {
            "project_name": "Kashmir Railway Connectivity Spur (Baramulla-Uri)",
            "project_code": unique_code,
            "category": "Railway",
            "sponsoring_agency": "Indian Railways (Ministry of Railways)",
            "state_id": "JK",
            "district_id": "JK-BAR",
            "estimated_cost_inr": 28500000000.0,
            "total_area_hectares": 412.50,
            "initial_stage": "STAGE_PROPOSAL"
        }

        res = await client.post("/api/v1/projects", json=create_payload)
        assert res.status_code == 201
        created = res.json()
        p_id = created["project_id"]
        assert created["project_code"] == unique_code
        assert len(created["milestones"]) == 10
        assert created["current_stage"] == "STAGE_PROPOSAL"
        assert created["milestones"][0]["status"] == "IN_PROGRESS"

        # Check that organic interaction was logged
        assert len(created["recent_interactions"]) >= 1
        assert created["recent_interactions"][0]["interaction_type"] == "REQUISITION_SUBMISSION"

        # Advance stage to STAGE_SCRUTINY
        adv_res = await client.patch(
            f"/api/v1/projects/{p_id}/stage",
            json={"next_stage": "STAGE_SCRUTINY", "action_note": "Joint revenue scrutiny initiated"}
        )
        assert adv_res.status_code == 200
        updated = adv_res.json()
        assert updated["current_stage"] == "STAGE_SCRUTINY"
        assert updated["milestones"][0]["status"] == "COMPLETED"
        assert updated["milestones"][1]["status"] == "IN_PROGRESS"

        # Duplicate code should fail
        dup_res = await client.post("/api/v1/projects", json=create_payload)
        assert dup_res.status_code == 400
