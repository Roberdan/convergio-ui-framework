import {
  Brain,
  Gauge,
  Table,
  BarChart3,
  MessageSquare,
  DollarSign,
  FormInput,
  Layout,
  Navigation,
  Network,
  Settings,
  Target,
  Palette,
  type LucideIcon,
} from 'lucide-react';
import { CATALOG } from '@/lib/component-catalog';

export interface CategoryMeta {
  slug: string;
  name: string;
  icon: LucideIcon;
  count: number;
  description: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    slug: 'agentic',
    name: 'Agentic AI',
    icon: Brain,
    count: CATALOG.filter((entry) => entry.category === 'agentic').length,
    description:
      'AI-powered components for agent orchestration, cognitive architectures, and mission tracking.',
  },
  {
    slug: 'cockpit',
    name: 'Cockpit',
    icon: Gauge,
    count: 6,
    description:
      'Ferrari Luce-inspired cockpit instruments: speedometers with complications, dashboard strip, binnacle cluster, heatmap, and system status.',
  },
  {
    slug: 'data-display',
    name: 'Data Display',
    icon: Table,
    count: CATALOG.filter((entry) => entry.category === 'data-display').length,
    description:
      'Tables, cards, badges, avatars, and rich data presentation components.',
  },
  {
    slug: 'data-viz',
    name: 'Data Visualization',
    icon: BarChart3,
    count: CATALOG.filter((entry) => entry.category === 'data-viz').length,
    description:
      'Charts, heatmaps, treemaps, gauges, and interactive data visualizations.',
  },
  {
    slug: 'feedback',
    name: 'Feedback',
    icon: MessageSquare,
    count: CATALOG.filter((entry) => entry.category === 'feedback').length,
    description:
      'Toasts, modals, notifications, streaming text, and user feedback components.',
  },
  {
    slug: 'financial',
    name: 'Financial',
    icon: DollarSign,
    count: CATALOG.filter((entry) => entry.category === 'financial').length,
    description:
      'FinOps dashboards, cost breakdowns, timelines, and financial metric tracking.',
  },
  {
    slug: 'forms',
    name: 'Forms & Input',
    icon: FormInput,
    count: CATALOG.filter((entry) => entry.category === 'forms').length,
    description:
      'Form fields, date pickers, filters, toggles, voice input, and search components.',
  },
  {
    slug: 'layout',
    name: 'Layout',
    icon: Layout,
    count: CATALOG.filter((entry) => entry.category === 'layout').length,
    description:
      'Grid systems, section cards, admin shells, dashboards, and page structure.',
  },
  {
    slug: 'navigation',
    name: 'Navigation',
    icon: Navigation,
    count: CATALOG.filter((entry) => entry.category === 'navigation').length,
    description:
      'Breadcrumbs, tabs, steppers, section nav, and command palette.',
  },
  {
    slug: 'network',
    name: 'Network',
    icon: Network,
    count: CATALOG.filter((entry) => entry.category === 'network').length,
    description:
      'Mesh topologies, hub-spoke diagrams, deployment tables, and infrastructure views.',
  },
  {
    slug: 'ops',
    name: 'Operations',
    icon: Settings,
    count: CATALOG.filter((entry) => entry.category === 'ops').length,
    description:
      'Audit logs, binnacles, night jobs, Gantt charts, Kanban boards, and workbenches.',
  },
  {
    slug: 'strategy',
    name: 'Strategy',
    icon: Target,
    count: CATALOG.filter((entry) => entry.category === 'strategy').length,
    description:
      'BCG matrices, SWOT analysis, Porter\'s forces, OKRs, and business model canvases.',
  },
  {
    slug: 'theme',
    name: 'Theme Controls',
    icon: Palette,
    count: CATALOG.filter((entry) => entry.category === 'theme').length,
    description:
      'Theme toggles, rotary controls, Ferrari-inspired switches, and accessibility tools.',
  },
];

export const TOTAL_COMPONENTS = CATALOG.length;
export const TOTAL_CATEGORIES = CATEGORIES.length;
export const TOTAL_THEMES = 4;

export function getCategoryBySlug(slug: string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getAllCategorySlugs(): string[] {
  return CATEGORIES.map((c) => c.slug);
}
