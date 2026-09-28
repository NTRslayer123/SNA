import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck, AlertCircle, KeyRound, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { DemoUser } from '../types';

interface LoginPageProps {
  onClose?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onClose }) => {
  const { login, quickSwitch } = useAuth();
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
    <div style={{
      maxWidth: '960px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '24px',
        borderLeft: '4px solid var(--accent-cyan)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0EA5E9, #3B82F6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 0 15px rgba(14, 165, 233, 0.4)',
          }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Statutory Stakeholder Authentication Portal
              </h2>
              <span className="badge badge-cyan">RBAC ENFORCED</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Multi-tiered identity verification under the RFCTLARR Act 2013 and Central Government Security Guidelines.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Left Column: Direct Login Form */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Sign In with Official Credentials
            </h3>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#F87171',
              fontSize: '13px',
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Official Government Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="email"
                  required
                  placeholder="e.g. collector.bengaluru@nlams.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Secure Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Default demo password: <code style={{ color: 'var(--accent-cyan)' }}>nlams@password2026</code>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ marginTop: '8px', padding: '10px' }}
            >
              {loading ? 'Authenticating...' : 'Authenticate & Issue JWT Token'}
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* Right Column: Institutional Quick Switcher for Evaluators */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} color="var(--accent-purple)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Statutory Role Quick Switcher
              </h3>
            </div>
            <span className="badge badge-purple">8 Roles Seeded</span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Click any statutory role below to instantaneously authenticate as that official and verify role-based access control (RBAC):
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '380px',
            overflowY: 'auto',
            paddingRight: '4px',
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
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                  e.currentTarget.style.background = 'var(--bg-surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.background = 'var(--bg-surface-elevated)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {du.role_name}
                    </span>
                    <span className="badge badge-cyan" style={{ fontSize: '9px', padding: '1px 5px' }}>
                      {du.role_id.replace('ROLE_', '')}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {du.full_name}
                  </div>
                </div>
                <UserCheck size={16} color="var(--accent-emerald)" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
