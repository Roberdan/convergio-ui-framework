import { lazyBlock } from "@/lib/block-registry";

lazyBlock("okr-block", () => import("./mn-okr"), "MnOkr");
