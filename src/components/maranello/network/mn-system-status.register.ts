import { lazyBlock } from "@/lib/block-registry";

lazyBlock("system-status-block", () => import("./mn-system-status"), "MnSystemStatus");
