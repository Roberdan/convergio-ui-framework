"use client";

import { useState, useMemo, useCallback } from "react";
import { useApiQuery } from "@/hooks";
import { operationsApi, notificationsApi } from "@/lib/api";
import type { Notification, NotificationChannel } from "@/lib/api";
import {
  MnNotificationCenter,
  MnDashboardStrip,
  MnBadge,
  MnSpinner,
} from "@/components/maranello";
import type { MnNotification } from "@/components/maranello";
import type { StripMetric } from "@/components/maranello";

interface NotificationsClientProps {
  initialNotifications: Notification[] | null;
  initialChannels: NotificationChannel[] | null;
}

type FilterChannel = string | "all";
type FilterType = Notification["type"] | "all";

function toMnNotification(n: Notification): MnNotification {
  return {
    id: n.id,
    title: n.title,
    body: n.message,
    type: n.type,
    read: n.read,
    timestamp: n.timestamp,
  };
}

export function NotificationsClient({
  initialNotifications,
  initialChannels,
}: NotificationsClientProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [channelFilter, setChannelFilter] = useState<FilterChannel>("all");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [markedRead, setMarkedRead] = useState<Set<string>>(new Set());

  const { data: notifications } = useApiQuery(
    () => operationsApi.getNotifications(),
    { pollInterval: 30_000 },
  );
  const { data: channels } = useApiQuery(
    () => notificationsApi.getChannels(),
    { pollInterval: 60_000 },
  );

  const items = notifications ?? initialNotifications;
  const channelList = channels ?? initialChannels;

  const filtered = useMemo(() => {
    if (!items) return [];
    return items.filter((n) => {
      if (dismissed.has(n.id)) return false;
      if (typeFilter !== "all" && n.type !== typeFilter) return false;
      return true;
    });
  }, [items, typeFilter, dismissed]);

  const unreadCount = useMemo(
    () => filtered.filter((n) => !n.read && !markedRead.has(n.id)).length,
    [filtered, markedRead],
  );

  const enabledChannels = useMemo(
    () => (channelList ?? []).filter((c) => c.enabled).length,
    [channelList],
  );

  const stripMetrics: StripMetric[] = [
    { label: "Unread", value: unreadCount, trend: unreadCount > 0 ? "up" : "flat" },
    { label: "Total", value: filtered.length },
    { label: "Channels", value: enabledChannels },
  ];

  const mnNotifications: MnNotification[] = filtered.map((n) => ({
    ...toMnNotification(n),
    read: n.read || markedRead.has(n.id),
  }));

  const handleMarkRead = useCallback((id: string) => {
    setMarkedRead((prev) => new Set(prev).add(id));
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setMarkedRead((prev) => {
      const next = new Set(prev);
      filtered.forEach((n) => next.add(n.id));
      return next;
    });
  }, [filtered]);

  const handleRemove = useCallback((id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  }, []);

  if (!items) {
    return (
      <div className="flex items-center justify-center h-64">
        <MnSpinner size="lg" label="Loading notifications..." />
      </div>
    );
  }

  const TYPES: FilterType[] = ["all", "info", "success", "warning", "error"];
  const TONE_MAP = {
    info: "info",
    success: "success",
    warning: "warning",
    error: "danger",
    all: "neutral",
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Notifications</h1>
          <p className="text-caption mt-1">System alerts and updates.</p>
        </div>
        <button
          type="button"
          onClick={() => setPanelOpen(true)}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
        >
          Open Panel
          {unreadCount > 0 && (
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      <MnDashboardStrip metrics={stripMetrics} ariaLabel="Notification metrics" />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground mr-1">Type:</span>
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTypeFilter(t)}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
          >
            <MnBadge
              tone={TONE_MAP[t]}
              label={t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
              className={typeFilter === t ? "ring-2 ring-ring" : "opacity-60"}
            />
          </button>
        ))}

        {channelList && channelList.length > 0 && (
          <>
            <span className="ml-4 text-xs text-muted-foreground mr-1">Channel:</span>
            <button
              type="button"
              onClick={() => setChannelFilter("all")}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
            >
              <MnBadge
                tone="neutral"
                label="All"
                className={channelFilter === "all" ? "ring-2 ring-ring" : "opacity-60"}
              />
            </button>
            {channelList.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setChannelFilter(ch.name)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
              >
                <MnBadge
                  tone={ch.enabled ? "info" : "neutral"}
                  label={ch.name}
                  className={channelFilter === ch.name ? "ring-2 ring-ring" : "opacity-60"}
                />
              </button>
            ))}
          </>
        )}
      </div>

      {/* Inline list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No notifications match the current filters.
          </p>
        ) : (
          filtered.map((n) => {
            const isRead = n.read || markedRead.has(n.id);
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 rounded-md border p-3 text-sm transition-colors ${isRead ? "bg-card text-card-foreground" : "bg-muted text-foreground"}`}
              >
                {!isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                {isRead && <span className="mt-1.5 h-2 w-2 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className={isRead ? "text-muted-foreground" : "font-medium"}>
                    {n.title}
                  </p>
                  {n.message && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {n.message}
                    </p>
                  )}
                  <p className="text-micro mt-0.5">{n.timestamp}</p>
                </div>
                <MnBadge tone={TONE_MAP[n.type]} label={n.type} />
              </div>
            );
          })
        )}
      </div>

      <MnNotificationCenter
        open={panelOpen}
        onOpenChange={setPanelOpen}
        notifications={mnNotifications}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        onRemove={handleRemove}
      />
    </div>
  );
}
