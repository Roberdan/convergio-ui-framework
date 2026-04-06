/**
 * Night-agents types — mirrors convergio-night-agents Rust crate types.
 * See daemon/crates/convergio-night-agents/src/types.rs for source of truth.
 */

/* ── Agent definitions ── */

export interface NightAgentDef {
  id: number;
  name: string;
  org_id?: string;
  description?: string;
  schedule: string;
  agent_prompt: string;
  model: string;
  enabled: boolean;
  max_runtime_secs: number;
  created_at: string;
  updated_at: string;
}

export interface NightAgentDefInput {
  name: string;
  org_id?: string;
  description?: string;
  schedule: string;
  agent_prompt: string;
  model?: string;
  max_runtime_secs?: number;
}

/* ── Runs ── */

export type RunStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface NightRun {
  id: number;
  agent_def_id: number;
  status: RunStatus;
  node_name?: string;
  pid?: number;
  started_at?: string;
  completed_at?: string;
  outcome?: string;
  error_message?: string;
  tokens_used: number;
  cost_usd: number;
  worktree_path?: string;
}

/* ── Tracked projects ── */

export interface TrackedProject {
  id: number;
  name: string;
  repo_path: string;
  remote_url?: string;
  last_scan_at?: string;
  last_scan_hash?: string;
  scan_profile_json?: string;
  enabled: boolean;
  created_at: string;
}

export interface TrackedProjectInput {
  name: string;
  repo_path: string;
  remote_url?: string;
}
