"use client";

import { useState } from "react";
import { workspacesApi } from "@/lib/api";
import { MnModal, MnFormField } from "@/components/maranello";

interface CreateProjectDialogProps {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateProjectDialog({ onClose, onCreated }: CreateProjectDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await workspacesApi.createWorkspace({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <MnModal open onOpenChange={(v) => { if (!v) onClose(); }} title="Create Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <MnFormField label="Name" required error={error ?? undefined}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Project name"
            autoFocus
          />
        </MnFormField>

        <MnFormField label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
            placeholder="Optional description"
          />
        </MnFormField>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {submitting ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </MnModal>
  );
}
