# Progressive 17-Week Development Roadmap: NLAMS + SNA
**Problem Statement ID:** 26016  
**Dual Objectives:** Layer 1 (National Land Acquisition Platform) + Layer 2 (SNA of Stakeholder Ecosystem)  

---

## 1. Master Development Timeline (Weeks 0 – 17)

```
[WEEK 0] Requirement Analysis, Architecture & Academic Review Mapping
   │
[WEEK 1] Project Foundation (FastAPI, React+TS, PostGIS, Docker Compose)
   │
[WEEK 2] Security, JWT Authentication & Role-Based Access Control (RBAC)
   │
[WEEK 3] Project Management, Statutory Milestones & Synthetic Project Seeding
   │
[WEEK 4] Land Parcels & PostGIS Interactive Geospatial Leaflet Mapping
   │  └──► [REVIEW I PRESENTATION MILESTONE] (Synopsis, Literature, Formulation)
   │
[WEEK 5] 10-Stage Statutory Acquisition Workflow & Organic SNA Event Generation
   │
[WEEK 6] SNA Dataset Architecture, Event Pipeline & Phase 0 Deliverables
   │
[WEEK 7] Preliminary Network Analytics: Degree Distribution & Centralities
   │  └──► [PHASE 1 DELIVERABLE: Preliminary Analysis Report]
   │
[WEEK 8] Interactive SNA Dashboard: Topology Visualization & Working Prototype
   │  └──► [PHASE 1 DELIVERABLE: Working Prototype]
   │
[WEEK 9] Community Detection: Louvain Modularity vs Administrative Hierarchy
   │
[WEEK 10] Network Resilience: Targeted Hub/Bridge Removal & Stress Testing
   │  └──► [REVIEW II PRESENTATION MILESTONE] (Design, Experiments, Testing)
   │
[WEEK 11] Compensation Schedules, Direct Benefit Transfer (DBT) & R&R Registry
   │
[WEEK 12] National Executive Dashboard with Integrated SNA Structural KPIs
   │
[WEEK 13] Machine Learning Delay Prediction: Logistic Regression, Decision Tree & RF
   │
[WEEK 14] SNA + AI Decision Support: Network Topology Features in Risk Models
   │
[WEEK 15] Academic Reporting Suite & Comprehensive Final Analytical Report
   │  └──► [PHASE 2 DELIVERABLE: Final Analytical Report]
   │
[WEEK 16] End-to-End System Testing, API Validation, PostGIS & Graph Verifications
   │
[WEEK 17] Final Demonstration, Codebase Handover & Semester End Evaluation (SEE)
      └──► [FINAL REVIEW / SEE PRESENTATION & 15-STEP LIVE DEMO]
```

---

## 2. Weekly Detailed Breakdown & Execution Plan

### WEEK 0 — Requirement Analysis & Architecture (CURRENT)
- **Objective:** Deep-dive analysis of PS 26016 and SNA instructions; formulate full specifications without prematurely writing application code.
- **Deliverables:** `requirements.md`, `sna-requirements.md`, `architecture.md`, `workflow.md`, `project-roadmap.md`.
- **Quality Gate:** All 26 analytical dimensions completed, reviewed, and approved.

### WEEK 1 — Project Foundation
- **Objective:** Establish the containerized development environment, core API skeleton, frontend shell, and PostGIS database connection.
- **Tasks:**
  - Setup Docker Compose with PostgreSQL 16 + PostGIS 3.4.
  - Initialize FastAPI backend with async database connection, CORS, and `/health` route.
  - Initialize React 18 + TypeScript + Tailwind CSS frontend with dark slate layout.
  - Verify end-to-end communication: Frontend $\to$ Backend $\to$ PostGIS DB.

### WEEK 2 — Authentication & RBAC
- **Objective:** Implement secure identity and access management for multi-tiered government stakeholders.
- **Tasks:**
  - Implement bcrypt password hashing and JWT issuance/validation.
  - Create database tables: `roles`, `users`, `audit_logs`.
  - Seed 8 realistic institutional roles (National Admin, State Officer, CALA, LAO, Requiring Body, R&R Officer, Surveyor, Citizen).
  - Protect frontend routes with role-based navigation guards.

