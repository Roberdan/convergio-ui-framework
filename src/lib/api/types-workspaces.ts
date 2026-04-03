// Workspace / Project API types

export interface Workspace {
  id: string;
  name: string;
  status: "active" | "inactive" | "archived" | "creating";
  description?: string;
  createdAt: string;
  updatedAt?: string;
  repositoryCount?: number;
}

export interface WorkspaceDetail extends Workspace {
  metadata?: Record<string, unknown>;
}

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
}

export interface Deliverable {
  id: string;
  name: string;
  type: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  workspaceId: string;
  progress?: number;
  createdAt: string;
}

export interface Repository {
  id: string;
  name: string;
  url?: string;
  status: "active" | "syncing" | "error" | "archived";
  language?: string;
  lastSync?: string;
}

export interface CreateRepositoryRequest {
  name: string;
  url?: string;
}

export interface ProjectTreeNode {
  id: string;
  name: string;
  type: "folder" | "file" | "module";
  children?: ProjectTreeNode[];
}

/* ── Aggregated page data ── */

export interface ProjectsPageData {
  workspaces: Workspace[] | null;
  deliverables: Deliverable[] | null;
  repositories: Repository[] | null;
}
