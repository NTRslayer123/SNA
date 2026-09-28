import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  AlertCircle,
  KeyRound,
  Building2,
  X,
  UserPlus,
  User,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { DemoUser, StatutoryRole } from '../types';
import { PRESET_STATES, getDistrictsForState } from '../data/jurisdictions';

interface LoginPageProps {
  onClose?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onClose }) => {
  const { login, register, quickSwitch } = useAuth();
  const [activeTab, setActiveTab] = useState<'QUICK' | 'DIRECT' | 'REGISTER'>('QUICK');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('nlams@password2026');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);
  const [roles, setRoles] = useState<StatutoryRole[]>([]);

  // Registration form states with presets
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('ROLE_CITIZEN');
  const [regDesignation, setRegDesignation] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regState, setRegState] = useState('KA');
  const [regDistrict, setRegDistrict] = useState('KA-BLRU');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  useEffect(() => {
    fetch('/api/v1/auth/demo-users')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setDemoUsers(data))
      .catch((err) => console.error('Failed to load demo users:', err));

    fetch('/api/v1/auth/roles')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setRoles(data))
      .catch((err) => console.error('Failed to load roles:', err));
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const ok = await login(email, password);
    setLoading(false);

    if (ok) {
      if (onClose) onClose();
    } else {
      setError('Authentication failed: Please check statutory credentials.');
    }
  };

  const handleQuickLogin = async (userEmail: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const ok = await quickSwitch(userEmail);
    setLoading(false);
    if (ok && onClose) {
      onClose();
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await register({
      email: regEmail,
      password: regPassword,
      full_name: regFullName,
      role_id: regRole,
      designation: regDesignation || undefined,
      phone_number: regPhone || undefined,
      state_id: regState || undefined,
      district_id: regDistrict || undefined,
    });
    setLoading(false);

    if (res.success) {
      setSuccess('Statutory account created successfully! Auto-signing in...');
      setTimeout(() => {
        if (onClose) onClose();
      }, 700);
    } else {
      setError(res.error || 'Registration failed.');
    }
  };

  const handleStateChange = (newState: string) => {
    setRegState(newState);
    const districts = getDistrictsForState(newState);
    if (districts.length > 0) {
      setRegDistrict(districts[0].district_id);
    } else {
      setRegDistrict('');
    }
  };

  return (
    <div className="glass-panel-elevated" style={{
      width: '100%',
      maxWidth: '780px',
      margin: '0 auto',
      maxHeight: 'min(620px, calc(100vh - 36px))',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 20px',
      gap: '12px',
      border: '1px solid var(--border-active)',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
      overflow: 'hidden',
    }}>
      {/* Header Banner with Title and Close Button */}
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
                {activeTab === 'REGISTER'
                  ? 'Create New Statutory Account'
                  : 'Statutory Stakeholder Authentication'}
              </h2>
              <span className="badge badge-cyan" style={{ fontSize: '9px' }}>
                {activeTab === 'REGISTER' ? 'Self-Registration' : 'RBAC Enforced'}
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              RFCTLARR Act 2013 Multi-Tiered Access & Governance System
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

      {/* Mode Switcher Tabs (3 Tabs) */}
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
          onClick={() => { setActiveTab('QUICK'); setError(null); setSuccess(null); }}
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
          1-Click Demo Switcher
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('DIRECT'); setError(null); setSuccess(null); }}
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
          Direct Sign In
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('REGISTER'); setError(null); setSuccess(null); }}
          style={{
            flex: 1,
            padding: '6px 10px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'REGISTER' ? 'var(--accent-emerald)' : 'transparent',
            color: activeTab === 'REGISTER' ? '#FFFFFF' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <UserPlus size={13} />
          Create New Account
        </button>
      </div>

      {/* Feedback Alerts */}
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

      {success && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#34D399',
          fontSize: '12px',
          flexShrink: 0,
        }}>
          <CheckCircle2 size={15} />
          <span>{success}</span>
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
        <form onSubmit={handleLoginSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          flex: 1,
          overflowY: 'auto',
          paddingRight: '4px',
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Official Government / Registered Email Address
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

      {/* Tab 3: Register New User Account */}
      {activeTab === 'REGISTER' && (
        <form onSubmit={handleRegisterSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          flex: 1,
          overflowY: 'auto',
          paddingRight: '4px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            {/* Full Name */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px' }}>
                Full Legal Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '9px' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar or Smt. Anita Roy"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 30px',
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

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px' }}>
                Email Address <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '9px' }} />
                <input
                  type="email"
                  required
                  placeholder="e.g. yourname@domain.gov.in"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 30px',
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

            {/* Statutory Role Dropdown */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px' }}>
                Statutory Role <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  outline: 'none',
                }}
              >
                {roles.length > 0 ? (
                  roles.map((r) => (
                    <option key={r.role_id} value={r.role_id} style={{ background: '#0F172A', color: '#FFFFFF' }}>
                      {r.role_name} ({r.role_id.replace('ROLE_', '')})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="ROLE_CITIZEN">Project Affected Landowner / Public Citizen</option>
                    <option value="ROLE_REQUIRING_BODY">Land Requiring Body (NHAI/Railways)</option>
                    <option value="ROLE_FIELD_SURVEYOR">Field Surveyor / Amin</option>
                    <option value="ROLE_LAO">Land Acquisition Officer (SDM)</option>
                    <option value="ROLE_CALA_COLLECTOR">Competent Authority (District Collector)</option>
                    <option value="ROLE_RR_OFFICER">R&R Commissioner</option>
                    <option value="ROLE_STATE_OFFICER">State Nodal Officer</option>
                    <option value="ROLE_NATIONAL_ADMIN">National Administrator</option>
                  </>
                )}
              </select>
            </div>

            {/* Designation */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px' }}>
                Designation / Title (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Landowner, Survey No. 44 or Project Director"
                value={regDesignation}
                onChange={(e) => setRegDesignation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
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

            {/* Phone Number */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px' }}>
                Mobile Contact (Optional)
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '9px' }} />
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 30px',
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

            {/* Preset State & District Cascading Selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px' }}>
                  State / Territory <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  value={regState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                >
                  {PRESET_STATES.map((st) => (
                    <option key={st.state_id} value={st.state_id} style={{ background: '#0F172A', color: '#FFFFFF' }}>
                      {st.state_name} ({st.state_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px' }}>
                  Statutory District <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  value={regDistrict}
                  onChange={(e) => setRegDistrict(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                >
                  {getDistrictsForState(regState).map((dst) => (
                    <option key={dst.district_id} value={dst.district_id} style={{ background: '#0F172A', color: '#FFFFFF' }}>
                      {dst.district_name} ({dst.district_id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px' }}>
                Password (min 6 characters) <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '9px' }} />
                <input
                  type="password"
                  required
                  placeholder="Create password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 30px',
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

            {/* Confirm Password */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '3px' }}>
                Confirm Password <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '9px' }} />
                <input
                  type="password"
                  required
                  placeholder="Confirm password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 30px',
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              marginTop: '4px',
              padding: '8px',
              fontSize: '12px',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              borderColor: 'rgba(16, 185, 129, 0.4)',
            }}
          >
            {loading ? 'Creating Statutory Account...' : 'Create Account & Sign In'}
            <UserPlus size={14} />
          </button>
        </form>
      )}
    </div>
  );
};
