import { MnBadge } from '@/components/maranello';

export const metadata = { title: 'Mesh — Convergio' };

export default function MeshPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Mesh Network</h1>
        <MnBadge tone="info">Coming in Fase 6</MnBadge>
      </div>
      <p className="text-muted-foreground">
        Connected nodes, sync status, schema versions, peer heartbeat.
      </p>
    </div>
  );
}
