import { api } from "./client";
import type {
  Organization,
  OrgDetail,
  OrgChartData,
  OrgMetrics,
  OrgTimelineEvent,
  CreateOrgRequest,
} from "./types";

export async function listOrgs(): Promise<Organization[]> {
  return api.get<Organization[]>("/api/orgs");
}

export async function getOrg(id: string): Promise<OrgDetail> {
  return api.get<OrgDetail>(`/api/orgs/${id}`);
}

export async function getOrgChart(slug: string): Promise<OrgChartData> {
  return api.get<OrgChartData>(`/api/orgs/${slug}/orgchart`);
}

export async function getOrgMetrics(slug: string): Promise<OrgMetrics> {
  return api.get<OrgMetrics>(`/api/orgs/${slug}/metrics`);
}

export async function getOrgTimeline(slug: string): Promise<OrgTimelineEvent[]> {
  return api.get<OrgTimelineEvent[]>(`/api/orgs/${slug}/timeline`);
}

export async function createOrg(data: CreateOrgRequest): Promise<Organization> {
  return api.post<Organization>("/api/orgs", data);
}
