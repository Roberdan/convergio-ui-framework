import { lazyBlock } from "@/lib/block-registry";

lazyBlock("workflow-orchestrator-block", () => import("./mn-workflow-orchestrator"), "MnWorkflowOrchestrator");
