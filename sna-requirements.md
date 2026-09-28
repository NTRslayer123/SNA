# Social Network Analysis (SNA) Requirements & Academic Deliverables Specification
**Project Layer:** Layer 2 — Social Network Analysis of the Land Acquisition Ecosystem  
**Course Component:** SNA Mini Project  
**Target Domain:** Multi-Agency Land Acquisition Coordination  

---

## 1. Academic Deliverables & Milestone Traceability

The SNA Mini Project mandate establishes strict phase-wise deliverables and institutional review milestones. The system architecture directly satisfies these requirements through automated reporting, dedicated script modules, and an interactive analytics suite.

### 1.1 Phase-Wise Deliverable Matrix

| Phase | Deliverable Title | Formal Description | Target Artifact / Module |
| :--- | :--- | :--- | :--- |
| **Phase 0** | **Project Proposal Document** | Formulates problem statement, research objectives, institutional scope, hypothesis, and data sources. | `docs/sna/proposal.md` & `requirements.md` |
| **Phase 0** | **Network Data Description** | Complete formal schema of nodes, directed/weighted edges, data generation methodology, and data cleaning rules. | `docs/sna/network_data_description.md` & `sna/data/` |
| **Phase 1** | **Preliminary Analysis Report** | Empirical calculation of degree distribution, centralities, network density, diameter, and initial domain interpretations. | `docs/sna/preliminary_analysis.md` (Week 7) |
| **Phase 1** | **Working Prototype** | Interactive dashboard visualizing network topology, node centrality sizing, edge weighting, and dynamic filtering. | Web Frontend SNA Module (Week 8) |
| **Phase 2** | **Final Analytical Report** | In-depth thesis-style report covering community detection, resilience experiments, decision support, and policy findings. | `docs/sna/final_analytical_report.md` (Week 15) |
| **Phase 2** | **Source Code Repository** | Fully modularized, documented Python/NetworkX codebase with reproducible test harnesses. | `sna/` directory tree |
| **Phase 2** | **Presentation Slides & Demo** | Academic slide deck and recorded live demonstration script covering all project rubrics. | `docs/presentation/` & Demo Walkthrough |

### 1.2 Institutional Review Presentation Mapping

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ REVIEW I PRESENTATION (Week 4-5)                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Synopsis (Link to formal PDF proposal)                                   │
│ 2. Introduction: Indian Land Acquisition Context & Multi-Agency Complexity  │
│ 3. Literature Survey: Administrative SNA, Bottleneck Detection, RFCTLARR   │
│ 4. Motivation: Replacing physical file chasing with structural network data │
│ 5. Problem Formulation: Coordination failures causing multi-year delays     │
│ 6. Objectives: Dual Goals (Operational Web Platform + Network Analytics)    │
│ 7. Applications: Smart Governance, Delay Mitigation, Administrative Reform  │
│ 8. References: Academic journals, DoLR manuals, NetworkX literature         │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ REVIEW II PRESENTATION (Week 10-11)                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Design: Decoupled Graph Architecture & Event-Driven Ingestion            │
│ 2. Methodology: Simulation -> Construction -> Metric Mining -> Simulation   │
│ 3. Algorithm Development: Louvain Communities, Node-Removal Attack Models   │
│ 4. Experimental Setup: Synthetic data generator with RFCTLARR parameters    │
│ 5. Experiments Conducted: Centrality comparisons, targeted vs random attack │
│ 6. Testing: Validation of graph metrics against mathematical ground truths  │
│ 7. Demonstration: Live Working Prototype running on React + FastAPI         │
│ 8. Results & Analysis: District Collector bridge role, Modularity index     │
│ 9. Conclusion & Future Enhancements: Dynamic temporal graphs, PFMS link     │
│ 10. References: Wasserman & Faust, Newman, Freeman, Centrality research     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ SEMESTER END EVALUATION (SEE) / FINAL PRESENTATION (Week 17)                │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Comprehensive Executive Introduction & Literature Re-evaluation         │
│ 2. Rigorous Problem Formulation & Mathematical Network Definition           │
│ 3. End-to-End System & SNA Pipeline Architecture                            │
│ 4. Complete Metric Suite: In/Out Degree, Betweenness, Closeness, Eigenvector│
│ 5. Community Structure: Modularity analysis vs Administrative Hierarchy     │
│ 6. Empirical Resilience Curve: Topological breakdown under targeted attacks │
│ 7. AI + SNA Synthesis: Evaluating network centrality as delay risk feature  │
│ 8. Full Live System Demo: Proposal -> GIS -> Workflow -> SNA Insights      │
│ 9. Policy Implications for Ministry of Rural Development                    │
│ 10. Exhaustive Technical References                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Theoretical SNA Concept for Land Acquisition

