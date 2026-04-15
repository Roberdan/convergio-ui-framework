import { lazyBlock } from "@/lib/block-registry";

lazyBlock("kanban-block", () => import("./mn-kanban-board"), "MnKanbanBoard");
