"use client";

import { useState } from "react";
import { orgsApi } from "@/lib/api";
import { MnModal, MnFormField } from "@/components/maranello";

interface CreateOrgDialogProps {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateOrgDialog({ onClose, onCreated }: CreateOrgDialogProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await orgsApi.createOrg({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create organization");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <MnModal open onOpenChange={(v) => { if (!v) onClose(); }} title="Create Organization">
      <form onSubmit={handleSubmit} className="space-y-4">
        <MnFormField label="Name" required error={error ?? undefined}>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
            }}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Organization name"
            autoFocus
          />
        </MnFormField>

        <MnFormField label="Slug" required>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
            placeholder="org-slug"
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
            disabled={submitting || !name.trim() || !slug.trim()}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </MnModal>
  );
}
