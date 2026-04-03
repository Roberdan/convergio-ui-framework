/**
 * Sample data for the Strategy showcase section.
 */
import type {
  CanvasSegment,
  Force,
  JourneyStage,
  BCGItem,
  BmcBlock,
  NineBoxItem,
  RiskItem,
} from '@/components/maranello';

export const strategyCanvasSegments: CanvasSegment[] = [
  { label: 'Key Partners', items: ['Cloud providers', 'LLM vendors', 'Data brokers'] },
  { label: 'Key Activities', items: ['Agent orchestration', 'Model fine-tuning', 'Mesh networking'] },
  { label: 'Value Propositions', items: ['Autonomous ops', 'Real-time cost control', 'Multi-agent reasoning'] },
  { label: 'Customer Segments', items: ['Enterprise IT', 'AI-native startups', 'Government agencies'] },
  { label: 'Channels', items: ['Self-serve SaaS', 'Partner integrations', 'Direct sales'] },
];

export const swotData = {
  strengths: [
    'Multi-model orchestration engine',
    'Sub-25ms mesh latency',
    'Integrated FinOps dashboard',
  ],
  weaknesses: [
    'Single-region deployment',
    'Limited offline capability',
    'Small partner ecosystem',
  ],
  opportunities: [
    'EU AI Act compliance tooling',
    'Edge inference on Apple Silicon',
    'Vertical SaaS expansion',
  ],
  threats: [
    'Hyperscaler bundling',
    'Open-source agent frameworks',
    'Regulatory fragmentation',
  ],
};

export const porterForces: Force[] = [
  { name: 'Industry Rivalry', level: 'high', notes: 'Fragmented AI ops market with rapid entry' },
  { name: 'Threat of New Entrants', level: 'medium', notes: 'Low barrier via open-source LLMs' },
  { name: 'Buyer Power', level: 'high', notes: 'Enterprise clients negotiate volume discounts' },
  { name: 'Supplier Power', level: 'medium', notes: 'GPU supply constraints from few vendors' },
  { name: 'Threat of Substitutes', level: 'low', notes: 'Manual ops are costly and error-prone' },
];

export const journeyStages: JourneyStage[] = [
  {
    name: 'Discovery',
    touchpoints: [
      { channel: 'Website', sentiment: 'positive' },
      { channel: 'LinkedIn Ad', sentiment: 'neutral' },
    ],
  },
  {
    name: 'Evaluation',
    touchpoints: [
      { channel: 'Demo Call', sentiment: 'positive' },
      { channel: 'Documentation', sentiment: 'positive' },
    ],
  },
  {
    name: 'Onboarding',
    touchpoints: [
      { channel: 'Setup Wizard', sentiment: 'positive' },
      { channel: 'Slack Support', sentiment: 'neutral' },
    ],
  },
  {
    name: 'Adoption',
    touchpoints: [
      { channel: 'Dashboard', sentiment: 'positive' },
      { channel: 'API Docs', sentiment: 'negative' },
    ],
  },
  {
    name: 'Renewal',
    touchpoints: [
      { channel: 'Account Manager', sentiment: 'positive' },
      { channel: 'Invoice Portal', sentiment: 'neutral' },
    ],
  },
];

export const bcgItems: BCGItem[] = [
  { id: 'orch', label: 'Orchestration Engine', marketShare: 0.7, growthRate: 25, size: 80 },
  { id: 'finops', label: 'FinOps Dashboard', marketShare: 0.3, growthRate: 30, size: 60 },
  { id: 'mesh', label: 'Mesh Network', marketShare: 0.6, growthRate: 5, size: 70 },
  { id: 'voice', label: 'Voice Interface', marketShare: 0.15, growthRate: 18, size: 40 },
  { id: 'legacy', label: 'Legacy Reports', marketShare: 0.2, growthRate: -2, size: 35 },
];

export const bmcBlocks: BmcBlock[] = [
  { id: 'keyPartners', label: 'Key Partners', items: [{ text: 'Anthropic' }, { text: 'AWS' }, { text: 'Cloudflare' }] },
  { id: 'keyActivities', label: 'Key Activities', items: [{ text: 'Agent orchestration' }, { text: 'Model routing' }] },
  { id: 'keyResources', label: 'Key Resources', items: [{ text: 'GPU cluster' }, { text: 'Knowledge base' }] },
  { id: 'valuePropositions', label: 'Value Propositions', items: [{ text: 'Autonomous operations' }, { text: 'Cost transparency' }] },
  { id: 'customerRelationships', label: 'Customer Relationships', items: [{ text: 'Dedicated CSM' }, { text: 'Community forum' }] },
  { id: 'channels', label: 'Channels', items: [{ text: 'SaaS portal' }, { text: 'API marketplace' }] },
  { id: 'customerSegments', label: 'Customer Segments', items: [{ text: 'Enterprise IT' }, { text: 'DevOps teams' }] },
  { id: 'costStructure', label: 'Cost Structure', items: [{ text: 'GPU compute' }, { text: 'LLM API calls' }] },
  { id: 'revenueStreams', label: 'Revenue Streams', items: [{ text: 'Subscriptions' }, { text: 'Usage-based billing' }] },
];

export const nineBoxItems: NineBoxItem[] = [
  { id: 'a1', label: 'Coordinator Opus', performance: 2, potential: 2, subtitle: 'Star performer' },
  { id: 'a2', label: 'Worker Sonnet 01', performance: 2, potential: 1, subtitle: 'Reliable executor' },
  { id: 'a3', label: 'Worker Codex 01', performance: 1, potential: 2, subtitle: 'High growth potential' },
  { id: 'a4', label: 'Kernel Jarvis', performance: 1, potential: 1, subtitle: 'Core contributor' },
  { id: 'a5', label: 'Mesh Relay', performance: 0, potential: 1, subtitle: 'Needs development' },
  { id: 'a6', label: 'Legacy Bot', performance: 0, potential: 0, subtitle: 'Under review' },
];

export const riskItems: RiskItem[] = [
  { id: 'r1', label: 'API rate-limit breach', probability: 4, impact: 3 },
  { id: 'r2', label: 'Model provider outage', probability: 2, impact: 5 },
  { id: 'r3', label: 'Data exfiltration', probability: 1, impact: 5 },
  { id: 'r4', label: 'Cost overrun', probability: 3, impact: 4 },
  { id: 'r5', label: 'Latency degradation', probability: 4, impact: 2 },
  { id: 'r6', label: 'Compliance violation', probability: 2, impact: 4 },
];
