/**
 * Types for the Night Agents dashboard.
 * Maps to daemon API: /api/night-agents/*
 */

export interface NightAgentDef {
  id: number;
  name: string;
  org_id: string | null;
  description: string | null;
  schedule: string;
  model: string;
  enabled: boolean;
  max_runtime_secs: number;
  created_at: string;
  updated_at: string;
  last_status: string | null;
  last_run_at: string | null;
}

export interface NightAgentRun {
  run_id: number;
  agent_def_id: number;
  agent_name: string;
  status: string;
  node_name: string | null;
  pid: number | null;
  started_at: string | null;
}

export interface TrackedProject {
  id: number;
  name: string;
  repo_path: string;
  remote_url: string | null;
  last_scan_at: string | null;
  last_scan_hash: string | null;
  enabled: boolean;
  created_at: string;
}
