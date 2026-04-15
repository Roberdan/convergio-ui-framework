import { lazyBlock } from "@/lib/block-registry";

lazyBlock("data-table-maranello", () => import("./mn-data-table"), "MnDataTable");
