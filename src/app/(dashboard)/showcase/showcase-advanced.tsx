'use client';

import { useState } from 'react';
import {
  MnAdminShell,
  MnManettino,
  MnCruiseLever,
  MnToggleLever,
  MnSteppedRotary,
  MnIcon,
  MnNetworkMessages,
  MnNeuralNodes,
  MnSettingsPanel,
  MnVoiceInput,
} from '@/components/maranello';

export function ShowcaseAdvanced() {
  const [shellCollapsed, setShellCollapsed] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [themeVal, setThemeVal] = useState('dark');

  return (
    <section aria-labelledby="section-advanced">
      <h2 id="section-advanced" className="text-lg font-semibold mb-4">
        W6 — Advanced Components
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ferrari Controls */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnManettino / MnCruiseLever / MnToggleLever / MnSteppedRotary</h3>
          <div className="flex flex-wrap items-end gap-6">
            <MnManettino label="Drive Mode" positions={['WET', 'COMFORT', 'SPORT', 'RACE', 'ESC-OFF']} defaultValue={2} />
            <MnCruiseLever label="Cruise" positions={['OFF', 'SET', 'RES', 'ACC']} defaultValue={0} />
            <MnToggleLever label="DRS" />
            <MnSteppedRotary label="Engine" positions={['ICE', 'HYB', 'EV']} defaultValue={1} />
          </div>
        </div>

        {/* Icon */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnIcon</h3>
          <div className="flex flex-wrap gap-4 items-center">
            <MnIcon name="search" size="sm" label="Search" />
            <MnIcon name="settings" size="md" label="Settings" />
            <MnIcon name="alertTriangle" size="lg" label="Warning" />
            <MnIcon name="activity" label="Activity" />
            <MnIcon name="brain" label="Brain" />
            <MnIcon name="mesh" label="Mesh" />
          </div>
        </div>

        {/* Settings Panel */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3 md:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground">MnSettingsPanel</h3>
          <MnSettingsPanel
            sections={[
              {
                title: 'General',
                description: 'Core platform settings',
                items: [
                  { type: 'toggle' as const, label: 'Enable Sync', description: 'Auto-sync with mesh nodes', value: syncEnabled, onChange: setSyncEnabled },
                  { type: 'select' as const, label: 'Theme', value: themeVal, options: [{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }, { value: 'navy', label: 'Navy' }], onChange: setThemeVal },
                  { type: 'info' as const, label: 'Version', value: 'v20.8.0', mono: true },
                ],
              },
              {
                title: 'Advanced',
                items: [
                  { type: 'text' as const, label: 'API Endpoint', value: 'https://api.convergio.dev', placeholder: 'Enter URL', onChange: () => {} },
                  { type: 'toggle' as const, label: 'Debug Mode', value: false, onChange: () => {} },
                ],
              },
            ]}
          />
        </div>

        {/* Voice Input */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnVoiceInput</h3>
          <div className="flex items-center gap-4">
            <MnVoiceInput size="sm" locale="en-US" onTranscript={() => {}} />
            <MnVoiceInput size="md" locale="en-US" showWaveform onTranscript={() => {}} />
            <MnVoiceInput size="lg" locale="en-US" onTranscript={() => {}} />
          </div>
          <p className="text-xs text-muted-foreground">Click to start voice recognition (requires microphone permission)</p>
        </div>

        {/* Network Messages */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnNetworkMessages</h3>
          <MnNetworkMessages
            size="md"
            nodes={[
              { id: 'api', label: 'API Gateway', x: 0.2, y: 0.3 },
              { id: 'auth', label: 'Auth', x: 0.5, y: 0.15 },
              { id: 'db', label: 'Database', x: 0.8, y: 0.3 },
              { id: 'cache', label: 'Cache', x: 0.35, y: 0.7 },
              { id: 'worker', label: 'Worker', x: 0.65, y: 0.7 },
            ]}
            connections={[
              { from: 'api', to: 'auth' },
              { from: 'api', to: 'db' },
              { from: 'api', to: 'cache' },
              { from: 'db', to: 'worker' },
              { from: 'cache', to: 'worker' },
            ]}
            particleTrail
            glowEffect
          />
        </div>

        {/* Neural Nodes */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3 md:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground">MnNeuralNodes</h3>
          <MnNeuralNodes
            size="lg"
            nodes={[
              { id: 'orch', label: 'Orchestrator', group: 'core', size: 3, energy: 0.9 },
              { id: 'plan', label: 'Planner', group: 'core', size: 2, energy: 0.7 },
              { id: 'code', label: 'Coder', group: 'agents', size: 2, energy: 0.8 },
              { id: 'review', label: 'Reviewer', group: 'agents', size: 1.5, energy: 0.6 },
              { id: 'test', label: 'Tester', group: 'agents', size: 1.5, energy: 0.5 },
              { id: 'deploy', label: 'Deployer', group: 'ops', size: 1.5, energy: 0.4 },
              { id: 'monitor', label: 'Monitor', group: 'ops', size: 1, energy: 0.3 },
            ]}
            connections={[
              { from: 'orch', to: 'plan', strength: 0.9 },
              { from: 'plan', to: 'code', strength: 0.8 },
              { from: 'code', to: 'review', strength: 0.7 },
              { from: 'review', to: 'test', strength: 0.6 },
              { from: 'test', to: 'deploy', strength: 0.5 },
              { from: 'deploy', to: 'monitor', strength: 0.4 },
              { from: 'monitor', to: 'orch', strength: 0.3 },
            ]}
            interactive
            labels
            forceLayout
          />
        </div>

        {/* Admin Shell */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3 md:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground">MnAdminShell</h3>
          <div className="h-64 border border-border rounded-lg overflow-hidden">
            <MnAdminShell
              collapsed={shellCollapsed}
              onCollapsedChange={setShellCollapsed}
              pageTitle="Agent Configuration"
              breadcrumbs={[{ label: 'Admin' }, { label: 'Agents' }, { label: 'Config' }]}
              nav={[
                { id: 'dashboard', label: 'Dashboard', section: 'Main' },
                { id: 'agents', label: 'Agents', section: 'Main', badge: 5 },
                { id: 'settings', label: 'Settings', section: 'System' },
                { id: 'logs', label: 'Audit Log', section: 'System' },
              ]}
              activeNavId="agents"
            >
              <div className="p-4 text-sm text-muted-foreground">
                Admin shell content area — the sidebar nav, breadcrumbs, and top bar are part of MnAdminShell.
              </div>
            </MnAdminShell>
          </div>
        </div>
      </div>
    </section>
  );
}