### 2.1 The Stakeholder Coordination Network Model
The network represents statutory, administrative, and procedural interactions between institutional actors involved in moving land acquisition projects across their statutory lifecycle.

- **Mathematical Formalism:**  
  The coordination network is modeled as a directed, weighted multigraph aggregated into a directed weighted graph:  
  $$G = (V, E, W)$$  
  Where:
  - $V = \{v_1, v_2, \dots, v_n\}$ is the set of stakeholder nodes (organizations, departments, authorities).
  - $E \subseteq V \times V$ is the set of directed edges $(u, v)$ indicating an action originated by stakeholder $u$ directed to stakeholder $v$.
  - $W: E \to \mathbb{R}^+$ is the weight function representing interaction frequency:  
    $$W(u, v) = \sum_{k=1}^M \mathbf{1}_{\{ \text{source}=u, \, \text{target}=v \}}$$

### 2.2 Core Node Entities ($V$)
The network comprises standardized institutional roles across all tiers:
1. `CENTRAL_MINISTRY`: Department of Land Resources (DoLR), MoRD, Sponsoring Infrastructure Ministries (MoRTH, MoR).
2. `STATE_GOVERNMENT`: State Revenue Department, Principal Secretary (Revenue), State Cabinet.
3. `DISTRICT_COLLECTOR`: District Magistrate / Collector (Competent Authority under RFCTLARR).
4. `LAND_ACQUISITION_OFFICER`: SDM/LAO conducting hearings, claims verification, and award inquiries.
5. `REQUIRING_BODY`: Sponsoring infrastructure agency (NHAI, Indian Railways, State PWD, DMRC).
6. `REHABILITATION_AUTHORITY`: Commissioner R&R, District Resettlement Officer.
7. `FIELD_OFFICER`: Revenue Inspector, Taluk Surveyor, Amin conducting Joint Measurement Surveys.
8. `FINANCE_CONTROLLER`: State/District Treasury, Escrow Bank, PFMS Nodal Officer.
9. `LEGAL_CELL`: Revenue Court, Government Pleader handling Section 15 objections and reference cases.

### 2.3 Directed Edge Semantics ($E$)
An edge $(u, v)$ is generated dynamically whenever a statutory or operational workflow action is executed:
- **`SUBMIT_REQUISITION`:** Requiring Body $\to$ District Collector / State Government.
- **`FORWARD_FOR_SCRUTINY`:** District Collector $\to$ Land Acquisition Officer.
- **`REQUEST_SIA_REPORT`:** State Government $\to$ SIA Agency.
- **`SUBMIT_SIA_REPORT`:** SIA Agency $\to$ State Government.
- **`ISSUE_SEC11_NOTIFICATION`:** State Government / Collector $\to$ Field Officers / Public.
- **`SUBMIT_JMS_DATA`:** Field Surveyor $\to$ Land Acquisition Officer.
- **`FORWARD_OBJECTION`:** Affected Citizen / Legal Cell $\to$ Land Acquisition Officer.
- **`SUBMIT_AWARD_RECOMMENDATION`:** LAO $\to$ District Collector.
- **`SANCTION_AWARD`:** District Collector $\to$ Requiring Body / Finance Controller.
- **`DISBURSE_COMPENSATION`:** Finance Controller $\to$ Affected Land Owners.
- **`SUBMIT_RR_SCHEME`:** Rehabilitation Authority $\to$ District Collector.
- **`HANDOVER_POSSESSION`:** District Collector $\to$ Requiring Body.

