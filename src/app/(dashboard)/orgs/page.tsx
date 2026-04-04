import { MnBadge } from '@/components/maranello';

export const metadata = { title: 'Organizations — Convergio' };

export default function OrgsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Organizations</h1>
        <MnBadge tone="info">Coming in Fase 2</MnBadge>
      </div>
      <p className="text-muted-foreground">
        Org CRUD, orgchart, inter-org delegation, budget management.
      </p>
    </div>
  );
}
