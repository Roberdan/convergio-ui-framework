# Hooks

| Hook | What | Use when |
|------|------|----------|
| `useApiQuery` | SWR-like poller with `pollInterval` | Fetching REST data |
| `useEventSource` | SSE stream with auto-reconnect | Raw SSE consumption |
| `useSSEAdapter` | Reducer-based SSE state accumulation | Typed SSE → state |
| `useBrain3DLive` | SSE → Brain3D nodes/edges | 3D network viz |
| `useAgentTraceLive` | SSE → AgentTrace steps | Agent activity trace |
| `useHubSpokeLive` | SSE → HubSpoke hub/spokes | Hub-spoke topology |
| `useApprovalChainLive` | SSE → ApprovalChain steps | Approval workflows |
| `useActiveMissionsLive` | SSE → ActiveMissions missions | Mission monitoring |

Backend URL from `src/lib/env.ts`: server=`API_URL`, client=`NEXT_PUBLIC_API_URL`.