### WEEK 3 — Project Management
- **Objective:** Digital project onboarding and statutory milestone lifecycle tracking.
- **Tasks:**
  - Build CRUD endpoints and interfaces for land acquisition projects.
  - Associate projects with States, Districts, Sponsoring Agencies, and estimated acreage.
  - Implement statutory milestone clock tracking (SIA, Sec 11, Sec 19, Award, Possession).
  - Seed synthetic infrastructure projects (NHAI highway corridors, Railway freight corridors).

### WEEK 4 — Land Parcels & Interactive GIS
- **Objective:** High-performance spatial parcel management using PostGIS and interactive Leaflet maps.
- **Tasks:**
  - Create `land_parcels` table with `GEOMETRY(Polygon, 4326)` and GIST indexing.
  - Implement GeoJSON serialization endpoints with spatial bounding-box filtering (`ST_Intersects`).
  - Render interactive Leaflet map in React with stage-based choropleth fills and click-to-inspect popups.
  - **Milestone:** Conduct Review I Academic Presentation.

### WEEK 5 — Acquisition Workflow Engine
- **Objective:** Enforce the 10-stage statutory state machine and log real-time stakeholder interactions.
- **Tasks:**
  - Implement strict sequential transition logic (Proposal $\to$ Scrutiny $\to$ Approval $\to$ Sec 11 $\to$ Sec 19 $\to$ Award $\to$ Compensation $\to$ Possession $\to$ R&R $\to$ Closure).
  - Build UI stage stepper with action verification modals and statutory document attachment.
  - **Crucial SNA Link:** Every transition triggers an insert into `stakeholder_interactions`.

### WEEK 6 — SNA Data Generation & Dataset Description
- **Objective:** Formalize the stakeholder interaction dataset and preprocessing pipeline.
- **Tasks:**
  - Construct synthetic event generator simulating realistic multi-project administrative exchanges across Indian states.
  - Establish `sna/` repository structure (`data/`, `preprocessing/`, `analysis/`, `visualization/`).
  - **Deliverable:** Produce Phase 0 deliverables: *Project Proposal Document* and *Network Data Description*.

### WEEK 7 — Preliminary SNA Analysis
- **Objective:** NetworkX graph construction and computation of foundational network metrics.
- **Tasks:**
  - Ingest interaction events into directed, weighted NetworkX graph.
  - Compute in-degree, out-degree, degree distributions (log-log histograms).
  - Calculate 4 centralities (Degree, Betweenness, Closeness, Eigenvector) and PageRank.
  - **Deliverable:** Produce Phase 1 deliverable: `preliminary_analysis.md`.

### WEEK 8 — SNA Visualization & Working Prototype
- **Objective:** Dynamic, interactive network visualization dashboard embedded in the web platform.
- **Tasks:**
  - Integrate force-directed network graph in React (node size $\propto$ centrality, edge width $\propto$ frequency).
  - Implement dynamic multi-dimensional filtering (by State, District, Project, Workflow Stage, Date Range).
  - Expose stakeholder centrality leaderboard.
  - **Deliverable:** Working Prototype demo ready for evaluation.

### WEEK 9 — Community Detection
- **Objective:** Algorithmic clustering of the coordination graph and comparison against administrative hierarchy.
- **Tasks:**
  - Implement Louvain modularity optimization and Clauset-Newman-Moore algorithms.
  - Measure Modularity Score ($Q$).
  - Analyze whether detected communities reflect jurisdictional tiers or cross-functional project squads.
  - Visualize community clusters using color-coded graph partitioning.

### WEEK 10 — Network Resilience Analysis
- **Objective:** Stress-testing institutional coordination via simulated node-removal attacks.
- **Tasks:**
  - Implement automated attack models: Targeted Degree Removal, Targeted Betweenness Removal, Random Failure.
  - Track degradation curves: Relative Size of Largest Connected Component ($S_{LCC}$), Number of Components, Global Efficiency ($E_{glob}$).
  - Document vulnerability of the District Collector (CALA) as a single point of failure.
  - **Milestone:** Conduct Review II Academic Presentation.

### WEEK 11 — Compensation & R&R Execution
- **Objective:** Financial compensation disbursal tracking and rehabilitation monitoring.
- **Tasks:**
  - Build statutory compensation calculator (Market Value + 100% Solatium + 12% Additional Interest).
  - Implement Direct Benefit Transfer (DBT) mock payment batch execution.
  - Track Project Affected Families (PAFs) and Displaced Families (PDFs).
  - Link compensation milestones to automatic SNA interaction triggers.

