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
    designation: Optional[str] = None
    phone_number: Optional[str] = None
    role_id: str
    state_id: Optional[str] = None
    district_id: Optional[str] = None
    is_active: bool


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    designation: Optional[str] = None
    phone_number: Optional[str] = None
    state_id: Optional[str] = None
    district_id: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None


class DetailedProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: str
    email: str
    full_name: str
    designation: Optional[str] = None
    phone_number: Optional[str] = None
    role_id: str
    role_name: Optional[str] = None
    role_description: Optional[str] = None
    state_id: Optional[str] = None
    district_id: Optional[str] = None
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


@router.get("/profile", response_model=DetailedProfileResponse, summary="Get Full Private Profile")
async def get_full_profile(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Returns detailed private profile including role description and contact details."""
    role = await db.scalar(select(Role).where(Role.role_id == current_user.role_id))
    return DetailedProfileResponse(
        user_id=current_user.user_id,
        email=current_user.email,
        full_name=current_user.full_name,
        designation=current_user.designation or (role.role_name if role else ""),
        phone_number=current_user.phone_number or "+91 98765 43210",
        role_id=current_user.role_id,
        role_name=role.role_name if role else current_user.role_id,
        role_description=role.description if role else "",
        state_id=current_user.state_id,
        district_id=current_user.district_id,
        is_active=current_user.is_active,
    )


@router.put("/profile", response_model=DetailedProfileResponse, summary="Update Private Profile & Password")
async def update_profile(
    update_data: ProfileUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Allows authenticated stakeholders to update personal details, designation, phone number, and password."""
    # Update basic profile fields
    if update_data.full_name is not None and update_data.full_name.strip():
        current_user.full_name = update_data.full_name.strip()
    if update_data.designation is not None:
        current_user.designation = update_data.designation.strip()
    if update_data.phone_number is not None:
        current_user.phone_number = update_data.phone_number.strip()
    if update_data.state_id is not None:
        current_user.state_id = update_data.state_id.strip()
    if update_data.district_id is not None:
        current_user.district_id = update_data.district_id.strip()

    # Password update
    if update_data.new_password:
        if not update_data.current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is required to set a new password."
            )
        if not verify_password(update_data.current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password verification failed."
            )
        if len(update_data.new_password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be at least 6 characters long."
            )
        from app.core.security import get_password_hash
        current_user.hashed_password = get_password_hash(update_data.new_password)

    await db.commit()
    await db.refresh(current_user)

    role = await db.scalar(select(Role).where(Role.role_id == current_user.role_id))
    return DetailedProfileResponse(
        user_id=current_user.user_id,
        email=current_user.email,
        full_name=current_user.full_name,
        designation=current_user.designation or (role.role_name if role else ""),
        phone_number=current_user.phone_number or "+91 98765 43210",
        role_id=current_user.role_id,
        role_name=role.role_name if role else current_user.role_id,
        role_description=role.description if role else "",
        state_id=current_user.state_id,
        district_id=current_user.district_id,
        is_active=current_user.is_active,
    )


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
