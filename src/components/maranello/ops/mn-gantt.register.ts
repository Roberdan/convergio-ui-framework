import { lazyBlock } from "@/lib/block-registry";

lazyBlock("gantt-block", () => import("./mn-gantt"), "MnGantt");