---

## 3. The 10 Core Analytical Research Questions

The SNA module is engineered to answer empirical operational questions vital to the Ministry of Rural Development:

1. **Centrality Dominance:** Which specific administrative offices handle the highest volume of inbound and outbound transactions, making them operational hubs?
2. **Coordination Bridges:** Which stakeholders possess high betweenness centrality, acting as indispensable conduits between distinct governmental silos (e.g., between Requiring Bodies and District Courts)?
3. **Communication Sinks vs. Sources:** Who initiates the majority of workflows (sources) versus who primarily receives and adjudicates requests (sinks)?
4. **Structural Isolates:** Are specialized entities (e.g., R&R monitoring cells or environmental clearance officers) operating in isolation without direct coordination with the main acquisition pipeline?
5. **Community Substructures:** Do empirical interaction clusters align strictly with formal administrative jurisdictions (State vs. District), or do cross-functional task clusters emerge?
6. **Procedural Bottlenecks:** Where in the network does edge traversal time spike, identifying inter-agency friction points?
7. **Single Points of Failure:** Which nodes represent structural articulation points whose removal partitions the coordination graph into disconnected components?
8. **Institutional Resilience Under Stress:** How does overall network efficiency degrade if a primary authority (e.g., District Collector) is temporarily incapacitated or overwhelmed?
9. **Resource Allocation Prioritization:** Which secondary offices require enhanced clerical and digital staff to prevent upstream queue buildup?
10. **Project Delay Correlation:** Do infrastructure projects with low-density or highly fragmented stakeholder networks exhibit statistically higher completion delays?

---

## 4. Synthetic Data Generation Strategy & Ethical Warning

> [!WARNING]
> ### SYNTHETIC DATA MANDATORY DISCLAIMER
> This system utilizes simulated and synthetic interaction datasets designed strictly for prototype validation, algorithmic testing, and academic demonstration. The interaction counts, temporal stamps, and node linkages do NOT represent actual classified operational data or individual official performance records of the Government of India or State Administrations.

### 4.1 Schema of Workflow Event Logs (`stakeholder_interactions`)

Each interaction record generated by the workflow engine adheres to the following specification:

| Field Name | Data Type | Constraints | Description & Example |
| :--- | :--- | :--- | :--- |
| `interaction_id` | `VARCHAR(36)` | PRIMARY KEY, UUID | Unique transactional identifier (e.g., `urn:uuid:7f3a...`). |
| `timestamp` | `TIMESTAMP WITH TIME ZONE` | NOT NULL, INDEXED | Precise ISO-8601 execution timestamp. |
| `project_id` | `VARCHAR(20)` | FOREIGN KEY, NOT NULL | Project identifier (e.g., `PRJ-NHAI-2026-004`). |
| `source_stakeholder` | `VARCHAR(60)` | NOT NULL, INDEXED | Initiator entity (e.g., `DISTRICT_COLLECTOR_BENGALURU`). |
| `target_stakeholder` | `VARCHAR(60)` | NOT NULL, INDEXED | Recipient entity (e.g., `STATE_REVENUE_DEPT_KARNATAKA`). |
| `interaction_type` | `VARCHAR(40)` | NOT NULL | Action category (e.g., `APPROVAL_REQUEST`, `JMS_SUBMISSION`). |
| `workflow_stage` | `VARCHAR(30)` | NOT NULL, INDEXED | Associated statutory phase (e.g., `NOTIFICATION_SEC11`). |
| `state` | `VARCHAR(50)` | NOT NULL | State jurisdiction (e.g., `Karnataka`). |
| `district` | `VARCHAR(50)` | NOT NULL | District jurisdiction (e.g., `Bengaluru Urban`). |
| `duration_hours` | `NUMERIC(8,2)` | NULLABLE | Response latency or turnaround time for the interaction step. |

