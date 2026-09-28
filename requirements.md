# Requirements Specification: National Land Acquisition & Management System (NLAMS)
**Problem Statement ID:** 26016  
**Ministry:** Ministry of Rural Development (MoRD)  
**Department:** Department of Land Resources (DoLR)  
**Category:** Software  
**Theme:** Smart Automation  
**Sub-Theme:** AI, GIS & Data Analytics for Public Administration and Infrastructure Management  

---

## 1. Problem Statement Analysis & Context

### 1.1 Background & Domain Context
Land acquisition in India is a critical prerequisite for national infrastructure initiatives—including Bharatmala highways, Dedicated Freight Corridors (DFCs), renewable energy parks, urban development, and irrigation projects. The statutory process is governed primarily by the **Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (RFCTLARR Act 2013)** alongside state-specific enactments and sector-specific acts (e.g., National Highways Act 1956, Railways Act 1989).

### 1.2 Current Operational Deficiencies (As-Is State)
1. **Fragmented and Isolated Systems:** Land records, revenue courts, cadastral maps, and project management portals operate in departmental silos without horizontal or vertical interoperability.
2. **Manual and Opaque Workflows:** Inter-agency correspondence (proposals, SIA reports, draft notifications, joint measurement surveys) relies on physical files, leading to unaccountable procedural delays.
3. **Absence of Real-Time Geospatial Verification:** Acquired plots and alignment corridors lack automated GIS-based overlay with digitized cadastral/revenue maps, leading to boundary disputes and duplicate notifications.
4. **Compensation Disbursement Bottlenecks:** Manual reconciliation between bank disbursals, revenue awards, and land possession records often delays compensation and triggers litigation.
5. **Inadequate R&R Monitoring:** Rehabilitation and Resettlement (R&R) entitlements for Project Affected Families (PAFs) and Displaced Families (PDFs) are tracked asynchronously, hindering post-possession welfare delivery.
6. **Lack of Executive Decision Support:** Administrators lack predictive intelligence regarding project delay likelihood, pipeline bottlenecks, and multi-agency coordination frictions.

### 1.3 Expected Solution (To-Be State)
A unified, web-based, cloud-native national platform that digitizes the entire lifecycle—from project requisition to final cadastral mutation and project closure—incorporating:
- Standardized multi-tier digital workflows across Central, State, and District administrations.
- PostGIS-powered geospatial cadastral mapping and interactive Leaflet visualization.
- Automated statutory milestone tracking, notification engines, and SLA escalations.
- Direct Benefit Transfer (DBT) and compensation reconciliation mechanisms.
- Embedded Social Network Analysis (SNA) derived from live workflow interactions to detect coordination bottlenecks and assess institutional resilience.
- Machine Learning models for empirical project delay prediction.

---

## 2. Requirement Categorization & Traceability

To maintain technical integrity and clear scoping, project requirements are strictly categorized into four tiers:

| Tier | Category | Description |
| :--- | :--- | :--- |
| **Tier 1** | **Explicit Source Requirements** | Direct mandates from PS 26016 and SNA project guidelines. |
| **Tier 2** | **Engineering Decisions** | Architectural, structural, and tech stack choices made to realize Tier 1 requirements efficiently. |
| **Tier 3** | **Prototype Simplifications** | Realistic boundaries scoped for hackathon/academic delivery without compromising functional rigor. |
| **Tier 4** | **Future Production Features** | Advanced national-scale integrations (e.g., live PFMS banking APIs, satellite change detection) planned for production rollout. |

### 2.1 Traceability Matrix

```
[PS 26016 Mandates] ────────────────────────────────────────────────────────┐
  ├─ End-to-end digital workflow ────────► [FR-01 to FR-09: Workflow Engine]│
  ├─ GIS & Cadastral Geo-tagging ────────► [FR-10 to FR-12: GIS Module]    │
  ├─ Stakeholder Coordination ───────────► [FR-13 to FR-16: SNA Engine]    │
  ├─ Dashboard & Analytics ──────────────► [FR-17 to FR-19: Analytics]     │
  └─ Predictive Analytics (Delay) ───────► [FR-20: ML Delay Predictor]     │
                                                                           ▼
                                                             [System Implementation]
```

