# System Architecture: National Land Acquisition & Management System (NLAMS)
**Version:** 1.0.0 (Week 0 Specification)  
**Standard:** Cloud-Native, Microservices-Ready Monolithic Core with Integrated Graph & ML Engines  
**Technology Stack:** React 18+ (TS) | FastAPI (Python 3.11) | PostgreSQL 16 + PostGIS 3.4 | NetworkX 3.2 | Scikit-learn 1.4  

---

## 1. High-Level System Architecture

The National Land Acquisition & Management System (NLAMS) is structured into two tightly-coupled functional layers:
- **Layer 1: The Transactional Core (Land Acquisition Platform):** Manages statutory workflow state machines, PostGIS cadastral parcels, compensation disbursals, and executive KPIs.
- **Layer 2: The Analytical Intelligence Core (SNA & ML Engines):** Continuously derives coordination graph metrics and predictive delay risk assessments from transactional event logs.

```
                              CLIENT TIER
         ┌──────────────────────────────────────────────────┐
         │          Modern Web & Mobile Browser UI          │
         │   React 18 + TypeScript + Tailwind CSS + Leaflet │
         └────────────────────────┬─────────────────────────┘
                                  │ HTTPS / REST API / GeoJSON
                                  ▼
                              API GATEWAY
         ┌──────────────────────────────────────────────────┐
         │           FastAPI Gateway & Middlewares          │
         │   JWT Verification | RBAC Engine | CORS | Audit  │
         └────────────────────────┬─────────────────────────┘
                                  │
         ┌────────────────────────┴─────────────────────────┐
         │                                                  │
         ▼                                                  ▼
┌────────────────────────────────┐        ┌────────────────────────────────┐
│      LAYER 1 SERVICES          │        │      LAYER 2 ENGINES           │
│  - Project Management Router   │        │  - SNA Graph Construction      │
│  - 10-Stage Workflow Engine    │        │  - NetworkX Centrality Worker  │
│  - PostGIS GIS Spatial Service │        │  - Louvain Community Detection │
│  - Compensation & DBT Engine   │        │  - Resilience Stress Tester    │
│  - Document & Audit Service    │        │  - Scikit-learn Delay Predictor│
└───────────────┬────────────────┘        └────────────────┬───────────────┘
                │                                          │
                │     Event Triggers / Relational Reads    │
                └─────────────────┬────────────────────────┘
                                  │
                                  ▼
                         PERSISTENCE TIER
         ┌──────────────────────────────────────────────────┐
         │           PostgreSQL 16 + PostGIS 3.4            │
         │  - Relational Schemas (Projects, Workflows, R&R) │
         │  - Spatial Geometries (Parcels, Alignments)      │
         │  - Event Log (stakeholder_interactions)          │
         │  - Graph Snapshots & Metric Materializations     │
         └──────────────────────────────────────────────────┘
```

---

## 2. Backend Architecture (FastAPI & Python Ecosystem)

### 2.1 Design Principles
- **Asynchronous I/O:** Built on Starlette and Pydantic v2 for high-throughput, low-latency API serialization.
- **Dependency Injection:** Database sessions (`AsyncSession`), current authenticated users, and permission scopes injected via FastAPI `Depends()`.
- **Stateless Authentication:** Cryptographic JWT tokens containing user ID, role code, state jurisdiction, and district jurisdiction.
- **Modular Routers:** Decoupled functional domains organized under `app/api/v1/`.

### 2.2 Directory Structure
```
backend/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── auth.py             # Login, token refresh, password resets
│   │   │   ├── projects.py         # CRUD, milestones, status tracking
│   │   │   ├── workflow.py         # 10-stage state machine transitions
│   │   │   ├── parcels.py          # PostGIS GeoJSON endpoints, spatial query
│   │   │   ├── compensation.py     # Award calculation, DBT schedules
│   │   │   ├── rr.py               # Rehabilitation & resettlement census
│   │   │   ├── documents.py        # File metadata, hash verification
│   │   │   ├── sna.py              # Network graph, centralities, communities
│   │   │   └── analytics.py        # Executive KPIs, ML delay prediction
│   ├── core/
│   │   ├── config.py           # Pydantic BaseSettings (env vars)
│   │   ├── security.py         # Bcrypt hashing, JWT generation/decoding
│   │   └── rbac.py             # Role checking dependencies
│   ├── db/
│   │   ├── session.py          # SQLAlchemy async engine & session maker
│   │   └── base.py             # Declarative base & metadata
│   ├── models/                 # SQLAlchemy 2.0 ORM models
│   ├── schemas/                # Pydantic validation request/response models
│   ├── services/
│   │   ├── workflow_service.py # Enforces state transitions & writes SNA events
│   │   ├── gis_service.py      # PostGIS spatial calculations & GeoJSON transforms
│   │   ├── sna_service.py      # NetworkX graph mining algorithms
│   │   └── ml_service.py       # Scikit-learn inference pipeline
│   └── main.py                 # FastAPI application factory
├── migrations/                 # Alembic database migrations
├── tests/                      # Pytest unit & integration suites
├── requirements.txt
└── Dockerfile
```