---

## 5. Mathematical Metrics & Domain Interpretation

Every computed metric must be coupled with an explicit, rigorous land acquisition administrative interpretation:

### 5.1 Degree Metrics
- **In-Degree ($k_i^{in}$):**  
  $$k_i^{in} = \sum_{j} A_{ji}$$  
  *Domain Meaning:* Number of workflow requests, proposals, objections, or verification submissions routed to stakeholder $i$. High in-degree indicates an **adjudication or approval bottleneck** (e.g., District Collector receiving hundreds of field reports).
- **Out-Degree ($k_i^{out}$):**  
  $$k_i^{out} = \sum_{j} A_{ij}$$  
  *Domain Meaning:* Number of directives, gazette publications, compensation disbursement orders, or queries dispatched by stakeholder $i$. High out-degree indicates an **initiating administrative driver** (e.g., Requiring Body driving project requisitions).
- **Weighted Degree (Strength $s_i$):**  
  $$s_i = \sum_{j} W_{ij} + \sum_{j} W_{ji}$$  
  *Domain Meaning:* Total volume of procedural data exchange, measuring raw institutional workload.

### 5.2 Degree Distribution Analysis
- **Formulation:** $P(k)$ represents the probability that a randomly chosen node has degree $k$.
- **Interpretation:** Administrative coordination networks often exhibit heavy-tailed or hub-and-spoke topologies rather than random Erdős–Rényi distributions. A small number of statutory authorities (District Collectors, State Revenue Secretariats) act as super-hubs, while dozens of specialized field offices or civil contractors possess low connectivity. The analysis will visualize log-log histograms and assess whether governance structures follow hierarchical power-law patterns.

### 5.3 Centrality Metrics
- **Degree Centrality ($C_D$):**  
  $$C_D(v) = \frac{k_v}{N - 1}$$  
  *Domain Meaning:* Proportion of immediate administrative partners. A high $C_D$ authority interacts directly with nearly all departments without intermediaries.
- **Betweenness Centrality ($C_B$):**  
  $$C_B(v) = \sum_{s \neq v \neq t} \frac{\sigma_{st}(v)}{\sigma_{st}}$$  
  Where $\sigma_{st}$ is the total number of shortest coordination paths from $s$ to $t$, and $\sigma_{st}(v)$ is the number of those paths that pass through $v$.  
  *Domain Meaning:* **Gatekeeper index**. A high $C_B$ actor controls information flow between otherwise disconnected administrative domains (e.g., between the Central Infrastructure Ministry and rural land owners). If this actor delays files, the entire project pipeline stalls.
- **Closeness Centrality ($C_C$):**  
  $$C_C(v) = \frac{N - 1}{\sum_{u \neq v} d(v, u)}$$  
  *Domain Meaning:* Proximity to all other actors in the system. High closeness indicates an office capable of rapidly disseminating emergency directives or regulatory updates across the bureaucracy.
- **Eigenvector Centrality ($C_E$):**  
  $$C_E(v) = \frac{1}{\lambda} \sum_{u \in M(v)} C_E(u)$$  
  *Domain Meaning:* Influence through association. High eigenvector centrality means an agency is connected to other highly connected, authoritative agencies (e.g., an advisor directly connected to the Chief Minister and Union Cabinet Secretary).
- **PageRank ($PR$):**  
  $$PR(u) = \frac{1-d}{N} + d \sum_{v \in M(u)} \frac{PR(v)}{L(v)}$$  
  *Domain Meaning:* Directional procedural authority. Measures which stakeholders receive endorsement and delegation from other high-prestige authorities.

