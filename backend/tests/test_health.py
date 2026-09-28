import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_root_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"
        assert "health" in data


@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["database"]["status"] == "connected"
        assert "statistics" in data
        assert "projects" in data["statistics"]


@pytest.mark.asyncio
async def test_system_info_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/system/info")
        assert response.status_code == 200
        data = response.json()
        assert data["problem_statement_id"] == "26016"
        assert "layer_1_land_acquisition" in data["layers"]
        assert "layer_2_sna" in data["layers"]


@pytest.mark.asyncio
async def test_preset_jurisdictions_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/system/jurisdictions")
        assert response.status_code == 200
        jurisdictions = response.json()
        assert len(jurisdictions) >= 15
        state_ids = [s["state_id"] for s in jurisdictions]
        assert "KA" in state_ids
        assert "MH" in state_ids
        assert "DL" in state_ids
        assert "NAT" in state_ids

        # Check Karnataka districts
        ka_state = next(s for s in jurisdictions if s["state_id"] == "KA")
        ka_district_ids = [d["district_id"] for d in ka_state["districts"]]
        assert "KA-BLRU" in ka_district_ids
        assert "KA-MYS" in ka_district_ids

