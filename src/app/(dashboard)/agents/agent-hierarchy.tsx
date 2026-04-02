"use client";

import type { AgentTree } from "@/lib/api";
import { MnOrgChart } from "@/components/maranello";
import type { OrgNode } from "@/components/maranello";

interface AgentHierarchyProps {
  tree: AgentTree | null;
}

function treeToOrgNode(node: AgentTree): OrgNode {
  return {
    name: node.name,
    role: node.role,
    status: node.status,
    children: node.children?.map(treeToOrgNode),
  };
}

export function AgentHierarchy({ tree }: AgentHierarchyProps) {
  if (!tree) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 mt-4 text-center">
        <p className="text-muted-foreground text-sm">Agent hierarchy unavailable</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 mt-4">
      <MnOrgChart tree={treeToOrgNode(tree)} ariaLabel="Agent hierarchy" />
    </div>
  );
}
