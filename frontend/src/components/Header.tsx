import React from 'react';
import { RefreshCw, Layers, Bell } from 'lucide-react';
import type { HealthResponse } from '../types';

interface HeaderProps {
  health: HealthResponse | null;
  loading: boolean;
  onRefresh: () => void;
  activeLayer: 'ALL' | 'LAYER_1' | 'LAYER_2';
  setActiveLayer: (layer: 'ALL' | 'LAYER_1' | 'LAYER_2') => void;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  loading,
  onRefresh,
  activeLayer,
  setActiveLayer,
}) => {
  const isHealthy = health?.status === 'healthy' && health?.database?.status === 'connected';

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

      {/* Connectivity & Diagnostic Badge */}
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

        {/* Notifications & User Pill */}
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
        }}>
          <Bell size={16} />
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 10px 4px 6px',
          background: 'var(--bg-surface-elevated)',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 700,
            color: '#FFFFFF',
          }}>
            NA
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
              National Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
