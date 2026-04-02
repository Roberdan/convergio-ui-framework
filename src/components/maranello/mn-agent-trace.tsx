'use client';

import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { useCallback, useRef, useState } from 'react';

export type TraceStepStatus = 'pending' | 'running' | 'done' | 'error';
export type TraceStepKind = 'tool' | 'reasoning' | 'result' | 'handoff';

export interface TraceStep {
  id: string;
  kind: TraceStepKind;
  label: string;
  status: TraceStepStatus;
  durationMs?: number;
  input?: string;
  output?: string;
  timestamp?: string;
}

export interface MnAgentTraceProps {
  steps: TraceStep[];
  /** Callback when a step is expanded */
  onSelect?: (step: TraceStep) => void;
  /** Maximum visible steps (scrollable beyond this) */
  maxVisible?: number;
  ariaLabel?: string;
  className?: string;
}

const KIND_LABELS: Record<TraceStepKind, string> = {
  tool: 'T',
  reasoning: 'R',
  result: 'Res',
  handoff: 'H',
};

const MAX_DISPLAY_LEN = 500;

const kindBadge = cva(
  'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-bold',
  {
    variants: {
      kind: {
        tool: 'bg-[var(--mn-kind-tool-bg,theme(colors.blue.500/0.15))] text-[var(--mn-kind-tool-fg,theme(colors.blue.600))]',
        reasoning:
          'bg-[var(--mn-kind-reasoning-bg,theme(colors.purple.500/0.15))] text-[var(--mn-kind-reasoning-fg,theme(colors.purple.600))]',
        result:
          'bg-[var(--mn-kind-result-bg,theme(colors.green.500/0.15))] text-[var(--mn-kind-result-fg,theme(colors.green.600))]',
        handoff:
          'bg-[var(--mn-kind-handoff-bg,theme(colors.amber.500/0.15))] text-[var(--mn-kind-handoff-fg,theme(colors.amber.600))]',
      },
    },
  },
);

const statusDot = cva('h-2.5 w-2.5 shrink-0 rounded-full', {
  variants: {
    status: {
      pending: 'bg-muted-foreground/40',
      running: 'bg-status-warning animate-pulse',
      done: 'bg-status-success',
      error: 'bg-status-error',
    },
  },
});

function truncate(text: string | undefined): string {
  if (!text) return '';
  return text.length > MAX_DISPLAY_LEN
    ? text.slice(0, MAX_DISPLAY_LEN) + '\u2026'
    : text;
}

function StepBody({ step }: { step: TraceStep }) {
  const hasContent = step.input || step.output;
  if (!hasContent) return null;

  return (
    <div className="border-t border-border/50 px-3 py-2 text-xs">
      {step.input && (
        <div className="mb-2">
          <span className="mb-1 block font-semibold text-muted-foreground">
            Input
          </span>
          <pre className="whitespace-pre-wrap break-words rounded bg-muted/50 p-2 font-mono text-card-foreground">
            {truncate(step.input)}
          </pre>
        </div>
      )}
      {step.output && (
        <div>
          <span className="mb-1 block font-semibold text-muted-foreground">
            Output
          </span>
          <pre className="whitespace-pre-wrap break-words rounded bg-muted/50 p-2 font-mono text-card-foreground">
            {truncate(step.output)}
          </pre>
        </div>
      )}
    </div>
  );
}

function StepRow({
  step,
  expanded,
  onToggle,
}: {
  step: TraceStep;
  expanded: boolean;
  onToggle: (id: string) => void;
}) {
  const hasBody = !!(step.input || step.output);

  function handleClick() {
    if (hasBody) onToggle(step.id);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (hasBody) onToggle(step.id);
    }
  }

  return (
    <div
      role="listitem"
      data-id={step.id}
      className={cn(
        'rounded-md border bg-card transition-colors',
        step.status === 'error' && 'border-status-error/30',
      )}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={hasBody ? expanded : undefined}
        aria-label={`${step.kind} step: ${step.label}, status ${step.status}${step.durationMs != null ? `, ${step.durationMs}ms` : ''}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm',
          'hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md',
          !hasBody && 'cursor-default',
        )}
      >
        <span className={kindBadge({ kind: step.kind })}>
          {KIND_LABELS[step.kind]}
        </span>

        <span className="min-w-0 flex-1 truncate font-medium text-card-foreground">
          {step.label}
        </span>

        {step.timestamp && (
          <span className="shrink-0 text-xs text-muted-foreground">
            {step.timestamp}
          </span>
        )}

        {step.durationMs != null && (
          <span className="shrink-0 tabular-nums text-xs text-muted-foreground">
            {step.durationMs}ms
          </span>
        )}

        <span
          className={statusDot({ status: step.status })}
          aria-label={`Status: ${step.status}`}
        />
      </div>

      {expanded && <StepBody step={step} />}
    </div>
  );
}

/**
 * Visualizes AI agent execution traces.
 *
 * Displays steps with kind badges, status indicators, and
 * expandable input/output sections. Supports keyboard navigation
 * and auto-scrolls to the latest step.
 */
export function MnAgentTrace({
  steps,
  onSelect,
  maxVisible,
  ariaLabel = 'Agent trace',
  className,
}: MnAgentTraceProps) {
  const [expandedSet, setExpandedSet] = useState<Set<string>>(new Set());
  const listRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback(
    (id: string) => {
      setExpandedSet((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
          const step = steps.find((s) => s.id === id);
          if (step && onSelect) onSelect(step);
        }
        return next;
      });
    },
    [steps, onSelect],
  );

  if (!steps.length) {
    return (
      <div
        className={cn(
          'rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground',
          className,
        )}
      >
        No trace steps to display.
      </div>
    );
  }

  const maxH =
    maxVisible != null
      ? { maxHeight: `${maxVisible * 3.5}rem`, overflowY: 'auto' as const }
      : undefined;

  return (
    <div
      ref={listRef}
      role="list"
      aria-label={ariaLabel}
      className={cn('flex flex-col gap-1.5 rounded-lg border bg-card p-2', className)}
      style={maxH}
    >
      {steps.map((step) => (
        <StepRow
          key={step.id}
          step={step}
          expanded={expandedSet.has(step.id)}
          onToggle={toggle}
        />
      ))}
    </div>
  );
}