---

## 3. Frontend Architecture (React & TypeScript)

### 3.1 Design Principles & UI Aesthetics
- **Framework:** React 18+ with TypeScript for strict type-safety across API contracts.
- **Styling:** Vanilla CSS with custom Tailwind CSS utility tokens.
- **Aesthetic Palette:** Deep slate dark-mode and curated gov-tech corporate theme (navy `#0F172A`, cyan/accent `#0EA5E9`, emerald `#10B981`, amber `#F59E0B`, ruby `#EF4444`).
- **Interactive Mapping:** Leaflet via `react-leaflet` with custom GeoJSON vector layers, tile caching, and interactive parcel inspection drawers.
- **Visual Analytics:** Interactive charts using Recharts/Plotly and force-directed graph rendering for network topology.

### 3.2 Directory Structure
```
frontend/
├── public/
├── src/
│   ├── assets/                 # Icons, emblems, default map markers
│   ├── components/
│   │   ├── common/             # Buttons, Modals, Tables, Loaders, Badges
│   │   ├── layout/             # Sidebar, Header, Breadcrumbs, UserMenu
│   │   ├── gis/                # LeafletMap, ParcelLayer, LayerControls, Legend
│   │   ├── workflow/           # StageTimeline, ActionModal, ObjectionForm
│   │   ├── sna/                # ForceGraph, CentralityTable, ResilienceSim
│   │   └── dashboard/          # MetricCards, StateChart, DelayRiskGauge
│   ├── context/
│   │   ├── AuthContext.tsx     # Session management, user profile, JWT
│   │   └── ThemeContext.tsx    # Theme provider
│   ├── hooks/                  # Custom React hooks (useProjects, useSNA, useGIS)
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── NationalDashboardPage.tsx
│   │   ├── ProjectsListPage.tsx
│   │   ├── ProjectDetailPage.tsx
│   │   ├── GisMapPage.tsx
│   │   ├── WorkflowTrackerPage.tsx
│   │   ├── CompensationPage.tsx
│   │   ├── SnaExplorerPage.tsx
│   │   └── DelayPredictionPage.tsx
│   ├── services/               # Axios API client instances
│   ├── types/                  # TypeScript interface definitions
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── vite.config.ts
```

---

## 4. GIS & Geospatial Architecture

```
                  ┌────────────────────────────────────────┐
                  │          Leaflet Map Client            │
                  │ - Vector Tile / GeoJSON Rendering      │
                  │ - Interactive Hover & Click Inspectors │
                  │ - Layer Toggle: Cadastral / Satellite  │
                  └───────────────────▲────────────────────┘
                                      │
                         GET /api/v1/parcels/geojson?bbox=...
                                      │
                  ┌───────────────────▼────────────────────┐
                  │           FastAPI GIS Service          │
                  │ - Spatial bbox validation              │
                  │ - ST_AsGeoJSON() serialization         │
                  └───────────────────▲────────────────────┘
                                      │
                         SQL with Spatial Indexes
                                      │
                  ┌───────────────────▼────────────────────┐
                  │        PostgreSQL 16 + PostGIS         │
                  │ - Geometry(Polygon, 4326)              │
                  │ - GIST Index on (geom)                 │
                  │ - ST_Intersects, ST_Area, ST_Centroid  │
                  └────────────────────────────────────────┘
```

