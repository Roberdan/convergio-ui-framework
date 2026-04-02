"use client";

import { useState } from "react";
import { ideasApi } from "@/lib/api";
import { MnModal, MnFormField } from "@/components/maranello";

interface CreateIdeaDialogProps {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateIdeaDialog({ onClose, onCreated }: CreateIdeaDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await ideasApi.createIdea({
        title: title.trim(),
        description: description.trim(),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create idea");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <MnModal open onOpenChange={(v) => { if (!v) onClose(); }} title="New Idea">
      <form onSubmit={handleSubmit} className="space-y-4">
        <MnFormField label="Title" required error={error ?? undefined}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Idea title"
            autoFocus
          />
        </MnFormField>

        <MnFormField label="Description" required>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
            placeholder="Describe your idea"
          />
        </MnFormField>

        <MnFormField label="Tags" hint="Comma-separated">
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="e.g. automation, ux, performance"
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
            disabled={submitting || !title.trim() || !description.trim()}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Submit Idea"}
          </button>
        </div>
      </form>
    </MnModal>
  );
}