---

## 3. Stakeholder Analysis & User Roles

The land acquisition ecosystem involves hierarchical and cross-functional actors spanning three tiers of governance (Central, State, District) and external executing bodies:

### 3.1 Stakeholder Profiles

| Stakeholder Entity | Level | Primary Responsibilities & Functional Mandate |
| :--- | :--- | :--- |
| **Ministry of Rural Development (MoRD) / DoLR** | Central | National policy oversight, macro-level monitoring, inter-state coordination, national dashboard review, budget tracking. |
| **Central Infrastructure Ministries** (MoRTH, MoR, MoP) | Central | Project proposal sponsoring, capital allocation, national priority alignment. |
| **State Revenue Department** | State | State-level sanction, issuance of Section 11/19 state gazette notifications, dispute appeals, inter-district coordination. |
| **District Collector / District Magistrate (DC/DM)** | District | Statutory Competent Authority for Land Acquisition (CALA), issue of public notice, presiding over award inquiries, compensation sanction. |
| **Sub-Divisional Magistrate / Land Acquisition Officer (SDM/LAO)** | District | Field verification, Joint Measurement Survey (JMS) supervision, claims adjudication, award determination. |
| **Land Requiring Body (LRB / PIA)** (e.g., NHAI, Railways, NTPC) | Agency | Submission of land requisition, submission of DPR/alignment plans, depositing acquisition and compensation funds into escrow. |
| **Rehabilitation & Resettlement (R&R) Administrator** | District/State | Conducting census of PAFs/PDFs, drafting R&R scheme, allocation of alternative land/housing, monitoring resettlement allowances. |
| **Revenue Inspector / Amin / Field Surveyor** | Field | Physical demarcation, cadastral boundary inspection, geo-tagging, ground-truthing of ownership and structural assets. |
| **Project Affected Families (PAFs) / Land Owners** | Citizen | Claim submission, objection filing under Section 15, compensation status tracking, grievance redressal. |

### 3.2 Role-Based Access Control (RBAC) Matrix

| User Role | Code | Permissions |
| :--- | :--- | :--- |
| **National Administrator** | `ROLE_NATIONAL_ADMIN` | Full read/write access across all states, user management, system audit log inspection, national policy parameter configuration. |
| **State Nodal Officer** | `ROLE_STATE_OFFICER` | Read/write access within designated State, approve Section 11/19 recommendations, trigger state-level notifications. |
| **District Collector (CALA)** | `ROLE_CALA_COLLECTOR` | Create/approve awards, issue Section 15 hearing orders, sign possession certificates, disburse compensation batches. |
| **Land Acquisition Officer** | `ROLE_LAO` | Conduct scrutiny, upload JMS reports, calculate compensation schedules, record owner verification details. |
| **Requiring Body Officer** | `ROLE_REQUIRING_BODY` | Create new land requisition proposals, upload alignment shapefiles, deposit administrative/compensation funds. |
| **R&R Commissioner** | `ROLE_RR_OFFICER` | Approve R&R baseline survey, disburse rehabilitation packages, monitor resettlement colony progress. |
| **Field Surveyor** | `ROLE_FIELD_SURVEYOR` | Mobile-responsive geo-tagging, plot photo uploads, coordinate verification against cadastral maps. |
| **Public Observer / Citizen** | `ROLE_CITIZEN` | Public dashboard access, read-only search of gazette notifications and compensation awards by parcel number. |

---

## 4. Functional Requirements (FR)

### Module 1: Project Management & Requisition
- **FR-01 (Proposal Ingestion):** The system shall allow Requiring Bodies to submit digital project requisitions including project category, alignment details, estimated acreage, budget estimates, and DPR documents.
- **FR-02 (Milestone Definition):** System shall automatically bind statutory milestones (SIA, Sec 11 Notification, Sec 19 Declaration, Award, Compensation, Possession) with deadline clocks calculated according to statutory norms.
- **FR-03 (Search & Filter):** Users shall be able to filter projects by state, district, acquiring agency, stage, risk profile, and date range.

