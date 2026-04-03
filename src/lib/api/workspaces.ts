import { api } from "./client";
import type {
  Workspace,
  WorkspaceDetail,
  CreateWorkspaceRequest,
  Deliverable,
  Repository,
  CreateRepositoryRequest,
  ProjectTreeNode,
} from "./types-workspaces";

export async function listWorkspaces(): Promise<Workspace[]> {
  return api.get<Workspace[]>("/api/workspace/list");
}

export async function createWorkspace(
  data: CreateWorkspaceRequest,
): Promise<Workspace> {
  return api.post<Workspace>("/api/workspace/create", data);
}

export async function getWorkspaceStatus(
  workspaceId: string,
): Promise<WorkspaceDetail> {
  return api.get<WorkspaceDetail>(`/api/workspace/status/${workspaceId}`);
}

export async function getDeliverables(): Promise<Deliverable[]> {
  return api.get<Deliverable[]>("/api/workspace/deliverables");
}

export async function listRepositories(): Promise<Repository[]> {
  return api.get<Repository[]>("/api/repositories");
}

export async function createRepository(
  data: CreateRepositoryRequest,
): Promise<Repository> {
  return api.post<Repository>("/api/repositories", data);
}

export async function getRepository(name: string): Promise<Repository> {
  return api.get<Repository>(`/api/repositories/${name}`);
}

export async function getProjectTree(
  id: string,
): Promise<ProjectTreeNode[]> {
  return api.get<ProjectTreeNode[]>(`/api/project/${id}/tree`);
}
