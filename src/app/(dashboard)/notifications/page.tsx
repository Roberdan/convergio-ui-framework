import { operationsApi, notificationsApi } from "@/lib/api";
import { NotificationsClient } from "./notifications-client";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  let notifications = null;
  let channels = null;

  try {
    [notifications, channels] = await Promise.all([
      operationsApi.getNotifications(),
      notificationsApi.getChannels(),
    ]);
  } catch {
    // Daemon offline — client will retry via polling
  }

  return (
    <NotificationsClient
      initialNotifications={notifications}
      initialChannels={channels}
    />
  );
}
