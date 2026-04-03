'use client';

import { cn } from '@/lib/utils';
import { useMemo } from 'react';

export interface HubSpokeHub {
  label: string;
  status: 'online' | 'offline' | 'degraded';
}

export interface HubSpokeSpoke {
  label: string;
  status: 'online' | 'offline' | 'degraded';
  connected: boolean;
}

export interface MnHubSpokeProps {
  hub: HubSpokeHub;
  spokes: HubSpokeSpoke[];
  ariaLabel?: string;
  className?: string;
}

const STATUS_FILL: Record<string, string> = {
  online: 'var(--status-success, hsl(142 71% 45%))',
  offline: 'var(--status-error, hsl(0 84% 60%))',
  degraded: 'var(--status-warning, hsl(38 92% 50%))',
};

const STATUS_TEXT: Record<string, string> = {
  online: 'Online',
  offline: 'Offline',
  degraded: 'Degraded',
};

/**
 * Hub-and-spoke network diagram.
 *
 * Hub displayed in center, spokes arranged radially.
 * Active connections pulse via CSS animation.
 * Fully accessible with screen-reader list fallback.
 */
export function MnHubSpoke({
  hub,
  spokes,
  ariaLabel = 'Hub and spoke network',
  className,
}: MnHubSpokeProps) {
  const size = 360;
  const cx = size / 2;
  const cy = size / 2;
  const hubR = 28;
  const spokeR = 16;
  const orbitR = size * 0.35;

  const spokePositions = useMemo(() => {
    return spokes.map((_, i) => {
      const angle = (2 * Math.PI * i) / spokes.length - Math.PI / 2;
      return {
        x: cx + orbitR * Math.cos(angle),
        y: cy + orbitR * Math.sin(angle),
      };
    });
  }, [spokes, cx, cy, orbitR]);

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn('rounded-lg border bg-card p-4', className)}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-auto"
        aria-hidden="true"
      >
        <defs>
          <style>{`
            @keyframes mn-pulse {
              0%, 100% { opacity: 0.3; }
              50% { opacity: 1; }
            }
          `}</style>
        </defs>

        {/* connection lines */}
        {spokes.map((spoke, i) => {
          const pos = spokePositions[i];
          return (
            <g key={`edge-${i}`}>
              <line
                x1={cx}
                y1={cy}
                x2={pos.x}
                y2={pos.y}
                stroke={
                  spoke.connected
                    ? 'var(--primary)'
                    : 'var(--border)'
                }
                strokeWidth={spoke.connected ? 2 : 1}
                strokeDasharray={spoke.connected ? undefined : '4 4'}
                opacity={spoke.connected ? 0.7 : 0.4}
              />
              {/* pulse dot for active connections */}
              {spoke.connected && (
                <circle
                  cx={(cx + pos.x) / 2}
                  cy={(cy + pos.y) / 2}
                  r="3"
                  fill="var(--primary)"
                  style={{ animation: 'mn-pulse 2s ease-in-out infinite' }}
                />
              )}
            </g>
          );
        })}

        {/* hub */}
        <circle
          cx={cx}
          cy={cy}
          r={hubR}
          fill={STATUS_FILL[hub.status]}
          opacity={hub.status === 'offline' ? 0.4 : 0.9}
        />
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fill="var(--card-foreground)"
          fontSize="10"
          fontWeight="600"
        >
          {hub.label}
        </text>

        {/* spokes */}
        {spokes.map((spoke, i) => {
          const pos = spokePositions[i];
          return (
            <g key={`spoke-${i}`}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={spokeR}
                fill={STATUS_FILL[spoke.status]}
                opacity={spoke.status === 'offline' ? 0.4 : 0.85}
              />
              <text
                x={pos.x}
                y={pos.y + spokeR + 14}
                textAnchor="middle"
                fill="var(--card-foreground)"
                fontSize="10"
                fontWeight="500"
              >
                {spoke.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* screen reader fallback */}
      <ul className="sr-only" aria-label="Network nodes">
        <li>
          Hub: {hub.label} ({STATUS_TEXT[hub.status]})
        </li>
        {spokes.map((s, i) => (
          <li key={i}>
            {s.label}: {STATUS_TEXT[s.status]},{' '}
            {s.connected ? 'connected' : 'disconnected'}
          </li>
        ))}
      </ul>

      {/* legend */}
      <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
        {Object.entries(STATUS_TEXT).map(([key, label]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: STATUS_FILL[key] }}
              aria-hidden="true"
            />
            {label}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full bg-primary"
            style={{ animation: 'mn-pulse 2s ease-in-out infinite' }}
            aria-hidden="true"
          />
          Active
        </span>
      </div>
    </div>
  );
}
