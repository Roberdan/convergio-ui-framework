import { lazyBlock } from "@/lib/block-registry";

lazyBlock("map-block", () => import("./mn-map"), "MnMap");