### 4.1 Spatial Features
- **SRID:** WGS 84 (`EPSG:4326`) for native compatibility with Leaflet and standard GPS coordinates.
- **Spatial Queries:**
  - Bounding box intersection (`ST_Intersects(geom, ST_MakeEnvelope(...))`) for efficient viewport queries.
  - Project alignment buffering (`ST_Buffer()`) to identify overlapping agricultural parcels.
  - Total acquired area calculation via `ST_Area(geography(geom))`.

---

## 5. Comprehensive Database Design & Schema

NLAMS maintains strict relational integrity across 24 core tables:

```
                            DATABASE ENTITY RELATIONSHIPS
                            
   ┌───────────────┐        ┌───────────────┐        ┌─────────────────────────┐
   │     users     │◄───────┤  user_roles   │        │         states          │
   └───────┬───────┘        └───────────────┘        └────────────┬────────────┘
           │                                                      │ 1
           │ 1                                                    ▼ N
           │                                         ┌─────────────────────────┐
           ▼ N                                       │        districts        │
   ┌───────────────┐                                 └────────────┬────────────┘
   │  audit_logs   │                                              │ 1
   └───────────────┘                                              ▼ N
                                                     ┌─────────────────────────┐
                                      ┌─────────────►│        projects         │◄────────────┐
                                      │              └────────────┬────────────┘             │
                                      │ 1                         │ 1                        │
                                      │                           ▼ N                        │
                         ┌────────────┴────┐         ┌─────────────────────────┐             │
                         │  land_parcels   │         │    project_milestones   │             │
                         └────────────┬────┘         └─────────────────────────┘             │
                                      │ 1                                                    │
                                      ▼ N                                                    │
                         ┌─────────────────┐         ┌─────────────────────────┐             │
                         │affected_families│         │      notifications      │─────────────┤
                         └────────────┬────┘         └─────────────────────────┘             │
                                      │ 1                         ▲                          │
                                      ▼ N                         │                          │
                         ┌─────────────────┐         ┌────────────┴────────────┐             │
                         │  compensation   │◄────────┤         awards          │             │
                         └────────────┬────┘         └─────────────────────────┘             │
                                      │ 1                                                    │
                                      ▼ N                                                    │
                         ┌─────────────────┐         ┌─────────────────────────┐             │
                         │    payments     │         │       possession        │─────────────┤
                         └─────────────────┘         └─────────────────────────┘             │
                                                                  ▲                          │
                                                                  │                          │
   ┌──────────────────────────────────────────────────────────────┴──────────────────────────┴┐
   │                                 WORKFLOW & SNA LAYER                                     │
   ├───────────────────────────────┬───────────────────────────────┬──────────────────────────┤
   │       workflow_actions        │   stakeholder_interactions    │     network_snapshots    │
   ├───────────────────────────────┼───────────────────────────────┼──────────────────────────┤
   │      rehab_resettlement       │        network_metrics        │  community_assignments   │
   ├───────────────────────────────┼───────────────────────────────┼──────────────────────────┤
   │           documents           │            alerts             │  resilience_experiments  │
   └───────────────────────────────┴───────────────────────────────┴──────────────────────────┘
```

### 5.1 Core Database DDL Specification

