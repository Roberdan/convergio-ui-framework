import { lazyBlock } from "@/lib/block-registry";

lazyBlock("funnel-block", () => import("./mn-funnel"), "MnFunnel");
