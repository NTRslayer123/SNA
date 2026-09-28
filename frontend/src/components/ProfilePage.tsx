import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Phone,
  Mail,
  RefreshCw,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
  BadgeCheck,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PRESET_STATES, getDistrictsForState, getStateName, getDistrictName } from '../data/jurisdictions';

interface ProfilePageProps {
  onOpenLogin?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onOpenLogin }) => {
  const { user, token, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [stateId, setStateId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fetchProfile = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFullName(data.full_name || '');
        setDesignation(data.designation || '');
        setPhoneNumber(data.phone_number || '');
        setStateId(data.state_id || '');
        setDistrictId(data.district_id || '');
        setRoleName(data.role_name || data.role_id);
        setRoleDescription(data.role_description || '');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileStateChange = (newState: string) => {
    setStateId(newState);
    const districts = getDistrictsForState(newState);
    if (districts.length > 0) {
      setDistrictId(districts[0].district_id);
    } else {
      setDistrictId('');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    // Password validation if attempting password change
    if (newPassword) {
      if (!currentPassword) {
        setErrorMsg('Please enter your current password to set a new password.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('New password and confirm password do not match.');
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters long.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload: Record<string, string> = {
        full_name: fullName,
        designation: designation,
        phone_number: phoneNumber,
        state_id: stateId,
        district_id: districtId,
      };

      if (newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      const res = await fetch('/api/v1/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        setFullName(updated.full_name);
        setDesignation(updated.designation || '');
        setPhoneNumber(updated.phone_number || '');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccessMsg('Private profile and statutory credentials updated successfully.');
        updateUser({
          full_name: updated.full_name,
          designation: updated.designation,
          phone_number: updated.phone_number,
          state_id: updated.state_id,
          district_id: updated.district_id,
        });
      } else {
        const err = await res.json();
        setErrorMsg(err.detail || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Update error:', err);
      setErrorMsg('Network error occurred while updating profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="glass-panel" style={{
        padding: '48px 32px',
        textAlign: 'center',
        maxWidth: '560px',
        margin: '40px auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        border: '1px solid var(--border-active)',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(14, 165, 233, 0.15)',
          border: '1px solid rgba(14, 165, 233, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-cyan)',
        }}>
          <Shield size={28} />
        </div>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Statutory Stakeholder Profile Access
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px', lineHeight: 1.5 }}>
            Please authenticate using your official statutory credentials or switch to any of the 8 pre-seeded statutory authorities to view and manage private jurisdiction and profile details.
          </p>
        </div>
        {onOpenLogin && (
          <button
            onClick={onOpenLogin}
            className="btn btn-primary"
            style={{ marginTop: '8px', padding: '10px 22px', fontSize: '13px' }}
          >
            <LogIn size={15} />
            Sign In / Switch Role
          </button>
        )}
      </div>
    );
  }

  if (loading && !fullName) {
    return (
      <div className="glass-panel" style={{
        padding: '60px 20px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
      }}>
        <RefreshCw size={20} className="spin" color="var(--accent-cyan)" />
        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading statutory profile details...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '24px',
        borderLeft: '4px solid var(--accent-emerald)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: 800,
            color: '#FFFFFF',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
          }}>
            {user.full_name ? user.full_name[0] : 'U'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {fullName || user.full_name}
              </h2>
              <span className="badge badge-emerald">
                <BadgeCheck size={13} /> VERIFIED STAKEHOLDER
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {designation || roleName} • {user.email}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-cyan">{user.role_id}</span>
          <span className="badge badge-purple">{getDistrictName(districtId) || getStateName(stateId) || 'National Jurisdiction'}</span>
        </div>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#34D399',
          fontSize: '13px',
        }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#F87171',
          fontSize: '13px',
        }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {/* Card 1: Official & Personal Information */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Official Identification & Contact
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
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

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Designation / Post
                </label>
                <input
                  type="text"
                  placeholder="e.g. District Magistrate & Competent Authority"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
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

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Official Email Address (Immutable Identity)
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 34px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      cursor: 'not-allowed',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Contact Telephone / Mobile
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 34px',
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
            </div>
          </div>

          {/* Card 2: Jurisdiction & Statutory Powers */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="var(--accent-purple)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Statutory Authority & Jurisdiction
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Statutory Institutional Role
                </label>
                <input
                  type="text"
                  disabled
                  value={`${roleName} (${user.role_id})`}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    cursor: 'not-allowed',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Statutory Mandate (RFCTLARR Act 2013)
                </label>
                <div style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}>
                  {roleDescription || 'Competent Authority prescribed under statutory land acquisition rules with judicial and administrative execution powers.'}
                </div>
              </div>

              {/* Preset State & District Selectors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    State / Territory
                  </label>
                  <select
                    value={stateId || 'KA'}
                    onChange={(e) => handleProfileStateChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-elevated)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
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
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Statutory District
                  </label>
                  <select
                    value={districtId}
                    onChange={(e) => setDistrictId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-elevated)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  >
                    {getDistrictsForState(stateId || 'KA').map((dst) => (
                      <option key={dst.district_id} value={dst.district_id} style={{ background: '#0F172A', color: '#FFFFFF' }}>
                        {dst.district_name} ({dst.district_id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Security & Password Management */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <KeyRound size={18} color="var(--accent-amber)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Security & Password Update
              </h3>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Leave blank if not changing password
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Current Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 34px',
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
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 34px',
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
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 34px',
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
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ padding: '10px 24px', fontSize: '14px' }}
          >
            <Save size={16} />
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