### Module 2: Multi-Stage Acquisition Workflow Engine
- **FR-04 (10-Stage Statutory Pipeline):** System shall enforce a deterministic 10-stage sequential state machine:
  1. *Proposal Submission*
  2. *Digital Scrutiny*
  3. *Administrative Approval*
  4. *Preliminary Notification (Sec 11)*
  5. *Acquisition Declaration (Sec 19)*
  6. *Award Inquiry & Determination (Sec 23/30)*
  7. *Compensation Assessment & Payment*
  8. *Physical Land Possession (Sec 38)*
  9. *R&R Implementation*
  10. *Project Closure & Mutation*
- **FR-05 (Action Logging & Event Generation):** Every workflow state transition, document approval, query raise, and clarification response must generate an immutable, structured event in the `stakeholder_interactions` table to continuously feed the SNA engine.
- **FR-06 (Digital Scrutiny & Objection Handling):** Support online submission, classification, and hearing scheduling for Section 15 public objections.

### Module 3: Land Parcels & PostGIS Cadastral Mapping
- **FR-07 (Cadastral Parcel Ingestion):** Ingest and store land parcel boundaries using GeoJSON and PostGIS spatial geometry types (`POLYGON`, `MULTIPOLYGON`).
- **FR-08 (Spatial Attribute Tracking):** Associate each parcel with Survey/Khasra number, land classification (agricultural, barren, commercial), village, taluk, total extent, notified extent, and ownership register.
- **FR-09 (Interactive GIS Map):** Provide a Leaflet-based interactive map displaying:
  - Base layer switching (OpenStreetMap, CartoDB Dark, Satellite).
  - Spatial choropleth visualization of acquisition stages (Notified, Disputed, Awarded, Possessed).
  - Interactive click-to-inspect popups showing parcel metrics, owner details, and compensation status.
  - Spatial filtering by project alignment and administrative boundary.

### Module 4: Awards, Compensation & Direct Benefit Transfer
- **FR-10 (Compensation Schedule Generation):** Automated computation of market value, multiplying factor, 100% solatium, and 12% additional interest under RFCTLARR First Schedule.
- **FR-11 (Beneficiary & Payment Tracking):** Record beneficiary bank account details, Aadhaar hash, compensation entitlement, disbursement batch, payment status (Pending, Disbursed, Escrow/Disputed), and transaction reference.
- **FR-12 (Possession Certification):** Enforce business rule: Physical possession certificates cannot be issued until minimum statutory compensation disbursement threshold (e.g., 80% to 100%) is recorded.

### Module 5: Rehabilitation & Resettlement (R&R)
- **FR-13 (Affected Family Census):** Maintain registry of PAFs and PDFs with socio-economic profile, loss category (land, homestead, livelihood), and vulnerable community status (SC/ST).
- **FR-14 (Entitlement Allotment):** Track allotment of house sites, financial grants for house construction, subsistence grants, and skill training programs.

### Module 6: Document Management & Audit
- **FR-15 (Document Repository):** Secure storage of PDF/GeoJSON artifacts (Gazette notifications, valuation reports, field survey photographs) with cryptographic hashing (SHA-256) and versioning.
- **FR-16 (Immutable Audit Logs):** Record every login, document access, approval click, and data modification with IP address, user ID, timestamp, and action description.

### Module 7: Social Network Analysis (SNA) Integration
- **FR-17 (Automated Network Extraction):** Extract directed, weighted graph representations directly from workflow interaction event logs across projects, departments, and administrative levels.
- **FR-18 (Centrality Computation):** Compute Degree, In-Degree, Out-Degree, Betweenness, Closeness, and Eigenvector centralities and PageRank for all participating nodes.
- **FR-19 (Community Detection):** Run community detection (Greedy Modularity / Louvain) to discover operational clusters and identify bridging authorities.
- **FR-20 (Network Resilience Simulation):** Perform interactive stress testing simulating node failure/removal (highest degree, highest betweenness, random) and compute topological impact metrics.

