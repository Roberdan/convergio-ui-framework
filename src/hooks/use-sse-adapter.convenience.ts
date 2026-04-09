"use client"

import { useSSEAdapter, type SSEEvent } from "./use-sse-adapter"
import type { Brain3DNode, Brain3DEdge } from "@/components/maranello/agentic/mn-brain-3d.types"
import type { TraceStep } from "@/components/maranello/agentic/mn-agent-trace"
import type { HubSpokeHub, HubSpokeSpoke } from "@/components/maranello/agentic/mn-hub-spoke"
import type { ApprovalStep } from "@/components/maranello/agentic/mn-approval-chain"
import type { Mission } from "@/components/maranello/agentic/mn-active-missions"

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

type MapFn<T> = (event: SSEEvent, current: T) => T

function asArray<I>(value: unknown): I[] {
  return Array.isArray(value) ? (value as I[]) : []
}

function pluck<T>(raw: unknown, key: string): T | undefined {
  if (typeof raw === "object" && raw !== null && key in raw) {
    return (raw as Record<string, unknown>)[key] as T
  }
  return undefined
}

// ---------------------------------------------------------------------------
// Brain3D
// ---------------------------------------------------------------------------

interface Brain3DData {
  nodes: Brain3DNode[]
  edges: Brain3DEdge[]
}

const BRAIN3D_INITIAL: Brain3DData = { nodes: [], edges: [] }

const defaultBrain3DMap: MapFn<Brain3DData> = (event) => ({
  nodes: asArray<Brain3DNode>(pluck(event.data, "nodes")) ?? [],
  edges: asArray<Brain3DEdge>(pluck(event.data, "edges")) ?? [],
})

export function useBrain3DLive(url: string | null, mapEvent?: MapFn<Brain3DData>) {
  return useSSEAdapter<Brain3DData>({
    url,
    initialData: BRAIN3D_INITIAL,
    mapEvent: mapEvent ?? defaultBrain3DMap,
  })
}

// ---------------------------------------------------------------------------
// Agent Trace
// ---------------------------------------------------------------------------

interface AgentTraceData {
  steps: TraceStep[]
}

const TRACE_INITIAL: AgentTraceData = { steps: [] }

const defaultTraceMap: MapFn<AgentTraceData> = (event) => ({
  steps: asArray<TraceStep>(pluck(event.data, "steps")) ?? [],
})

export function useAgentTraceLive(url: string | null, mapEvent?: MapFn<AgentTraceData>) {
  return useSSEAdapter<AgentTraceData>({
    url,
    initialData: TRACE_INITIAL,
    mapEvent: mapEvent ?? defaultTraceMap,
  })
}

// ---------------------------------------------------------------------------
// Hub & Spoke
// ---------------------------------------------------------------------------

interface HubSpokeData {
  hub: HubSpokeHub
  spokes: HubSpokeSpoke[]
}

const HUB_SPOKE_INITIAL: HubSpokeData = {
  hub: { label: "", status: "offline" },
  spokes: [],
}

const defaultHubSpokeMap: MapFn<HubSpokeData> = (event) => ({
  hub: (pluck<HubSpokeHub>(event.data, "hub") ?? HUB_SPOKE_INITIAL.hub),
  spokes: asArray<HubSpokeSpoke>(pluck(event.data, "spokes")) ?? [],
})

export function useHubSpokeLive(url: string | null, mapEvent?: MapFn<HubSpokeData>) {
  return useSSEAdapter<HubSpokeData>({
    url,
    initialData: HUB_SPOKE_INITIAL,
    mapEvent: mapEvent ?? defaultHubSpokeMap,
  })
}

// ---------------------------------------------------------------------------
// Approval Chain
// ---------------------------------------------------------------------------

interface ApprovalChainData {
  steps: ApprovalStep[]
}

const APPROVAL_INITIAL: ApprovalChainData = { steps: [] }

const defaultApprovalMap: MapFn<ApprovalChainData> = (event) => ({
  steps: asArray<ApprovalStep>(pluck(event.data, "steps")) ?? [],
})

export function useApprovalChainLive(url: string | null, mapEvent?: MapFn<ApprovalChainData>) {
  return useSSEAdapter<ApprovalChainData>({
    url,
    initialData: APPROVAL_INITIAL,
    mapEvent: mapEvent ?? defaultApprovalMap,
  })
}

// ---------------------------------------------------------------------------
// Active Missions
// ---------------------------------------------------------------------------

interface ActiveMissionsData {
  missions: Mission[]
}

const MISSIONS_INITIAL: ActiveMissionsData = { missions: [] }

const defaultMissionsMap: MapFn<ActiveMissionsData> = (event) => ({
  missions: asArray<Mission>(pluck(event.data, "missions")) ?? [],
})

export function useActiveMissionsLive(url: string | null, mapEvent?: MapFn<ActiveMissionsData>) {
  return useSSEAdapter<ActiveMissionsData>({
    url,
    initialData: MISSIONS_INITIAL,
    mapEvent: mapEvent ?? defaultMissionsMap,
  })
}
