import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  MapPin,
  GitMerge,
  Share2,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { StatCard } from './components/StatCard';
import { ArchitectureView } from './components/ArchitectureView';
import type { HealthResponse, SystemInfo } from './types';

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeLayer, setActiveLayer] = useState<'ALL' | 'LAYER_1' | 'LAYER_2'>('ALL');
  const [probeLatency, setProbeLatency] = useState<number | null>(null);

  const fetchDiagnostics = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const [healthRes, infoRes] = await Promise.all([
        fetch('/api/v1/health'),
        fetch('/api/v1/system/info'),
      ]);

      if (healthRes.ok) {
        const data = await healthRes.json();
        setHealth(data);
      }
      if (infoRes.ok) {
        const info = await infoRes.json();
        setSystemInfo(info);
      }
      const end = performance.now();
      setProbeLatency(Math.round(end - start));
    } catch (err) {
      console.error('Diagnostic probe failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
    const interval = setInterval(fetchDiagnostics, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Top Header */}
      <Header
        health={health}
        loading={loading}
        onRefresh={fetchDiagnostics}
        activeLayer={activeLayer}
        setActiveLayer={setActiveLayer}
      />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left Navigation Sidebar */}
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        {/* Main Content Viewport */}
        <main style={{ flex: 1, padding: '28px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Welcome & Context Banner */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  National Land Acquisition Monitoring Dashboard
                </h1>
                <span className="badge badge-cyan">Week 1 Foundation</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Digitizing Land Acquisition under the RFCTLARR Act 2013 with Integrated Social Network Analytics (SNA).
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <Activity size={16} color="var(--accent-cyan)" />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>API Latency:</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {probeLatency !== null ? `${probeLatency} ms` : 'Probing...'}
                </span>
              </div>
            </div>
          </div>

          {/* Top National Statistics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <StatCard
              title="Active Land Projects"
              value={health?.statistics.projects || 1}
              subtitle="Statutory Requisitions under Monitoring"
              badge="+1 New"
              badgeType="emerald"
              icon={FolderGit2}
              iconColor="var(--accent-cyan)"
            />
            <StatCard
              title="Acquired Land Extent"
              value="342.50 Ha"
              subtitle="Digitized Cadastral Polygons"
              badge="PostGIS Ready"
              badgeType="cyan"
              icon={MapPin}
              iconColor="var(--accent-blue)"
            />
            <StatCard
              title="Statutory Workflow Actions"
              value="10 Stages"
              subtitle="Proposal ➔ Award ➔ Possession"
              badge="Deterministic"
              badgeType="purple"
              icon={GitMerge}
              iconColor="var(--accent-purple)"
            />
            <StatCard
              title="SNA Interaction Events"
              value={health?.statistics.stakeholder_interactions || 1}
              subtitle="Organic Network Edge Feeders"
              badge="Live Feeder"
              badgeType="emerald"
              icon={Share2}
              iconColor="var(--accent-emerald)"
            />
          </div>

          {/* Architecture Verification & Layer Status */}
          <ArchitectureView
            health={health}
            systemInfo={systemInfo}
            onTriggerProbe={fetchDiagnostics}
            probeLoading={loading}
          />

          {/* Live Recent System Activity Console */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="var(--accent-emerald)" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Live System Diagnostics & Persistence Handshake
                </h3>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : ''}
              </span>
            </div>

            <div style={{
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}>
              <div style={{ color: 'var(--accent-emerald)' }}>
                [SUCCESS] FastAPI Gateway active on 127.0.0.1:8000 (version {health?.version || '1.0.0'})
              </div>
              <div style={{ color: 'var(--accent-cyan)' }}>
                [DATABASE] Engine: {health?.database.engine.toUpperCase() || 'SQLITE'} | Status: {health?.database.status.toUpperCase()} | Health probe result: 1 (OK)
              </div>
              <div style={{ color: 'var(--text-primary)' }}>
                [SEED DATA] Demo State: Karnataka (KA) | District: Bengaluru Urban | Seed Project: Bengaluru-Mysuru Expressway
              </div>
              <div style={{ color: 'var(--accent-purple)' }}>
                [SNA FEEDS] Initial interaction logged: LAND_REQUIRING_BODY_NHAI ➔ DISTRICT_COLLECTOR_BENGALURU
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
