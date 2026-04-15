import { lazyBlock } from "@/lib/block-registry";

lazyBlock("gauge-block", () => import("./mn-gauge"), "MnGauge");
