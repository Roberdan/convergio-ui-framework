"use client";

import { useState } from "react";
import { agentsApi } from "@/lib/api";
import type { TriageResult } from "@/lib/api";
import { MnBadge, MnSpinner } from "@/components/maranello";

export function AgentTriage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<TriageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTriage(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await agentsApi.triageAgent({ query: query.trim() });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Triage failed");
    }
    setLoading(false);
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 mt-4 space-y-4">
      <p className="text-sm text-muted-foreground">
        Describe your task and AI will match the best agent.
      </p>
      <form onSubmit={handleTriage} className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Deploy the staging environment"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Matching..." : "Match Agent"}
        </button>
      </form>

      {loading && <MnSpinner size="md" label="Analyzing..." />}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {result && (
        <div className="rounded-md border border-border p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">{result.agentName}</span>
            <MnBadge
              label={`${Math.round(result.confidence * 100)}%`}
              tone={result.confidence > 0.7 ? "success" : "warning"}
            />
          </div>
          <p className="text-sm text-muted-foreground">{result.reasoning}</p>
        </div>
      )}
    </div>
  );
}
