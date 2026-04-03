import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Bug,
  ChevronRight,
  DollarSign,
  ExternalLink,
  Eye,
  FileText,
  FolderKanban,
  FormInput,
  HelpCircle,
  Home,
  Inbox,
  Layout,
  LayoutDashboard,
  Loader2,
  Menu,
  MessageCircle,
  MessageSquare,
  Minus,
  Monitor,
  Moon,
  Navigation,
  Network,
  Palette,
  Plus,
  RotateCcw,
  Search,
  Send,
  Settings,
  Shield,
  Sparkles,
  Sun,
  Table,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
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
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Bug,
  ChevronRight,
  DollarSign,
  ExternalLink,
  Eye,
  FileText,
  FolderKanban,
  FormInput,
  HelpCircle,
  Home,
  Inbox,
  Layout,
  LayoutDashboard,
  Loader2,
  Menu,
  MessageCircle,
  MessageSquare,
  Minus,
  Monitor,
  Moon,
  Navigation,
  Network,
  Palette,
  Plus,
  RotateCcw,
  Search,
  Send,
  Settings,
  Shield,
  Sparkles,
  Sun,
  Table,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
};

/** Resolve a Lucide icon name to its component, or return undefined. */
export function resolveIcon(name: string): ComponentType<{ className?: string }> | undefined {
  return iconMap[name];
}

/** Return all registered icon entries as [name, Component] pairs. */
export function getAllIcons(): [string, ComponentType<{ className?: string }>][] {
  return Object.entries(iconMap);
}
