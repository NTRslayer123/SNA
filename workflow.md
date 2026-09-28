# Statutory Land Acquisition Workflow & State Machine Specification
**Reference Statute:** Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (RFCTLARR Act 2013)  
**System Layer:** Layer 1 Core Workflow Engine $\to$ Layer 2 Organic SNA Event Pipeline  

---

## 1. End-to-End Statutory Land Acquisition Lifecycle

The national land acquisition process follows a deterministic 10-stage statutory pipeline designed to guarantee transparency, inter-agency checks and balances, and fair compensation:

```
┌────────────────────────┐
│ 1. PROPOSAL SUBMISSION │  (Requiring Body submits DPR, alignment KML, requisition)
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  2. DIGITAL SCRUTINY   │  (District/State verify land records, forest/tribal status)
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ 3. ADMIN APPROVAL      │  (Competent Authority / State Cabinet accords approval)
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ 4. PRELIM NOTIFICATION │  (Section 11 Gazette notification & SIA public hearing)
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ 5. ACQUISITION DECLARE │  (Section 19 declaration of final acquisition intent)
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ 6. AWARD DETERMINATION │  (Section 23 inquiry & Section 30 award of compensation)
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ 7. COMPENSATION & DBT  │  (Escrow deposit, beneficiary verification, DBT disbursal)
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ 8. POSSESSION TAKEOVER │  (Section 38 physical taking of encumbrance-free land)
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ 9. R&R IMPLEMENTATION  │  (Resettlement colony allotment, grants, infrastructure)
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  10. PROJECT CLOSURE   │  (Cadastral mutation in RoR and administrative handover)
└────────────────────────┘
```

---

## 2. Detailed State Machine & Transition Rules

Every transition between statutory states requires specific actor privileges, verification preconditions, mandatory document uploads, and generates an automatic SNA interaction event.

| Stage # | Stage Name | Triggering Event / Action | Permitted Role | Prerequisite Conditions & Artifacts | Next State | SNA Interaction Type |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | `STAGE_PROPOSAL` | `SUBMIT_PROPOSAL` | `ROLE_REQUIRING_BODY` | Detailed Project Report (DPR), Alignment Shapefile, Justification note. | `STAGE_SCRUTINY` | `REQUISITION_SUBMISSION` |
| **02** | `STAGE_SCRUTINY` | `APPROVE_SCRUTINY` | `ROLE_LAO` / `ROLE_CALA` | Cadastral RoR check, forest clearance status, tribal land check. | `STAGE_APPROVAL` | `SCRUTINY_CLEARANCE` |
| **02** | `STAGE_SCRUTINY` | `RAISE_DEFECT` | `ROLE_LAO` | Identified survey discrepancy or incomplete revenue records. | `STAGE_PROPOSAL` | `DEFECT_NOTIFICATION` |
| **03** | `STAGE_APPROVAL` | `SANCTION_PROJECT` | `ROLE_STATE_OFFICER` | Formal administrative & financial sanction from State Revenue Secy. | `STAGE_SEC11_NOTIF` | `ADMIN_SANCTION` |
| **04** | `STAGE_SEC11_NOTIF`| `PUBLISH_SEC11` | `ROLE_CALA_COLLECTOR` | State Gazette publication, local newspaper notice, Gram Sabha notice. | `STAGE_SEC19_DECL` | `GAZETTE_PUBLICATION` |
| **04** | `STAGE_SEC11_NOTIF`| `LODGE_OBJECTION` | `ROLE_CITIZEN` / Legal | Filing Section 15 objection within 60 days of notification. | `STAGE_SEC11_NOTIF` | `OBJECTION_SUBMISSION` |
| **05** | `STAGE_SEC19_DECL`| `PUBLISH_SEC19` | `ROLE_STATE_OFFICER` | Completion of Sec 15 hearings, preliminary R&R summary published. | `STAGE_AWARD` | `DECLARATION_SEC19` |
| **06** | `STAGE_AWARD` | `ANNOUNCE_AWARD` | `ROLE_CALA_COLLECTOR` | Section 23 claims inquiry complete, solatium & market value calculated. | `STAGE_COMPENSATION`| `AWARD_DECLARATION` |
| **07** | `STAGE_COMPENSATION`| `DISBURSE_BATCH` | `ROLE_CALA` / Treasury | 100% award deposit by Requiring Body; Aadhaar-linked DBT execution. | `STAGE_POSSESSION` | `COMPENSATION_DISBURSED` |
| **08** | `STAGE_POSSESSION` | `ISSUE_POSSESSION_CERT` | `ROLE_CALA_COLLECTOR` | $\ge 80\%$ compensation disbursed; physical evacuation completed. | `STAGE_RR_EXECUTION` | `POSSESSION_HANDOVER` |
| **09** | `STAGE_RR_EXECUTION`| `COMPLETE_RR` | `ROLE_RR_OFFICER` | House allotments done, subsistence allowances paid, infra created. | `STAGE_CLOSURE` | `RR_COMPLETION_REPORT` |
| **10** | `STAGE_CLOSURE` | `MUTATE_RECORDS` | `ROLE_STATE_OFFICER` | Final revenue mutation recorded in Record of Rights (RoR); closure signed. | `STAGE_CLOSED` | `FINAL_CLOSURE_ORDER` |

---

## 3. Automated SNA Event Generation Mechanism

To eliminate disconnected or fabricated network analytics, **every workflow operation automatically and atomically generates an event record** in `stakeholder_interactions`:

### 3.1 Architectural Event Capture Pipeline
```
[User Action: e.g. CALA Sanctions Award]
                   │
                   ▼
       [FastAPI Workflow Service]
                   │
       ┌───────────┴───────────┐
       ▼                       ▼
[Update `projects` Stage]  [Insert `workflow_actions`]
       │                       │
       └───────────┬───────────┘
                   │
                   ▼
      [Insert `stakeholder_interactions`]
       - source_stakeholder = 'DISTRICT_COLLECTOR_PUNE'
       - target_stakeholder = 'REQUIRING_BODY_NHAI'
       - interaction_type   = 'AWARD_SANCTION'
       - workflow_stage     = 'STAGE_AWARD'
       - project_id         = 'PRJ-NHAI-001'
       - timestamp          = NOW()
                   │
                   ▼
      [NetworkX Ingestion Buffer / Materialized Cache]
```

---

## 4. Exception Handling, Objections & Rollback Pathways

Real-world land acquisitions regularly encounter statutory challenges and administrative queries. The system enforces formal sub-workflows for dispute resolution:

### 4.1 Section 15 Statutory Objection Handling
1. **Filing Window:** Citizens or civil entities lodge objections within 60 statutory days of Section 11 publication.
2. **Hearing Scheduling:** The Land Acquisition Officer schedules an in-person hearing and logs `SCHEDULE_HEARING` (LAO $\to$ Objector).
3. **Adjudication Order:** LAO issues a speaking order either dismissing objection or recommending alignment modification, triggering `OBJECTION_DECISION` (LAO $\to$ District Collector).

### 4.2 Court Reference & Litigation Stay (Section 64)
- When an award or compensation rate is challenged before the Land Acquisition, Rehabilitation and Resettlement Authority (LARRA) / High Court:
  - Project status transitions to `SUSPENDED_LITIGATION`.
  - Disputed funds are redirected to an interest-bearing judicial escrow account.
  - The delay prediction engine recalculates risk score to `HIGH_RISK` and flags executive alerts on the National Dashboard.