### WEEK 12 — National Executive Dashboard
- **Objective:** Multi-tier executive dashboard providing macro-level governance visibility.
- **Tasks:**
  - Aggregate national metrics: Total Area Notified vs Possessed, Total Compensation Disbursed, Pending Objections.
  - Render state-wise and district-wise comparative progress charts.
  - Integrate real-time SNA structural KPIs (Network Density, Bottleneck Alerts, Modularity Index).

### WEEK 13 — AI-Driven Project Delay Prediction
- **Objective:** Machine Learning classification models to anticipate project delay risks.
- **Tasks:**
  - Build feature engineering pipeline (Acquired Area Ratio, Approval Velocity, Family Displacement Ratio).
  - Train Logistic Regression, Decision Tree, and Random Forest classifiers using Scikit-learn.
  - Evaluate model performance (F1-score, Precision, Recall, Confusion Matrix).
  - Display transparent risk score and primary contributing factors on the project detail view.

### WEEK 14 — SNA + AI Decision Support Synthesis
- **Objective:** Synthesize structural network metrics with predictive delay models.
- **Tasks:**
  - Incorporate stakeholder centrality and network constraint metrics as features in the delay prediction model.
  - Evaluate whether coordination density correlates with reduced administrative delays.
  - Build decision-support advisory cards suggesting targeted staffing for high-betweenness administrative bottlenecks.

### WEEK 15 — Reporting Suite & Academic Deliverables
- **Objective:** Produce comprehensive academic documentation satisfying all course and project rubrics.
- **Tasks:**
  - Generate automated PDF/Markdown executive MIS summary reports.
  - **Deliverable:** Compile Phase 2 *Final Analytical Report* covering all 15 required academic sections.
  - Prepare slide decks and presentation materials for final semester-end evaluation.

### WEEK 16 — Comprehensive Testing & Quality Assurance
- **Objective:** Exhaustive testing across all platform tiers and mathematical validations.
- **Tasks:**
  - Backend integration tests for all REST API endpoints using Pytest.
  - Spatial verification of PostGIS polygon calculations.
  - Mathematical ground-truth testing for NetworkX centrality and resilience algorithms.
  - Frontend cross-browser responsiveness and UI testing.

### WEEK 17 — Final Presentation & Live Demonstration
- **Objective:** Comprehensive end-to-end defense and demonstration for academic and hackathon evaluators.
- **Deliverables:** Final Source Code Repository, SEE Presentation Slides, Live 15-Step Demonstration.

---

## 3. The 15-Step Master Final Demonstration Plan

During the final presentation, the system will be showcased through an unbroken, authentic 15-step narrative walkthrough:

1. **Secure Multi-Role Authentication:** Log in as Central Admin, inspect dashboard, then switch to Requiring Body (NHAI).
2. **Project Requisition Creation:** Submit a new national expressway project with estimated acreage and budget.
3. **Interactive PostGIS Geospatial Mapping:** Open GIS view; inspect digitized cadastral parcels color-coded by acquisition stage.
4. **Spatial Parcel Inspection:** Click on a specific Khasra parcel to inspect ownership, land classification, and valuation details.
5. **Workflow Scrutiny & Sanction:** Transition project through Digital Scrutiny and Administrative Sanction; observe statutory clock.
6. **Statutory Gazette Publication:** Issue Section 11 Preliminary Notification; observe public notice issuance.
7. **Objection Handling:** File and adjudicate a Section 15 objection by affected landowners.
8. **Award Determination & Solatium Calculation:** Generate Section 30 award with automated 100% solatium computation.
9. **Compensation Disbursement:** Execute Aadhaar-linked DBT payment batch for affected beneficiaries.
10. **R&R Census & Allotment:** Verify resettlement colony plot allocations and subsistence allowances for displaced families.
11. **Organic SNA Event Log Verification:** Inspect `stakeholder_interactions` table to confirm that workflow steps organically generated graph edges.
12. **Live SNA Network Visualization:** Open SNA Explorer; inspect force-directed graph with node sizes scaled by Degree Centrality and edge widths by transaction count.
13. **Centrality Leaderboard & Bridge Analysis:** Identify District Collector as highest betweenness bridge; analyze communication sinks.
14. **Interactive Resilience Attack Simulation:** Execute targeted removal of the highest-betweenness node; observe instantaneous network fragmentation and LCC decay.
15. **AI Delay Prediction & Decision Support:** Review project delay risk score generated by Random Forest model and inspect recommended staffing interventions.
