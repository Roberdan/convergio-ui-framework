import {
  Activity,
  AlertTriangle,
  Bell,
  BookOpen,
  Bug,
  ChevronRight,
  ExternalLink,
  FileText,
  FolderKanban,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  Loader2,
  Menu,
  MessageCircle,
  Minus,
  Monitor,
  Moon,
  Plus,
  RotateCcw,
  Search,
  Send,
  Settings,
  Shield,
  Sun,
  TrendingDown,
  TrendingUp,
  Users,
  Eye,
} from "lucide-react";
import type { ComponentType } from "react";

/**
 * Centralized icon registry for dynamic resolution.
 *
 * Used by the sidebar (convergio.yaml icon names) and any component
 * that needs to resolve icon strings at render time.
 * Direct imports from lucide-react are still valid for static usage.
 *
 * To add an icon: import it above and add an entry below.
 */
const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  Activity,
  AlertTriangle,
  Bell,
  BookOpen,
  Bug,
  ChevronRight,
  ExternalLink,
  Eye,
  FileText,
  FolderKanban,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  Loader2,
  Menu,
  MessageCircle,
  Minus,
  Monitor,
  Moon,
  Plus,
  RotateCcw,
  Search,
  Send,
  Settings,
  Shield,
  Sun,
  TrendingDown,
  TrendingUp,
  Users,
};

/** Resolve a Lucide icon name to its component, or return undefined. */
export function resolveIcon(name: string): ComponentType<{ className?: string }> | undefined {
  return iconMap[name];
}
