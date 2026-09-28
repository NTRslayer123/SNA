import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_list_roles():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/auth/roles")
        assert response.status_code == 200
        roles = response.json()
        assert len(roles) >= 8
        role_ids = [r["role_id"] for r in roles]
        assert "ROLE_NATIONAL_ADMIN" in role_ids
        assert "ROLE_CALA_COLLECTOR" in role_ids
        assert "ROLE_REQUIRING_BODY" in role_ids
        assert "ROLE_CITIZEN" in role_ids


@pytest.mark.asyncio
async def test_login_success():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/auth/login",
            json={
                "email": "admin@nlams.gov.in",
                "password": "nlams@password2026",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "admin@nlams.gov.in"
        assert data["user"]["role_id"] == "ROLE_NATIONAL_ADMIN"


@pytest.mark.asyncio
async def test_login_invalid_password():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/auth/login",
            json={
                "email": "admin@nlams.gov.in",
                "password": "wrong_password_attempt",
            },
        )
        assert response.status_code == 401
        assert "Invalid email or password" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_current_user_profile():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # First login as Collector
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={
                "email": "collector.bengaluru@nlams.gov.in",
                "password": "nlams@password2026",
            },
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]

        # Call /me with Bearer token
        me_res = await ac.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert me_res.status_code == 200
        profile = me_res.json()
        assert profile["email"] == "collector.bengaluru@nlams.gov.in"
        assert profile["role_id"] == "ROLE_CALA_COLLECTOR"


@pytest.mark.asyncio
async def test_get_current_user_unauthorized():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/auth/me")
        assert response.status_code == 401


@pytest.mark.asyncio
async def test_demo_users_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/auth/demo-users")
        assert response.status_code == 200
        demo_users = response.json()
        assert len(demo_users) >= 8
