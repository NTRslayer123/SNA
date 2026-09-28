import React from 'react';
import { RefreshCw, Layers, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { HealthResponse } from '../types';

interface HeaderProps {
  health: HealthResponse | null;
  loading: boolean;
  onRefresh: () => void;
  activeLayer: 'ALL' | 'LAYER_1' | 'LAYER_2';
  setActiveLayer: (layer: 'ALL' | 'LAYER_1' | 'LAYER_2') => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  loading,
  onRefresh,
  activeLayer,
  setActiveLayer,
  onOpenLogin,
}) => {
  const { user, logout } = useAuth();
  const isHealthy = health?.status === 'healthy' && health?.database?.status === 'connected';

  const getRoleBadgeColor = (roleId?: string) => {
    switch (roleId) {
      case 'ROLE_NATIONAL_ADMIN':
        return 'badge-cyan';
      case 'ROLE_STATE_OFFICER':
        return 'badge-purple';
      case 'ROLE_CALA_COLLECTOR':
        return 'badge-emerald';
      case 'ROLE_REQUIRING_BODY':
        return 'badge-amber';
      default:
        return 'badge-cyan';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 28px',
      background: 'rgba(14, 22, 38, 0.9)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Brand & Department */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #0EA5E9, #3B82F6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(14, 165, 233, 0.4)',
        }}>
          <Layers size={24} color="#FFFFFF" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              NLAMS
            </h1>
            <span className="badge badge-cyan">PS-26016</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>|</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Smart Automation
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>
            Department of Land Resources (DoLR) • Ministry of Rural Development
          </p>
        </div>
      </div>

      {/* Layer Selector Switch */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-surface-elevated)',
        padding: '3px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
      }}>
        <button
          onClick={() => setActiveLayer('ALL')}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
            background: activeLayer === 'ALL' ? 'var(--accent-cyan)' : 'transparent',
            color: activeLayer === 'ALL' ? '#FFFFFF' : 'var(--text-secondary)',
            transition: 'all 0.2s ease',
          }}
        >
          All Layers
        </button>
        <button
          onClick={() => setActiveLayer('LAYER_1')}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
            background: activeLayer === 'LAYER_1' ? 'var(--accent-cyan)' : 'transparent',
            color: activeLayer === 'LAYER_1' ? '#FFFFFF' : 'var(--text-secondary)',
            transition: 'all 0.2s ease',
          }}
        >
          Layer 1: Land Acquisition
        </button>
        <button
          onClick={() => setActiveLayer('LAYER_2')}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
            background: activeLayer === 'LAYER_2' ? 'var(--accent-purple)' : 'transparent',
            color: activeLayer === 'LAYER_2' ? '#FFFFFF' : 'var(--text-secondary)',
            transition: 'all 0.2s ease',
          }}
        >
          Layer 2: SNA Ecosystem
        </button>
      </div>

      {/* Connectivity & User Session Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--bg-surface-elevated)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div className={isHealthy ? 'pulse-dot pulse-dot-emerald' : 'pulse-dot'} style={{
            backgroundColor: isHealthy ? 'var(--accent-emerald)' : 'var(--accent-ruby)',
          }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: isHealthy ? 'var(--accent-emerald)' : 'var(--accent-ruby)', lineHeight: 1.2 }}>
              {isHealthy ? 'SYSTEM OPERATIONAL' : 'SYSTEM DEGRADED'}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              DB: {health?.database?.engine.toUpperCase() || 'PROBING...'}
            </span>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Re-probe API & Database"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>

        {/* User Session Chip / Sign In Button */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              onClick={onOpenLogin}
              title="Click to Switch Stakeholder Role"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px 4px 6px',
                background: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                color: '#FFFFFF',
              }}>
                {getInitials(user.full_name)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.full_name.split(' ')[0]}
                </span>
                <span className={`badge ${getRoleBadgeColor(user.role_id)}`} style={{ fontSize: '9px', padding: '0 4px' }}>
                  {user.role_id.replace('ROLE_', '')}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-muted)',
                padding: '7px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="btn btn-primary"
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            <LogIn size={14} />
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
