export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'error';
  service: string;
  version: string;
  environment: string;
  database: {
    status: 'connected' | 'disconnected' | 'error';
    engine: 'postgresql' | 'sqlite';
    error: string | null;
  };
  statistics: {
    projects: number;
    parcels: number;
    stakeholder_interactions: number;
  };
  timestamp: string;
}

export interface SystemInfo {
  system: string;
  department: string;
  problem_statement_id: string;
  layers: {
    layer_1_land_acquisition: {
      name: string;
      status: string;
      subsystems: string[];
    };
    layer_2_sna: {
      name: string;
      status: string;
      subsystems: string[];
    };
  };
  statutory_act: string;
  timestamp: string;
}

export interface UserProfileResponse {
  user_id: string;
  email: string;
  full_name: string;
  role_id: string;
  designation?: string | null;
  phone_number?: string | null;
  state_id: string | null;
  district_id: string | null;
  is_active: boolean;
}

export interface DemoUser {
  email: string;
  full_name: string;
  role_id: string;
  role_name: string;
  description: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  role_id: string;
  designation?: string;
  phone_number?: string;
  state_id?: string;
  district_id?: string;
}

export interface StatutoryRole {
  role_id: string;
  role_name: string;
  description?: string;
}

export interface ProjectMilestone {
  milestone_id: string;
  stage_id: string;
  stage_order: number;
  title: string;
  statutory_sla_days: number;
  target_date: string | null;
  completed_date: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
  remarks?: string | null;
}

export interface StakeholderInteractionEvent {
  interaction_id: string;
  timestamp: string;
  source_stakeholder: string;
  target_stakeholder: string;
  interaction_type: string;
  workflow_stage: string;
  state: string;
  district: string;
  duration_hours: number;
}

export interface ProjectItem {
  project_id: string;
  project_name: string;
  project_code: string;
  category: string;
  sponsoring_agency: string;
  state_id: string | null;
  district_id: string | null;
  estimated_cost_inr: number;
  total_area_hectares: number;
  current_stage: string;
  delay_risk_status: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  created_at?: string;
  updated_at?: string;
  milestones_total: number;
  milestones_completed: number;
  progress_percentage: number;
  active_milestone_title?: string | null;
  active_milestone_target?: string | null;
}

export interface ProjectDetail extends ProjectItem {
  milestones: ProjectMilestone[];
  recent_interactions: StakeholderInteractionEvent[];
}

export interface ProjectStatistics {
  total_projects: number;
  total_area_hectares: number;
  total_estimated_cost_inr: number;
  total_estimated_cost_cr: number;
  stage_breakdown: Record<string, number>;
  category_breakdown: Record<string, number>;
  risk_breakdown: Record<string, number>;
}

