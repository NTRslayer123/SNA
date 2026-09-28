import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  MapPin,
  Share2,
  CheckCircle2,
  Activity,
  UserCheck,
  ShieldCheck,
  X,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { StatCard } from './components/StatCard';
import { ArchitectureView } from './components/ArchitectureView';
import { LoginPage } from './components/LoginPage';
import type { HealthResponse, SystemInfo } from './types';

const DashboardContent: React.FC = () => {
  const { user } = useAuth();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeLayer, setActiveLayer] = useState<'ALL' | 'LAYER_1' | 'LAYER_2'>('ALL');
  const [probeLatency, setProbeLatency] = useState<number | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

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
        onOpenLogin={() => setShowLoginModal(true)}
      />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left Navigation Sidebar */}
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        {/* Main Content Viewport */}
        <main style={{ flex: 1, padding: '28px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Welcome & Context Banner with RBAC Identity */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  National Land Acquisition Monitoring Dashboard
                </h1>
                <span className="badge badge-cyan">Week 2: Auth & RBAC</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Digitizing Land Acquisition under the RFCTLARR Act 2013 with Integrated Social Network Analytics (SNA).
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Authenticated Stakeholder Identity Card */}
              {user ? (
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-active)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <UserCheck size={18} color="var(--accent-emerald)" />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {user.full_name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>
                      {user.role_id.replace('ROLE_', '')} ({user.district_id || user.state_id || 'National'})
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '8px 14px' }}
                >
                  <ShieldCheck size={15} color="var(--accent-cyan)" />
                  Authenticate as Stakeholder
                </button>
              )}

              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <Activity size={16} color="var(--accent-cyan)" />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Latency:</span>
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
              title="Statutory Stakeholders"
              value="8 Roles"
              subtitle="Central, State, District, Citizen"
              badge="RBAC Active"
              badgeType="purple"
              icon={ShieldCheck}
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
                  Live System Diagnostics & RBAC Security Handshake
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
                [SECURITY] JWT Authenticator active with SHA-256 signatures & bcrypt hashing
              </div>
              <div style={{ color: 'var(--accent-cyan)' }}>
                [RBAC] 8 Statutory Roles seeded: National Admin, State Officer, CALA Collector, LAO, Requiring Body, R&R, Surveyor, Citizen
              </div>
              <div style={{ color: 'var(--text-primary)' }}>
                [DATABASE] Engine: {health?.database.engine.toUpperCase() || 'SQLITE'} | Status: {health?.database.status.toUpperCase()} | 8 demo accounts ready
              </div>
              <div style={{ color: 'var(--accent-purple)' }}>
                [SNA FEEDS] Initial interaction logged: LAND_REQUIRING_BODY_NHAI ➔ DISTRICT_COLLECTOR_BENGALURU
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(7, 11, 20, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px',
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '960px' }}>
            <button
              onClick={() => setShowLoginModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
              }}
            >
              <X size={18} />
            </button>
            <LoginPage onClose={() => setShowLoginModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
};

export default App;
