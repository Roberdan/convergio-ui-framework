'use client';

import { useState } from 'react';
import {
  MnCommandPalette, MnHeaderShell, MnSectionNav,
  MnThemeToggle, MnThemeRotary, MnAsyncSelect,
  MnDatePicker, MnProfile,
} from '@/components/maranello';
import { commandItems, sectionNavItems } from './components-data';

function Card({ name, desc, children }: { name: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{name}</h3>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

const agentProvider = async (q: string) => {
  const agents = [
    { id: 'ali', label: 'Ali (Opus 4.6)' },
    { id: 'rex', label: 'Rex (Sonnet 4.6)' },
    { id: 'sara', label: 'Sara (Codex 5.3)' },
    { id: 'luca', label: 'Luca (Haiku 4.5)' },
    { id: 'marco', label: 'Marco (Sonnet 4.6)' },
  ];
  await new Promise((r) => setTimeout(r, 300));
  return agents.filter((a) => a.label.toLowerCase().includes(q.toLowerCase()));
};

export function SectionShell() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [navSection, setNavSection] = useState('overview');
  const [dateVal, setDateVal] = useState('2026-04-01');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card name="mn-command-palette" desc="Fuzzy-searchable command palette with Cmd+K">
        <button onClick={() => setCmdOpen(true)} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">
          Open Command Palette
        </button>
        <MnCommandPalette
          open={cmdOpen}
          onOpenChange={setCmdOpen}
          items={commandItems}
          globalHotkey={false}
        />
      </Card>

      <Card name="mn-header-shell" desc="Application header bar with brand, search, and actions">
        <div className="rounded-lg overflow-hidden border border-border">
          <MnHeaderShell
            sections={[
              { type: 'brand', label: 'Convergio' },
              { type: 'spacer' },
              { type: 'search', placeholder: 'Search agents, plans...', shortcut: '\u2318K' },
              { type: 'divider' },
              { type: 'actions', role: 'post', items: [
                { id: 'health', label: 'Health', title: 'System Health' },
                { id: 'deploy', label: 'Deploy', title: 'Deploy Release' },
              ]},
            ]}
          />
        </div>
      </Card>

      <Card name="mn-section-nav" desc="Prev/next section navigation with position indicator">
        <MnSectionNav
          items={sectionNavItems}
          current={navSection}
          position="top"
          onNavigate={setNavSection}
        />
      </Card>

      <Card name="mn-theme-toggle / mn-theme-rotary" desc="Theme switchers: button and rotary dial">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground">Toggle</span>
            <MnThemeToggle showLabel />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground">Rotary</span>
            <MnThemeRotary size="sm" />
          </div>
        </div>
      </Card>

      <Card name="mn-async-select" desc="Search-as-you-type dropdown with async provider">
        <div className="max-w-xs">
          <MnAsyncSelect
            provider={agentProvider}
            placeholder="Search agents..."
          />
        </div>
      </Card>

      <Card name="mn-date-picker" desc="Calendar date picker with keyboard navigation">
        <div className="max-w-xs">
          <MnDatePicker value={dateVal} onChange={setDateVal} />
        </div>
      </Card>

      <Card name="mn-profile" desc="User profile dropdown with sections and badges">
        <MnProfile
          name="Roberto D'Angelo"
          email="roberto@example.com"
          sections={[
            { title: 'Account', items: [
              { label: 'Profile Settings' },
              { label: 'API Tokens', badge: 3 },
            ]},
            { items: [
              { label: 'Sign Out', danger: true },
            ]},
          ]}
        />
      </Card>

      <Card name="mn-a11y" desc="Accessibility settings panel (font size, contrast, motion)">
        <p className="text-xs text-muted-foreground">
          The accessibility FAB is rendered at bottom-right of the page. Look for the red settings button.
        </p>
      </Card>
    </div>
  );
}
