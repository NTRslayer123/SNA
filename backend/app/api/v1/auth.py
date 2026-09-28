from typing import List, Optional
from pydantic import BaseModel, EmailStr, ConfigDict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.security import verify_password, create_access_token
from app.core.rbac import get_current_active_user
from app.db.session import get_db
from app.models.base import User, Role

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: str
    email: str
    full_name: str
    role_id: str
    state_id: Optional[str]
    district_id: Optional[str]
    is_active: bool


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_minutes: int
    user: UserProfileResponse


class RoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    role_id: str
    role_name: str
    description: Optional[str]


class DemoUserResponse(BaseModel):
    email: str
    full_name: str
    role_id: str
    role_name: str
    description: str


@router.post("/login", response_model=TokenResponse, summary="Statutory Stakeholder Login")
async def login(
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """Authenticates statutory stakeholder with email and password, returning a signed JWT access token."""
    user = await db.scalar(select(User).where(User.email == credentials.email.lower()))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )

    # Generate JWT with custom RBAC claims
    token = create_access_token(
        subject=user.user_id,
        extra_claims={
            "email": user.email,
            "role": user.role_id,
            "state_id": user.state_id,
            "district_id": user.district_id,
        }
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        user=UserProfileResponse.model_validate(user),
    )


@router.get("/me", response_model=UserProfileResponse, summary="Get Current Authenticated Stakeholder")
async def get_my_profile(
    current_user: User = Depends(get_current_active_user)
):
    """Retrieves profile and institutional role for the currently authenticated bearer token."""
    return UserProfileResponse.model_validate(current_user)


@router.get("/roles", response_model=List[RoleResponse], summary="List Institutional Roles")
async def list_roles(
    db: AsyncSession = Depends(get_db)
):
    """Returns all 8 statutory institutional roles defined across Central, State, District, and Citizen tiers."""
    roles = await db.scalars(select(Role))
    return [RoleResponse.model_validate(r) for r in roles]


@router.get("/demo-users", response_model=List[DemoUserResponse], summary="List Demo Stakeholder Credentials")
async def list_demo_users(
    db: AsyncSession = Depends(get_db)
):
    """Returns seeded demo users across all 8 roles for rapid review testing (default password: nlams@password2026)."""
    users = await db.scalars(select(User))
    roles_map = {r.role_id: r for r in await db.scalars(select(Role))}
    
    result = []
    for u in users:
        role = roles_map.get(u.role_id)
        result.append(DemoUserResponse(
            email=u.email,
            full_name=u.full_name,
            role_id=u.role_id,
            role_name=role.role_name if role else u.role_id,
            description=role.description if role and role.description else "",
        ))
    return result