---

## 6. Community Detection Strategy

### 6.1 Algorithm Selection & Mathematical Basis
- **Primary Algorithm:** **Louvain Heuristic for Modularity Maximization** (complemented by Clauset-Newman-Moore Greedy Modularity as baseline).
- **Modularity Formulation:**  
  $$Q = \frac{1}{2m} \sum_{i,j} \left[ A_{ij} - \frac{k_i k_j}{2m} \right] \delta(c_i, c_j)$$  
  Where $m$ is total edge weight, $A_{ij}$ is the adjacency matrix, $k_i$ is degree, and $\delta(c_i, c_j)$ is the Kronecker delta indicating co-membership in community $c$.

### 6.2 Hypothesized Communities vs. Empirical Reality
The system will systematically contrast detected modular communities against formal administrative divisions:
1. **Administrative Hypothesis:** Nodes will cluster strictly by bureaucratic tier (Cluster 1: Central Ministries; Cluster 2: State Governments; Cluster 3: District Collectors).
2. **Alternative Workflow Hypothesis:** Nodes cluster functionally by project lifecycle phases (Cluster A: Alignment, Survey & Inception; Cluster B: Legal Inquiry & Claims Adjudication; Cluster C: Post-Award Compensation, DBT & Resettlement).
3. **Evaluation Metric:** Calculate Adjusted Mutual Information (AMI) and Normalized Mutual Information (NMI) between administrative tiers and detected communities.

---

## 7. Network Resilience & Attack Simulation Strategy

To evaluate the operational robustness of the land acquisition machinery, the system implements automated stress testing through sequential node removal experiments:

### 7.1 Experimental Protocols
1. **Targeted Attack on Hubs (Degree Removal):** Sequentially remove nodes in descending order of Degree Centrality ($C_D$).
2. **Targeted Attack on Bridges (Betweenness Removal):** Sequentially remove nodes in descending order of Betweenness Centrality ($C_B$).
3. **Random Administrative Failure (Baseline):** Sequentially remove nodes uniformly at random over 100 Monte Carlo iterations.

### 7.2 Evaluated Degradation Metrics
At each step of node removal ($f \in [0, 0.5]$ fraction of nodes removed):
- **Relative Size of Largest Connected Component ($S_{LCC}$):**  
  $$S_{LCC}(f) = \frac{|V_{LCC}(f)|}{|V_0|}$$
- **Number of Disconnected Components ($N_{comp}$):** Tracks organizational fragmentation into isolated administrative islands.
- **Global Network Efficiency ($E_{glob}$):**  
  $$E_{glob}(G) = \frac{1}{N(N-1)} \sum_{i \neq j \in G} \frac{1}{d(i, j)}$$  
  Measures communication efficiency even across disconnected graphs (where $d(i,j) = \infty \implies \frac{1}{d(i,j)} = 0$).

---

## 8. Dynamic & Temporal SNA Progression

The platform supports temporal slicing to examine how structural topology mutates across the 10 statutory lifecycle stages:

```
[Proposal & Inception Network]  ──► Dense bilateral exchanges: Requiring Body <-> State Revenue
                 │
                 ▼
[Survey & Scrutiny Network]    ──► Star topology centered on LAO & Survey Teams
                 │
                 ▼
[Award & Objection Network]    ──► Highly centralized bridge topology: District Collector (CALA)
                 │
                 ▼
[Compensation & DBT Network]   ──► Bipartite disbursement flows: Treasury <-> Bank <-> Citizens
                 │
                 ▼
[R&R Resettlement Network]     ──► Peripheral sub-graph: Commissioner R&R <-> Municipal Bodies
```

Comparative temporal metrics (Graph Density, Transitivity, Reciprocity) will be tracked across each stage to evaluate coordination maturation over project lifespan.
