import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck, AlertCircle, KeyRound, Building2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { DemoUser } from '../types';

interface LoginPageProps {
  onClose?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onClose }) => {
  const { login, quickSwitch } = useAuth();
  const [activeTab, setActiveTab] = useState<'QUICK' | 'DIRECT'>('QUICK');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('nlams@password2026');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);

  useEffect(() => {
    fetch('/api/v1/auth/demo-users')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setDemoUsers(data))
      .catch((err) => console.error('Failed to load demo users:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const success = await login(email, password);
    setLoading(false);

    if (success) {
      if (onClose) onClose();
    } else {
      setError('Authentication failed: Please check statutory credentials.');
    }
  };

  const handleQuickLogin = async (userEmail: string) => {
    setLoading(true);
    setError(null);
    const success = await quickSwitch(userEmail);
    setLoading(false);
    if (success && onClose) {
      onClose();
    }
  };

  return (
    <div className="glass-panel-elevated" style={{
      width: '100%',
      maxWidth: '780px',
      margin: '0 auto',
      maxHeight: 'min(580px, calc(100vh - 40px))',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 20px',
      gap: '12px',
      border: '1px solid var(--border-active)',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
      overflow: 'hidden',
    }}>
      {/* Compact Header Banner with Close Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '10px',
        borderBottom: '1px solid var(--border-subtle)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0EA5E9, #3B82F6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0,
          }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Statutory Stakeholder Authentication
              </h2>
              <span className="badge badge-cyan" style={{ fontSize: '9px' }}>RBAC Enforced</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              RFCTLARR Act 2013 Multi-Tiered Access Control
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            title="Close"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Mode Switcher Tabs */}
      <div style={{
        display: 'flex',
        background: 'var(--bg-primary)',
        padding: '2px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        flexShrink: 0,
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('QUICK')}
          style={{
            flex: 1,
            padding: '6px 10px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'QUICK' ? 'var(--accent-purple)' : 'transparent',
            color: activeTab === 'QUICK' ? '#FFFFFF' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <Building2 size={13} />
          1-Click Role Switcher (8 Seeded Roles)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('DIRECT')}
          style={{
            flex: 1,
            padding: '6px 10px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'DIRECT' ? 'var(--accent-cyan)' : 'transparent',
            color: activeTab === 'DIRECT' ? '#FFFFFF' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <KeyRound size={13} />
          Direct Email & Password Form
        </button>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#F87171',
          fontSize: '12px',
          flexShrink: 0,
        }}>
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Tab 1: 1-Click Role Switcher (Grid view) */}
      {activeTab === 'QUICK' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Select any statutory authority to authenticate with official permissions:
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              Password pre-configured
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '6px',
            overflowY: 'auto',
            paddingRight: '4px',
            maxHeight: 'min(380px, calc(100vh - 240px))',
          }}>
            {demoUsers.map((du, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickLogin(du.email)}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-purple)';
                  e.currentTarget.style.background = 'var(--bg-surface-elevated)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.background = 'var(--bg-surface)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {du.role_name}
                    </span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '1px' }}>
                    {du.full_name}
                  </div>
                  <span className="badge badge-purple" style={{ fontSize: '8px', padding: '0 3px', marginTop: '2px' }}>
                    {du.role_id.replace('ROLE_', '')}
                  </span>
                </div>
                <UserCheck size={14} color="var(--accent-emerald)" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Direct Login Form */}
      {activeTab === 'DIRECT' && (
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          flex: 1,
          overflowY: 'auto',
          paddingRight: '4px',
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Official Government Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="email"
                required
                placeholder="e.g. collector.bengaluru@nlams.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 32px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Statutory Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 32px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
              Default demo password: <code style={{ color: 'var(--accent-cyan)' }}>nlams@password2026</code>
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ marginTop: '4px', padding: '8px', fontSize: '12px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In & Issue JWT Access Token'}
            <ArrowRight size={14} />
          </button>
        </form>
      )}
    </div>
  );
};
