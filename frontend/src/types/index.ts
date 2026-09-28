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
