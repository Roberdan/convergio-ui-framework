import type {
  ActivityFeedLabels, ModalLabels, NotificationCenterLabels,
  StateScaffoldLabels, StreamingTextLabels, ToastLabels,
} from "../types";

export const activityFeedDefaults: ActivityFeedLabels = {
  noActivity: "No activity to display.",
  refreshFeed: "Refresh feed",
  refresh: "Refresh",
  refreshing: "Refreshing…",
  liveFeed: "Live feed",
};

export const modalDefaults: ModalLabels = {
  close: "Close",
};

export const notificationCenterDefaults: NotificationCenterLabels = {
  notifications: "Notifications",
  markAllAsRead: "Mark all as read",
  clearAllNotifications: "Clear all notifications",
  clear: "Clear",
  closeNotifications: "Close notifications",
  loading: "Loading",
  loadingNotifications: "Loading notifications\u2026",
  noNotifications: "No notifications",
};

export const stateScaffoldDefaults: StateScaffoldLabels = {
  loading: "Loading\u2026",
};

export const streamingTextDefaults: StreamingTextLabels = {
  streamingResponse: "Streaming response",
};

export const toastDefaults: ToastLabels = {
  close: "Close",
  notifications: "Notifications",
};