```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. States & Districts
CREATE TABLE states (
    state_id VARCHAR(10) PRIMARY KEY,
    state_name VARCHAR(100) NOT NULL UNIQUE,
    state_code VARCHAR(5) NOT NULL UNIQUE
);

CREATE TABLE districts (
    district_id VARCHAR(10) PRIMARY KEY,
    state_id VARCHAR(10) REFERENCES states(state_id) ON DELETE RESTRICT,
    district_name VARCHAR(100) NOT NULL,
    census_code VARCHAR(20)
);

-- 2. RBAC & Users
CREATE TABLE roles (
    role_id VARCHAR(30) PRIMARY KEY,
    role_name VARCHAR(60) NOT NULL,
    description TEXT
);

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role_id VARCHAR(30) REFERENCES roles(role_id),
    state_id VARCHAR(10) REFERENCES states(state_id),
    district_id VARCHAR(10) REFERENCES districts(district_id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Projects & Milestones
CREATE TABLE projects (
    project_id VARCHAR(30) PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    project_code VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL, -- Highway, Railway, Energy, Urban
    sponsoring_agency VARCHAR(100) NOT NULL,
    state_id VARCHAR(10) REFERENCES states(state_id),
    district_id VARCHAR(10) REFERENCES districts(district_id),
    estimated_cost_inr NUMERIC(15, 2) NOT NULL,
    total_area_hectares NUMERIC(10, 4) NOT NULL,
    current_stage VARCHAR(30) NOT NULL, -- PROPOSAL to CLOSURE
    delay_risk_status VARCHAR(20) DEFAULT 'LOW',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE project_milestones (
    milestone_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(30) REFERENCES projects(project_id) ON DELETE CASCADE,
    stage_name VARCHAR(50) NOT NULL,
    scheduled_completion_date DATE NOT NULL,
    actual_completion_date DATE,
    status VARCHAR(20) DEFAULT 'PENDING'
);

-- 4. Land Parcels & Spatial Geometry
CREATE TABLE land_parcels (
    parcel_id VARCHAR(40) PRIMARY KEY,
    project_id VARCHAR(30) REFERENCES projects(project_id) ON DELETE CASCADE,
    khasra_survey_number VARCHAR(50) NOT NULL,
    village VARCHAR(100) NOT NULL,
    taluk VARCHAR(100) NOT NULL,
    land_type VARCHAR(50) NOT NULL, -- Agricultural, Barren, Homestead
    total_area_sqm NUMERIC(12, 2) NOT NULL,
    notified_area_sqm NUMERIC(12, 2) NOT NULL,
    acquisition_status VARCHAR(30) NOT NULL, -- NOTIFIED, SURVEYED, AWARDED, POSSESSED
    geom GEOMETRY(Polygon, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_land_parcels_geom ON land_parcels USING GIST (geom);
CREATE INDEX idx_land_parcels_project ON land_parcels (project_id);

-- 5. Affected Families, Awards & Compensation
CREATE TABLE affected_families (
    family_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(30) REFERENCES projects(project_id),
    parcel_id VARCHAR(40) REFERENCES land_parcels(parcel_id),
    head_of_family VARCHAR(150) NOT NULL,
    aadhaar_hash VARCHAR(64),
    vulnerable_category VARCHAR(30), -- General, OBC, SC, ST, BPL
    is_displaced BOOLEAN DEFAULT FALSE,
    bank_account_number VARCHAR(50),
    bank_ifsc VARCHAR(20)
);

CREATE TABLE awards (
    award_id VARCHAR(40) PRIMARY KEY,
    project_id VARCHAR(30) REFERENCES projects(project_id),
    award_number VARCHAR(50) UNIQUE NOT NULL,
    declared_date DATE NOT NULL,
    total_compensation_inr NUMERIC(15, 2) NOT NULL,
    solatium_amount_inr NUMERIC(15, 2) NOT NULL,
    additional_interest_inr NUMERIC(15, 2) NOT NULL,
    approved_by_collector BOOLEAN DEFAULT FALSE
);

CREATE TABLE compensation (
    compensation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    award_id VARCHAR(40) REFERENCES awards(award_id),
    family_id UUID REFERENCES affected_families(family_id),
    land_value_inr NUMERIC(12, 2) NOT NULL,
    structure_value_inr NUMERIC(12, 2) DEFAULT 0.0,
    solatium_inr NUMERIC(12, 2) NOT NULL,
    total_entitlement_inr NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' -- PENDING, SANCTIONED, DISBURSED
);

CREATE TABLE payments (
    payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compensation_id UUID REFERENCES compensation(compensation_id),
    transaction_ref VARCHAR(100) UNIQUE,
    disbursed_amount_inr NUMERIC(12, 2) NOT NULL,
    disbursed_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_mode VARCHAR(30) DEFAULT 'DBT_NEFT',
    status VARCHAR(20) NOT NULL
);

-- 6. Workflow Actions & Organic SNA Interaction Store
CREATE TABLE workflow_actions (
    action_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(30) REFERENCES projects(project_id),
    actor_id UUID REFERENCES users(user_id),
    from_stage VARCHAR(30) NOT NULL,
    to_stage VARCHAR(30) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    remarks TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE stakeholder_interactions (
    interaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    project_id VARCHAR(30) REFERENCES projects(project_id),
    source_stakeholder VARCHAR(60) NOT NULL,
    target_stakeholder VARCHAR(60) NOT NULL,
    interaction_type VARCHAR(50) NOT NULL,
    workflow_stage VARCHAR(40) NOT NULL,
    state VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    duration_hours NUMERIC(8, 2) DEFAULT 24.0
);
CREATE INDEX idx_sna_source ON stakeholder_interactions (source_stakeholder);
CREATE INDEX idx_sna_target ON stakeholder_interactions (target_stakeholder);
CREATE INDEX idx_sna_project ON stakeholder_interactions (project_id);
CREATE INDEX idx_sna_stage ON stakeholder_interactions (workflow_stage);

-- 7. SNA Metric Materializations & Resilience
CREATE TABLE network_snapshots (
    snapshot_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scope_filter VARCHAR(100),
    total_nodes INT NOT NULL,
    total_edges INT NOT NULL,
    density NUMERIC(8, 6),
    diameter INT,
    avg_clustering NUMERIC(8, 6)
);

CREATE TABLE network_metrics (
    metric_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_id UUID REFERENCES network_snapshots(snapshot_id),
    stakeholder_name VARCHAR(60) NOT NULL,
    in_degree INT NOT NULL,
    out_degree INT NOT NULL,
    degree_centrality NUMERIC(8, 6) NOT NULL,
    betweenness_centrality NUMERIC(8, 6) NOT NULL,
    closeness_centrality NUMERIC(8, 6) NOT NULL,
    eigenvector_centrality NUMERIC(8, 6) NOT NULL,
    pagerank NUMERIC(8, 6) NOT NULL
);

CREATE TABLE community_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_id UUID REFERENCES network_snapshots(snapshot_id),
    stakeholder_name VARCHAR(60) NOT NULL,
    community_id INT NOT NULL,
    algorithm VARCHAR(30) NOT NULL
);

CREATE TABLE resilience_experiments (
    experiment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    strategy VARCHAR(50) NOT NULL, -- TARGETED_DEGREE, TARGETED_BETWEENNESS, RANDOM
    removed_fraction NUMERIC(5, 4) NOT NULL,
    removed_node VARCHAR(60),
    lcc_size INT NOT NULL,
    num_components INT NOT NULL,
    efficiency NUMERIC(8, 6) NOT NULL
);
```