### Module 8: AI-Driven Project Delay Prediction
- **FR-21 (Risk Scoring Engine):** Train and expose Scikit-learn classification models to predict project delay probability (Low, Medium, High) based on milestone velocity, compensation disbursement rate, objection volume, and family displacement ratios.
- **FR-22 (Decision Support Dashboard):** Expose key risk factors driving delays to assist executive administrators in proactive intervention.

---

## 5. Non-Functional Requirements (NFR)

| ID | Dimension | Requirement Specification |
| :--- | :--- | :--- |
| **NFR-01** | **Performance & Latency** | REST API endpoints must achieve p95 response time < 350ms for relational queries and < 800ms for spatial bounding-box GeoJSON queries. |
| **NFR-02** | **Scalability** | Architecture must support at least 500 concurrent administrative users and up to 100,000 spatial parcels without degradation. |
| **NFR-03** | **Security & Authentication** | Stateless JWT authentication with SHA-256 signatures, bcrypt password hashing (work factor >= 12), and role-gated API endpoints. |
| **NFR-04** | **Data Integrity & Consistency** | ACID-compliant transactional workflows across financial disbursements and milestone transitions to prevent double-spending or invalid state jumps. |
| **NFR-05** | **Interoperability** | Standard GeoJSON format (RFC 7946) for all spatial boundaries; OpenAPI v3 (Swagger) specifications for all backend endpoints. |
| **NFR-06** | **Mobile Responsiveness** | Responsive UI optimized for desktop monitors (>= 1280px) and tablet/field mobile devices (>= 768px). |
| **NFR-07** | **Auditability & Traceability** | 100% of state change transactions must be chronologically stamped and queryable for regulatory compliance. |

---

## 6. Risk Analysis & Mitigation Matrix

| Risk Factor | Impact | Likelihood | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Lack of Real Government Workflow Logs** | High | Certain | Build a rigorous, rule-driven synthetic event generator modeled on RFCTLARR statutory timelines. Clearly flag all datasets as synthetic academic simulations. |
| **PostGIS Spatial Query Latency** | Medium | Medium | Implement R-tree spatial indexing (`GIST (geom)`), simplify complex polygons for overview zoom levels, and paginate vector features. |
| **Disconnected SNA Representation** | High | Low | Enforce architectural rule: The SNA engine reads directly from the persistent relational `stakeholder_interactions` table populated by workflow triggers, ensuring organic coupling. |
| **Overfitting in Delay Prediction** | Medium | Medium | Use cross-validated ensemble models (Random Forest, Logistic Regression), inspect feature importance, and clearly label predictions as demonstrative prototype analytics. |

---

## 7. Prototype MVP Scope vs. Future Enhancements

### 7.1 Minimum Viable Prototype (MVP) Scope (Weeks 0–17)
- Functional web app with React + TypeScript frontend and FastAPI backend.
- End-to-end 10-stage workflow engine with state validations and approvals.
- PostGIS database with cadastral polygon storage and Leaflet interactive map.
- Automated generation of stakeholder interaction network from workflow actions.
- Real-time SNA analysis: degree distributions, 5 centrality metrics, Louvain community detection, and resilience node-removal simulations.
- Scikit-learn delay prediction model with explainable risk drivers.
- Complete suite of academic deliverables (Review I, II, SEE slide decks and analytical reports).

### 7.2 Future Production Scope (Post-Academic / Phase 3)
- Live API integration with State Bhulekh/Bhoomi land record portals.
- Integration with Public Financial Management System (PFMS) for automated Direct Benefit Transfer.
- High-resolution satellite imagery overlay with AI change detection for encroachment monitoring.
- Multi-lingual UI support across 22 official scheduled Indian languages.
