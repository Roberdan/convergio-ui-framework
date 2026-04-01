import {
  Activity,
  Bell,
  FileText,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

/**
 * Mapping from Lucide icon names (as written in convergio.yaml)
 * to their React component. Used by the sidebar to resolve
 * icon strings at render time.
 *
 * To add an icon: import it from lucide-react and add an entry here.
 */
const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  Activity,
  Bell,
  FileText,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
};

/** Resolve a Lucide icon name to its component, or return undefined. */
export function resolveIcon(name: string): ComponentType<{ className?: string }> | undefined {
  return iconMap[name];
}
