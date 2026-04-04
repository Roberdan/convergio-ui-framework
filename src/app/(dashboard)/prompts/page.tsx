'use client';

import { useCallback, useMemo, useState } from 'react';
import { useApiQuery } from '@/hooks/use-api-query';
import * as api from '@/lib/api';
import type { Prompt, PromptInput, Skill } from '@/lib/types';
import { MnSectionCard } from '@/components/maranello/layout';
import { MnDataTable, type DataTableColumn, MnBadge } from '@/components/maranello/data-display';
import { MnModal, MnStateScaffold } from '@/components/maranello/feedback';
import { MnFormField } from '@/components/maranello/forms';

const PROMPT_COLS: DataTableColumn[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'version', label: 'Version', sortable: true },
  { key: 'active', label: 'Active', type: 'status' },
  { key: 'created_at', label: 'Created', sortable: true },
];

const SKILL_COLS: DataTableColumn[] = [
  { key: 'name', label: 'Skill', sortable: true },
  { key: 'description', label: 'Description' },
  { key: 'category', label: 'Category', sortable: true },
];

export default function PromptsPage() {
  const [tab, setTab] = useState<'prompts' | 'skills'>('prompts');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState<PromptInput>({ name: '', template: '' });
  const [saving, setSaving] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');

  const { data: prompts, loading, error, refetch } = useApiQuery<Prompt[]>(() => api.promptList());
  const { data: skills } = useApiQuery<Skill[]>(() =>
    skillSearch ? api.skillSearch(skillSearch) : api.skillList(),
  );

  const tokenEstimate = useMemo(() => {
    if (!selectedPrompt?.template) return 0;
    return Math.ceil(selectedPrompt.template.length / 4);
  }, [selectedPrompt]);

  const handleCreate = useCallback(async () => {
    if (!formData.name || !formData.template) return;
    setSaving(true);
    try {
      await api.promptCreate(formData);
      setShowCreate(false);
      setFormData({ name: '', template: '' });
      refetch();
    } finally {
      setSaving(false);
    }
  }, [formData, refetch]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this prompt template?')) return;
    await api.promptDelete(id);
    setSelectedPrompt(null);
    refetch();
  }, [refetch]);

  if (loading) return <MnStateScaffold state="loading" message="Loading prompt studio..." />;
  if (error) return <MnStateScaffold state="error" message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Prompt Studio</h1>
        <button onClick={() => setShowCreate(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          New Prompt
        </button>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('prompts')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === 'prompts' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}>Prompts</button>
        <button onClick={() => setTab('skills')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === 'skills' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}>Skills</button>
      </div>

      {tab === 'prompts' && (
        <>
          <MnSectionCard title="Prompt Templates" badge={(prompts ?? []).length} collapsible defaultOpen>
            <MnDataTable
              columns={PROMPT_COLS}
              data={(prompts ?? []) as unknown as Record<string, unknown>[]}
              onRowClick={(row) => setSelectedPrompt(row as unknown as Prompt)}
              emptyMessage="No prompt templates"
            />
          </MnSectionCard>

          {selectedPrompt && (
            <MnSectionCard title={selectedPrompt.name}
              collapsible defaultOpen
              action={{ label: 'Delete', onClick: () => handleDelete(selectedPrompt.id) }}>
              <div className="space-y-4 p-4">
                <div className="flex items-center gap-3">
                  <MnBadge tone={selectedPrompt.active ? 'success' : 'neutral'}>
                    {selectedPrompt.active ? 'Active' : 'Inactive'}
                  </MnBadge>
                  <span className="text-xs text-muted-foreground">v{selectedPrompt.version}</span>
                  <span className="text-xs text-muted-foreground">~{tokenEstimate} tokens</span>
                </div>
                <div className="rounded-md border bg-muted/20 p-4">
                  <pre className="whitespace-pre-wrap text-sm">{selectedPrompt.template}</pre>
                </div>
              </div>
            </MnSectionCard>
          )}
        </>
      )}

      {tab === 'skills' && (
        <MnSectionCard title="Skill Registry" badge={(skills ?? []).length} collapsible defaultOpen>
          <div className="px-4 pb-3">
            <input type="text" value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Search skills..." />
          </div>
          <MnDataTable
            columns={SKILL_COLS}
            data={(skills ?? []).map((s) => ({
              ...s,
              capabilities: s.capabilities.join(', '),
            })) as unknown as Record<string, unknown>[]}
            emptyMessage="No skills found"
          />
        </MnSectionCard>
      )}

      <MnModal open={showCreate} onOpenChange={setShowCreate} title="New Prompt Template">
        <div className="space-y-4 p-4">
          <MnFormField label="Name" required>
            <input type="text" value={formData.name}
              onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="e.g. research-agent-v2" />
          </MnFormField>
          <MnFormField label="Template" required>
            <textarea value={formData.template}
              onChange={(e) => setFormData((f) => ({ ...f, template: e.target.value }))}
              className="h-40 w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"
              placeholder="You are a {{role}} agent. Your task is to..." />
          </MnFormField>
          <div className="text-xs text-muted-foreground">
            ~{Math.ceil((formData.template?.length ?? 0) / 4)} estimated tokens
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCreate(false)} className="rounded-md border px-4 py-2 text-sm">Cancel</button>
            <button onClick={handleCreate} disabled={saving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </MnModal>
    </div>
  );
}
