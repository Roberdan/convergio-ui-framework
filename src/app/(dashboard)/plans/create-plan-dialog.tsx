"use client";

import { useState } from "react";
import { plansApi } from "@/lib/api";
import { MnModal, MnFormField } from "@/components/maranello";

interface CreatePlanDialogProps {
  onClose: () => void;
  onCreated: () => void;
}

export function CreatePlanDialog({ onClose, onCreated }: CreatePlanDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await plansApi.createPlan({ title: title.trim(), description: description.trim() });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create plan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <MnModal open onOpenChange={(v) => { if (!v) onClose(); }} title="Create Plan">
      <form onSubmit={handleSubmit} className="space-y-4">
        <MnFormField label="Title" required error={error ?? undefined}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Plan title"
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
            disabled={submitting || !title.trim()}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {submitting ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </MnModal>
  );
}
