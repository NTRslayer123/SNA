import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  MapPin,
  GitMerge,
  Coins,
  Home,
  Share2,
  Sparkles,
  FileCheck2,
  Sliders,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const navSections = [
    {
      title: 'LAYER 1: LAND ACQUISITION',
      items: [
        { id: 'dashboard', label: 'National Dashboard', icon: LayoutDashboard },
        { id: 'projects', label: 'Projects Pipeline', icon: FolderGit2, badge: 'Live' },
        { id: 'gis', label: 'Geospatial GIS Map', icon: MapPin },
        { id: 'workflow', label: '10-Stage Workflow', icon: GitMerge },
        { id: 'compensation', label: 'Compensation & DBT', icon: Coins },
        { id: 'rr', label: 'Rehabilitation (R&R)', icon: Home },
      ],
    },
    {
      title: 'LAYER 2: SOCIAL NETWORK ANALYSIS',
      items: [
        { id: 'sna_overview', label: 'SNA Network Topology', icon: Share2, badge: 'Phase 1' },
        { id: 'centrality', label: 'Centrality & Bridges', icon: Sliders },
        { id: 'ai_delay', label: 'AI Delay Predictor', icon: Sparkles, badge: 'ML' },
      ],
    },
    {
      title: 'GOVERNANCE & AUDIT',
      items: [
        { id: 'documents', label: 'Statutory Documents', icon: FileCheck2 },
      ],
    },
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px 14px',
      minHeight: 'calc(100vh - 74px)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {navSections.map((section, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              paddingLeft: '12px',
              marginBottom: '4px',
            }}>
              {section.title}
            </span>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--border-active)' : 'transparent',
                    background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                    color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--bg-surface-elevated)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span style={{
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)',
                      background: item.badge === 'Live' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                      color: item.badge === 'Live' ? '#34D399' : '#C084FC',
                      fontWeight: 600,
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer link to interactive API docs */}
      <div style={{
        padding: '12px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>FastAPI OpenAPI</span>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Interactive Swagger UI</p>
          </div>
          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noreferrer"
            style={{
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </aside>
  );
};