---

## 6. Machine Learning Architecture (Project Delay Predictor)

### 6.1 Objective & Problem Formulation
To identify early warning indicators of project delay, classifying projects into three risk classes: `LOW_RISK` (< 3 months delay), `MODERATE_RISK` (3–9 months delay), and `HIGH_RISK` (> 9 months delay).

### 6.2 Feature Vector Formulation
$$\mathbf{x} = \begin{bmatrix}
x_1: \text{Acquired Area Ratio } (\text{Area}_{\text{possessed}} / \text{Area}_{\text{notified}}) \\
x_2: \text{Pending Approval Days } (t_{\text{current}} - t_{\text{submitted}}) \\
x_3: \text{Compensation Disbursement Velocity } (\text{INR}_{\text{paid}} / \text{INR}_{\text{awarded}}) \\
x_4: \text{Displaced Family Ratio } (N_{\text{PDF}} / N_{\text{PAF}}) \\
x_5: \text{Objection Volume } (N_{\text{sec15\_objections}}) \\
x_6: \text{Current Statutory Stage Index } (1 \text{ to } 10) \\
x_7: \text{Historical District Delay Factor } (\mu_{\text{district\_delay}}) \\
x_8: \text{SNA Degree Centrality of CALA Officer } (C_D) \\
x_9: \text{SNA Betweenness Load on District Administration } (C_B)
\end{bmatrix}$$

### 6.3 Model Evaluation & Explainability
- Algorithms: Logistic Regression (baseline), Decision Tree Classifier (transparent rules), and Random Forest Classifier (ensemble benchmark).
- Metrics: Precision, Recall, Macro F1-Score, ROC-AUC.
- Explainability: Expose Gini Feature Importances through the executive dashboard to clearly communicate risk factors.

---

## 7. Containerization & Deployment Architecture

```yaml
# docker-compose.yml specification overview
services:
  db:
    image: postgis/postgis:16-3.4
    environment:
      POSTGRES_DB: nlams_db
      POSTGRES_USER: nlams_admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql+asyncpg://nlams_admin:${DB_PASSWORD}@db:5432/nlams_db
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "8000:8000"
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  pgdata:
```
