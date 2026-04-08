import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Bug,
  Building2,
  ChevronRight,
  ClipboardList,
  Compass,
  DollarSign,
  ExternalLink,
  Eye,
  FileText,
  FolderKanban,
  FormInput,
  Gauge,
  HelpCircle,
  Home,
  Inbox,
  Layout,
  LayoutDashboard,
  LayoutGrid,
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
  Receipt,
  RotateCcw,
  Search,
  Send,
  Settings,
  Shapes,
  Shield,
  Sparkles,
  Sun,
  Table,
  Target,
  Terminal,
  TextCursorInput,
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
  Building2,
  ChevronRight,
  ClipboardList,
  Compass,
  DollarSign,
  ExternalLink,
  Eye,
  FileText,
  FolderKanban,
  FormInput,
  Gauge,
  HelpCircle,
  Home,
  Inbox,
  Layout,
  LayoutDashboard,
  LayoutGrid,
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
  Receipt,
  RotateCcw,
  Search,
  Send,
  Settings,
  Shapes,
  Shield,
  Sparkles,
  Sun,
  Table,
  Target,
  Terminal,
  TextCursorInput,
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
