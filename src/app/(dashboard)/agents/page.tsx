import { MnBadge } from '@/components/maranello';

export const metadata = { title: 'Agents — Convergio' };

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Agents</h1>
        <MnBadge tone="info">Coming in Fase 3</MnBadge>
      </div>
      <p className="text-muted-foreground">
        Agent runtime, heartbeat, delegation chains, spawn/kill controls.
      </p>
    </div>
  );
}
