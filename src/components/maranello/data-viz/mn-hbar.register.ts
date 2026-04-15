import { lazyBlock } from "@/lib/block-registry";

lazyBlock("hbar-block", () => import("./mn-hbar"), "MnHbar");
