"use client";

import type { AgentTree, AgentSummary } from "@/lib/api";
import { MnNeuralNodes } from "@/components/maranello";
import type { NeuralNodeData, NeuralConnection } from "@/components/maranello";

interface AgentBrainProps {
  tree: AgentTree | null;
  agents: AgentSummary[];
}

const TYPE_COLORS: Record<string, string> = {
  core: "var(--mn-accent, #FFC72C)",
  orchestrator: "var(--mn-accent, #FFC72C)",
  worker: "var(--mn-info, #4EA8DE)",
  specialist: "var(--mn-success, #00A651)",
  unknown: "var(--mn-info, #4EA8DE)",
};

function flattenTree(
  node: AgentTree,
  parentId: string | null,
  nodes: NeuralNodeData[],
  connections: NeuralConnection[],
): void {
  const color = TYPE_COLORS[node.role] ?? TYPE_COLORS.unknown;
  nodes.push({
    id: node.id,
    label: node.name,
    color,
    size: node.role === "core" || node.role === "orchestrator" ? 1.5 : 1,
  });
  if (parentId) {
    connections.push({ from: parentId, to: node.id, strength: 0.7 });
  }
  node.children?.forEach((child) => flattenTree(child, node.id, nodes, connections));
}

function agentsToNodes(agents: AgentSummary[]): {
  nodes: NeuralNodeData[];
  connections: NeuralConnection[];
} {
  const nodes: NeuralNodeData[] = agents.map((a) => ({
    id: a.id,
    label: a.name,
    color: TYPE_COLORS[a.type] ?? TYPE_COLORS.unknown,
    size: a.status === "active" ? 1.3 : 1,
  }));

  // Connect agents that share a type
  const connections: NeuralConnection[] = [];
  for (let i = 0; i < agents.length; i++) {
    for (let j = i + 1; j < agents.length; j++) {
      if (agents[i].type === agents[j].type) {
        connections.push({
          from: agents[i].id,
          to: agents[j].id,
          strength: 0.4,
        });
      }
    }
  }
  return { nodes, connections };
}

export function AgentBrain({ tree, agents }: AgentBrainProps) {
  let neuralNodes: NeuralNodeData[] = [];
  let neuralConns: NeuralConnection[] = [];

  if (tree) {
    flattenTree(tree, null, neuralNodes, neuralConns);
  } else if (agents.length > 0) {
    const result = agentsToNodes(agents);
    neuralNodes = result.nodes;
    neuralConns = result.connections;
  }

  if (neuralNodes.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 mt-4 text-center">
        <p className="text-muted-foreground text-sm">
          Agent network data unavailable. The daemon may be offline.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 mt-4">
      <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
        Agent Neural Network
      </h2>
      <MnNeuralNodes
        nodes={neuralNodes}
        connections={neuralConns}
        size="lg"
        labels
        forceLayout
        interactive
      />
    </div>
  );
}
