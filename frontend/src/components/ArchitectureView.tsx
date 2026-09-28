import React from 'react';
import { Layers, Network, ArrowRight, Database, Server, Laptop, GitCommit } from 'lucide-react';
import type { HealthResponse, SystemInfo } from '../types';

interface ArchitectureViewProps {
  health: HealthResponse | null;
  systemInfo: SystemInfo | null;
  onTriggerProbe: () => void;
  probeLoading: boolean;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({
  health,
  systemInfo,
  onTriggerProbe,
  probeLoading,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* End-to-End Verification Flow Banner */}
      <div className="glass-panel" style={{
        padding: '24px',
        borderLeft: '4px solid var(--accent-cyan)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Full-Stack Verification: Frontend ➔ Backend ➔ Database
              </h2>
              <span className="badge badge-emerald">WEEK 1 VERIFIED</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Real-time active handshake between React 19 Client, FastAPI Backend, and Asynchronous Database Engine.
            </p>
          </div>
          <button
            onClick={onTriggerProbe}
            disabled={probeLoading}
            className="btn btn-primary"
            style={{ fontSize: '13px' }}
          >
            <GitCommit size={15} />
            {probeLoading ? 'Executing SQL Probe...' : 'Execute Live Database Probe'}
          </button>
        </div>

        {/* Pipeline Nodes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          alignItems: 'center',
          marginTop: '6px',
        }}>
          {/* Node 1: React Client */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(14, 165, 233, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)',
            }}>
              <Laptop size={20} />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Client Tier
              </span>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                React 19 + TypeScript
              </div>
              <span style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>Vite Port 5173</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ArrowRight size={20} color="var(--accent-cyan)" />
          </div>

          {/* Node 2: FastAPI Backend */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-blue)',
            }}>
              <Server size={20} />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                API Gateway
              </span>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                FastAPI (Python 3.12)
              </div>
              <span style={{ fontSize: '11px', color: 'var(--accent-emerald)' }}>Port 8000 / Healthy</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ArrowRight size={20} color="var(--accent-cyan)" />
          </div>

          {/* Node 3: Database Engine */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-emerald)',
            }}>
              <Database size={20} />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Persistence
              </span>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {health?.database.engine.toUpperCase() === 'POSTGRESQL' ? 'PostgreSQL 16 + PostGIS' : 'Async SQLite Engine'}
              </div>
              <span style={{ fontSize: '11px', color: health?.database.status === 'connected' ? 'var(--accent-emerald)' : 'var(--accent-ruby)' }}>
                Status: {health?.database.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Interconnected Layers Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
        {/* Layer 1: Land Acquisition System */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(14, 165, 233, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
              }}>
                <Layers size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  LAYER 1: National Land Acquisition System
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {systemInfo?.problem_statement_id ? `PS ${systemInfo.problem_statement_id}` : 'PS 26016'} • {systemInfo?.statutory_act || 'RFCTLARR Act, 2013'}
                </span>
              </div>
            </div>
            <span className="badge badge-cyan">Core Platform</span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Digitizes the entire statutory lifecycle under the RFCTLARR Act 2013 across Central, State, and District administrations.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
            {[
              { name: '10-Stage Statutory Workflow', desc: 'Proposal ➔ Scrutiny ➔ Notification ➔ Award ➔ Compensation ➔ Possession ➔ R&R', status: 'Engine Active' },
              { name: 'PostGIS Cadastral Geospatial Engine', desc: 'Interactive Leaflet vector polygons with Khasra number geo-tagging', status: 'Ready' },
              { name: 'Compensation & Direct Benefit Transfer', desc: '100% Solatium computation + Aadhaar DBT payment batches', status: 'Ready' },
              { name: 'Rehabilitation & Resettlement (R&R)', desc: 'PAF/PDF socio-economic census & colony allotment', status: 'Ready' },
            ].map((sub, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{sub.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub.desc}</div>
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '10px' }}>{sub.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Layer 2: Social Network Analysis (SNA) */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(139, 92, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-purple)',
              }}>
                <Network size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  LAYER 2: Stakeholder Social Network Analysis
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  SNA Mini Project Academic Deliverable Suite
                </span>
              </div>
            </div>
            <span className="badge badge-purple">Analytics Core</span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Constructs directed, weighted coordination graphs organically derived from Layer 1 workflow events to evaluate governance resilience.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
            {[
              { name: 'Organic Event Ingestion', desc: 'Direct reads from persistent stakeholder_interactions transactional log', status: 'Organic Link' },
              { name: 'Centrality & Bridge Mining', desc: 'Degree, Betweenness, Closeness, Eigenvector & PageRank', status: 'NetworkX Ready' },
              { name: 'Louvain Community Detection', desc: 'Algorithmic clusters vs formal administrative tiers', status: 'Ready' },
              { name: 'Resilience Attack Simulation', desc: 'Hub & bridge removal stress tests measuring LCC decay', status: 'Ready' },
            ].map((sub, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{sub.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub.desc}</div>
                </div>
                <span className="badge badge-purple" style={{ fontSize: '10px' }}>{sub.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
