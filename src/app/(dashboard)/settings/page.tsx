import { MnBadge } from '@/components/maranello';

export const metadata = { title: 'Settings — Convergio' };

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Settings</h1>
        <MnBadge tone="info">Coming in Fase 9</MnBadge>
      </div>
      <p className="text-muted-foreground">
        Configuration, extensions, dependency graph, security and RBAC.
      </p>
    </div>
  );
}
