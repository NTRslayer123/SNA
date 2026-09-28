import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderGit2,
  Plus,
  Search,
  Layers,
  Clock,
  X,
  RefreshCw,
  ChevronRight,
  Building2,
  Coins,
  MapPin,
  Map,
  GitMerge,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PRESET_STATES, getDistrictsForState, getStateById } from '../data/jurisdictions';
import type { ProjectItem, ProjectDetail, ProjectStatistics } from '../types';

interface ProjectsViewProps {
  onOpenGis?: (projectId: string) => void;
  onOpenWorkflow?: (projectId: string) => void;
}

const STAGE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  STAGE_PROPOSAL: { label: '1. Requisition / DPR', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.12)' },
  STAGE_SCRUTINY: { label: '2. Joint Scrutiny', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.12)' },
  STAGE_APPROVAL: { label: '3. Admin Sanction', color: '#818CF8', bg: 'rgba(129, 140, 248, 0.12)' },
  STAGE_SEC11_NOTIF: { label: '4. Sec 11 Notification', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
  STAGE_SEC19_DECL: { label: '5. Sec 19 Declaration', color: '#FB923C', bg: 'rgba(251, 146, 60, 0.12)' },
  STAGE_AWARD: { label: '6. Sec 23/30 Award', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.12)' },
  STAGE_COMPENSATION: { label: '7. Compensation DBT', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.12)' },
  STAGE_POSSESSION: { label: '8. Sec 38 Possession', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
  STAGE_RR_EXECUTION: { label: '9. R&R Resettlement', color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.12)' },
  STAGE_CLOSURE: { label: '10. RoR Mutation & Close', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.12)' },
};

const RISK_BADGES: Record<string, { label: string; color: string; border: string; bg: string }> = {
  LOW: { label: 'Low Delay Risk', color: '#10B981', border: 'rgba(16, 185, 129, 0.3)', bg: 'rgba(16, 185, 129, 0.1)' },
  MEDIUM: { label: 'Moderate Risk', color: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)', bg: 'rgba(245, 158, 11, 0.1)' },
  HIGH: { label: 'High Delay Risk', color: '#EF4444', border: 'rgba(239, 68, 68, 0.3)', bg: 'rgba(239, 68, 68, 0.1)' },
  CRITICAL: { label: 'Critical Bottleneck', color: '#F43F5E', border: 'rgba(244, 63, 94, 0.4)', bg: 'rgba(244, 63, 94, 0.15)' },
};

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onOpenGis, onOpenWorkflow }) => {
  const { user } = useAuth();

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [statistics, setStatistics] = useState<ProjectStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [selectedRisk, setSelectedRisk] = useState<string>('');

  // Selected project for detail modal / drawer
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectDetail, setProjectDetail] = useState<ProjectDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // New Requisition Modal
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Form fields for new project
  const [formName, setFormName] = useState<string>('');
  const [formCode, setFormCode] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('Highway');
  const [formAgency, setFormAgency] = useState<string>('National Highways Authority of India (NHAI)');
  const [formState, setFormState] = useState<string>('KA');
  const [formDistrict, setFormDistrict] = useState<string>('KA-BLRU');
  const [formCostCr, setFormCostCr] = useState<string>('1250');
  const [formAreaHa, setFormAreaHa] = useState<string>('240.5');

  const fetchProjectsAndStats = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [projRes, statsRes] = await Promise.all([
        fetch('/api/v1/projects'),
        fetch('/api/v1/projects/statistics'),
      ]);

      if (projRes.ok) {
        const data = await projRes.json();
        setProjects(data);
      } else {
        setFetchError('Failed to retrieve project pipeline.');
      }

      if (statsRes.ok) {
        const stats = await statsRes.json();
        setStatistics(stats);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setFetchError('Network communication failure connecting to Projects API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsAndStats();
  }, []);

  const openProjectDetail = async (projectId: string) => {
    setSelectedProjectId(projectId);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProjectDetail(data);
      }
    } catch (err) {
      console.error('Error loading project details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAdvanceStage = async (nextStage: string) => {
    if (!selectedProjectId) return;
    try {
      const res = await fetch(`/api/v1/projects/${selectedProjectId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          next_stage: nextStage,
          action_note: `Statutory transition executed by stakeholder: ${user?.full_name || 'System Admin'}`,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProjectDetail(updated);
        // Refresh master list
        fetchProjectsAndStats();
      }
    } catch (err) {
      console.error('Stage transition error:', err);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);

    const costInr = parseFloat(formCostCr) * 10000000;
    const areaHa = parseFloat(formAreaHa);

    if (isNaN(costInr) || costInr <= 0 || isNaN(areaHa) || areaHa <= 0) {
      setCreateError('Please enter valid positive numbers for estimated cost and land area.');
      setCreateLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: formName,
          project_code: formCode,
          category: formCategory,
          sponsoring_agency: formAgency,
          state_id: formState,
          district_id: formDistrict,
          estimated_cost_inr: costInr,
          total_area_hectares: areaHa,
          initial_stage: 'STAGE_PROPOSAL',
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Requisition creation failed');
      }

      setShowCreateModal(false);
      // Reset form
      setFormName('');
      setFormCode('');
      fetchProjectsAndStats();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to submit requisition');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleFormStateChange = (stId: string) => {
    setFormState(stId);
    const districts = getDistrictsForState(stId);
    if (districts.length > 0) {
      setFormDistrict(districts[0].district_id);
    } else {
      setFormDistrict('');
    }
  };

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.project_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sponsoring_agency.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesState = !selectedState || p.state_id === selectedState;
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      const matchesStage = !selectedStage || p.current_stage === selectedStage;
      const matchesRisk = !selectedRisk || p.delay_risk_status === selectedRisk;

      return matchesSearch && matchesState && matchesCategory && matchesStage && matchesRisk;
    });
  }, [projects, searchQuery, selectedState, selectedCategory, selectedStage, selectedRisk]);

  const availableDistricts = useMemo(() => {
    return getDistrictsForState(formState);
  }, [formState]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Viewport Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
              National Land Acquisition Projects Pipeline
            </h1>
            <span className="badge badge-cyan">Week 3: Projects & Milestones</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Lifecycle monitoring of statutory requisitions, 10-stage milestones, and statutory clock compliance under RFCTLARR Act 2013.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchProjectsAndStats}
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '8px 14px' }}
            title="Refresh Projects"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
            style={{ fontSize: '12px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} />
            Submit Land Requisition
          </button>
        </div>
      </div>

      {fetchError && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid var(--accent-rose)',
          color: 'var(--accent-rose)',
          fontSize: '13px',
        }}>
          {fetchError}
        </div>
      )}

      {/* Macro Statistics KPI Cards */}
      {statistics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(56, 189, 248, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)',
            }}>
              <FolderGit2 size={24} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Monitored Projects
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {statistics.total_projects}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', marginTop: '2px' }}>
                100% Digital Requisitions
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-emerald)',
            }}>
              <Layers size={24} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Land Requisitioned
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {statistics.total_area_hectares.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>Ha</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Across {Object.keys(statistics.category_breakdown).length} Infrastructure Sectors
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-amber)',
            }}>
              <Coins size={24} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Acquisition Capital
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                ₹{statistics.total_estimated_cost_cr.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>Cr</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Estimated Land Outlay
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(129, 140, 248, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818CF8',
            }}>
              <Clock size={24} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                SLA Compliance Clock
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                94.2%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', marginTop: '2px' }}>
                Within Statutory Deadlines
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 18px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '12px',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 300px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by project name, corridor code, or agency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* State Filter */}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              outline: 'none',
            }}
          >
            <option value="" style={{ background: '#0F172A', color: '#FFF' }}>All States / UTs</option>
            {PRESET_STATES.map((st) => (
              <option key={st.state_id} value={st.state_id} style={{ background: '#0F172A', color: '#FFF' }}>
                {st.state_name} ({st.state_id})
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              outline: 'none',
            }}
          >
            <option value="" style={{ background: '#0F172A', color: '#FFF' }}>All Sectors</option>
            <option value="Highway" style={{ background: '#0F172A', color: '#FFF' }}>Highway</option>
            <option value="Railway" style={{ background: '#0F172A', color: '#FFF' }}>Railway</option>
            <option value="Energy" style={{ background: '#0F172A', color: '#FFF' }}>Energy</option>
            <option value="Urban Transit" style={{ background: '#0F172A', color: '#FFF' }}>Urban Transit</option>
            <option value="Port & Shipping" style={{ background: '#0F172A', color: '#FFF' }}>Port & Shipping</option>
            <option value="Industrial Corridor" style={{ background: '#0F172A', color: '#FFF' }}>Industrial Corridor</option>
          </select>

          {/* Stage Filter */}
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              outline: 'none',
            }}
          >
            <option value="" style={{ background: '#0F172A', color: '#FFF' }}>All 10 Stages</option>
            {Object.entries(STAGE_LABELS).map(([k, v]) => (
              <option key={k} value={k} style={{ background: '#0F172A', color: '#FFF' }}>
                {v.label}
              </option>
            ))}
          </select>

          {/* Risk Filter */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              outline: 'none',
            }}
          >
            <option value="" style={{ background: '#0F172A', color: '#FFF' }}>All Risk Tiers</option>
            <option value="LOW" style={{ background: '#0F172A', color: '#FFF' }}>Low Delay Risk</option>
            <option value="MEDIUM" style={{ background: '#0F172A', color: '#FFF' }}>Moderate Delay Risk</option>
            <option value="HIGH" style={{ background: '#0F172A', color: '#FFF' }}>High Delay Risk</option>
          </select>

          {(searchQuery || selectedState || selectedCategory || selectedStage || selectedRisk) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedState('');
                setSelectedCategory('');
                setSelectedStage('');
                setSelectedRisk('');
              }}
              className="btn btn-secondary"
              style={{ fontSize: '11px', padding: '6px 10px' }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          <RefreshCw size={28} className="spin" style={{ margin: '0 auto 12px', display: 'block', color: 'var(--accent-cyan)' }} />
          Loading statutory project pipeline...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}>
          <FolderGit2 size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>No matching infrastructure projects found</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Adjust your search query or filters, or submit a new project requisition.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '18px' }}>
          {filteredProjects.map((p) => {
            const stageMeta = STAGE_LABELS[p.current_stage] || { label: p.current_stage, color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.1)' };
            const riskMeta = RISK_BADGES[p.delay_risk_status] || RISK_BADGES.LOW;
            const stateObj = p.state_id ? getStateById(p.state_id) : null;
            const costCr = (p.estimated_cost_inr / 10000000).toLocaleString(undefined, { maximumFractionDigits: 1 });

            return (
              <div
                key={p.project_id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  position: 'relative',
                  transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                }}
                onClick={() => openProjectDetail(p.project_id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'var(--border-active)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Card Top: Code, Sector & Risk Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--accent-cyan)',
                      background: 'rgba(56, 189, 248, 0.08)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      {p.project_code}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-surface-elevated)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      {p.category}
                    </span>
                  </div>

                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: riskMeta.color,
                    background: riskMeta.bg,
                    border: `1px solid ${riskMeta.border}`,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    {riskMeta.label}
                  </span>
                </div>

                {/* Project Title & Sponsoring Agency */}
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                    {p.project_name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '5px' }}>
                    <Building2 size={13} color="var(--text-muted)" />
                    <span>{p.sponsoring_agency}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-cyan)', marginTop: '3px' }}>
                    <MapPin size={13} />
                    <span>{p.district_id || 'District N/A'}, {stateObj?.state_name || p.state_id || 'India'}</span>
                  </div>
                </div>

                {/* Statutory Stage Pill */}
                <div style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: stageMeta.bg,
                  border: `1px solid ${stageMeta.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} color={stageMeta.color} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: stageMeta.color }}>
                      {stageMeta.label}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: stageMeta.color }}>
                    Stage {p.milestones_completed + 1} of 10
                  </span>
                </div>

                {/* 10-Milestone Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                    <span>Statutory Progress</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.progress_percentage}% ({p.milestones_completed}/10 Milestones)</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${p.progress_percentage}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-emerald))',
                        borderRadius: '3px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Land Area and Budget Outlay */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border-subtle)',
                }}>
                  <div>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Land Area
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {p.total_area_hectares.toLocaleString()} <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Ha</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Acquisition Outlay
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      ₹{costCr} <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Cr</span>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--accent-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    Inspect Milestones & Workflow
                    <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Detail & Statutory Stepper Drawer/Modal */}
      {selectedProjectId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedProjectId(null);
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-active)',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: '860px',
              maxHeight: 'min(720px, calc(100vh - 40px))',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
              animation: 'modalSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg-surface-elevated)',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--accent-cyan)',
                    background: 'rgba(56, 189, 248, 0.1)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    {projectDetail?.project_code || 'Loading...'}
                  </span>
                  <span className="badge badge-emerald">Statutory Milestone Clock Active</span>
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {projectDetail?.project_name || 'Project Details'}
                </h2>
              </div>
              <button
                onClick={() => setSelectedProjectId(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {loadingDetail || !projectDetail ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  <RefreshCw size={24} className="spin" style={{ margin: '0 auto 10px', display: 'block', color: 'var(--accent-cyan)' }} />
                  Retrieving statutory milestones & audit logs...
                </div>
              ) : (
                <>
                  {/* Overview Quick Stats */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '12px',
                    background: 'var(--bg-surface-elevated)',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <div>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Sector</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{projectDetail.category}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Agency</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{projectDetail.sponsoring_agency}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Acreage</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{projectDetail.total_area_hectares} Ha</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Outlay</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                        ₹{(projectDetail.estimated_cost_inr / 10000000).toLocaleString()} Cr
                      </div>
                    </div>
                  </div>

                  {/* 10 Statutory Milestones Stepper */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} color="var(--accent-cyan)" />
                        10-Stage Statutory Milestone Progression (RFCTLARR Act 2013)
                      </h3>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {projectDetail.milestones_completed} of 10 Completed
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {projectDetail.milestones.map((m) => {
                        const isDone = m.status === 'COMPLETED';
                        const isCurrent = m.status === 'IN_PROGRESS';

                        let statusColor = '#94A3B8';
                        let statusBg = 'var(--bg-surface-elevated)';
                        let statusBorder = 'var(--border-subtle)';

                        if (isDone) {
                          statusColor = '#10B981';
                          statusBg = 'rgba(16, 185, 129, 0.08)';
                          statusBorder = 'rgba(16, 185, 129, 0.3)';
                        } else if (isCurrent) {
                          statusColor = '#38BDF8';
                          statusBg = 'rgba(56, 189, 248, 0.12)';
                          statusBorder = 'rgba(56, 189, 248, 0.4)';
                        }

                        return (
                          <div
                            key={m.milestone_id}
                            style={{
                              padding: '12px 16px',
                              borderRadius: 'var(--radius-md)',
                              background: statusBg,
                              border: `1px solid ${statusBorder}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: statusColor,
                                color: '#0F172A',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 800,
                              }}>
                                {isDone ? '✓' : m.stage_order}
                              </div>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                  {m.title}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                  Statutory SLA: {m.statutory_sla_days} Days
                                  {m.target_date && ` • Deadline: ${new Date(m.target_date).toLocaleDateString()}`}
                                  {m.completed_date && ` • Completed: ${new Date(m.completed_date).toLocaleDateString()}`}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                color: statusColor,
                                background: 'var(--bg-surface)',
                                padding: '3px 8px',
                                borderRadius: 'var(--radius-sm)',
                                border: `1px solid ${statusColor}40`,
                              }}>
                                {m.status}
                              </span>

                              {isCurrent && (
                                <button
                                  onClick={() => {
                                    const nextIdx = projectDetail.milestones.findIndex(x => x.milestone_id === m.milestone_id) + 1;
                                    if (nextIdx < projectDetail.milestones.length) {
                                      handleAdvanceStage(projectDetail.milestones[nextIdx].stage_id);
                                    }
                                  }}
                                  className="btn btn-primary"
                                  style={{ fontSize: '11px', padding: '5px 10px' }}
                                >
                                  Advance Stage
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Organic SNA Interaction Audit Log */}
                  {projectDetail.recent_interactions && projectDetail.recent_interactions.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
                        Organic Stakeholder Interaction Audit Trail (SNA Pipeline)
                      </h3>
                      <div style={{
                        background: 'var(--bg-surface-elevated)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        overflow: 'hidden',
                      }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                          <thead>
                            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                              <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Timestamp</th>
                              <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Source Stakeholder</th>
                              <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Target Stakeholder</th>
                              <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Action Type</th>
                              <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Stage</th>
                            </tr>
                          </thead>
                          <tbody>
                            {projectDetail.recent_interactions.map((int) => (
                              <tr key={int.interaction_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                                  {new Date(int.timestamp).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {int.source_stakeholder}
                                </td>
                                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>
                                  {int.target_stakeholder}
                                </td>
                                <td style={{ padding: '8px 12px' }}>
                                  <span style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '11px',
                                    color: 'var(--accent-cyan)',
                                    background: 'rgba(56, 189, 248, 0.1)',
                                    padding: '2px 6px',
                                    borderRadius: '3px',
                                  }}>
                                    {int.interaction_type}
                                  </span>
                                </td>
                                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', fontSize: '11px' }}>
                                  {int.workflow_stage}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
              background: 'var(--bg-surface)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {onOpenGis && (
                  <button
                    onClick={() => {
                      const pid = selectedProjectId;
                      setSelectedProjectId(null);
                      onOpenGis(pid);
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Map size={13} color="var(--accent-cyan)" />
                    Inspect on GIS Map
                  </button>
                )}
                {onOpenWorkflow && (
                  <button
                    onClick={() => {
                      const pid = selectedProjectId;
                      setSelectedProjectId(null);
                      onOpenWorkflow(pid);
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <GitMerge size={13} color="var(--accent-emerald)" />
                    Open in Workflow
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedProjectId(null)}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '7px 16px' }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Requisition Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false);
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-active)',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: '580px',
              maxHeight: 'min(640px, calc(100vh - 36px))',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
              animation: 'modalSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 22px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg-surface-elevated)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FolderGit2 size={20} color="var(--accent-cyan)" />
                <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Submit Land Requisition / DPR
                </h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleCreateProject} style={{ padding: '20px 22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {createError && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid var(--accent-rose)',
                  color: 'var(--accent-rose)',
                  fontSize: '12px',
                }}>
                  {createError}
                </div>
              )}

              {/* Project Name */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Project / Corridor Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune-Nashik Semi High-Speed Rail Corridor"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Project Code & Sector */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Project Identifier Code <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MRIDC/MH/PUN-NSK/01"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-elevated)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Infrastructure Sector <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-elevated)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  >
                    <option value="Highway">Highway</option>
                    <option value="Railway">Railway</option>
                    <option value="Energy">Energy</option>
                    <option value="Urban Transit">Urban Transit</option>
                    <option value="Port & Shipping">Port & Shipping</option>
                    <option value="Industrial Corridor">Industrial Corridor</option>
                  </select>
                </div>
              </div>

              {/* Sponsoring Agency */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Land Requiring Body / Sponsoring Agency <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Highways Authority of India (NHAI)"
                  value={formAgency}
                  onChange={(e) => setFormAgency(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Cascading State & District Dropdowns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    State / Union Territory <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    value={formState}
                    onChange={(e) => handleFormStateChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-elevated)',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  >
                    {PRESET_STATES.map((st) => (
                      <option key={st.state_id} value={st.state_id} style={{ background: '#0F172A', color: '#FFF' }}>
                        {st.state_name} ({st.state_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    District <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-elevated)',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  >
                    {availableDistricts.map((dst) => (
                      <option key={dst.district_id} value={dst.district_id} style={{ background: '#0F172A', color: '#FFF' }}>
                        {dst.district_name} ({dst.district_id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cost in Cr & Land Area */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Estimated Acquisition Outlay (₹ Cr) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 1450.00"
                    value={formCostCr}
                    onChange={(e) => setFormCostCr(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-elevated)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Total Land Area (Hectares) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 342.5"
                    value={formAreaHa}
                    onChange={(e) => setFormAreaHa(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-elevated)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="btn btn-primary"
                  style={{ fontSize: '12px', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {createLoading ? 'Submitting...' : 'Register Requisition & Create Milestones'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
