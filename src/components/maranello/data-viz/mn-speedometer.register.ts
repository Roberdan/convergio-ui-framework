import { lazyBlock } from "@/lib/block-registry";

lazyBlock("speedometer-block", () => import("./mn-speedometer"), "MnSpeedometer");
