import pytest_asyncio
from app.db.base import Base
from app.db.session import engine
from app.main import seed_initial_foundation


@pytest_asyncio.fixture(autouse=True)
async def setup_test_database():
    """Initializes schema and baseline seed records before test executions."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_initial_foundation()
    yield
