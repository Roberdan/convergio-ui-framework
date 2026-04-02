/**
 * A2UI module barrel export.
 *
 * Re-exports types, store (context + hooks), and SSE client
 * for use by components and the app shell.
 */
export type {
  A2UIBlock,
  A2UIBlockType,
  A2UIPriority,
  A2UIStatus,
  A2UITarget,
  A2UIBlockPayload,
  A2UINotificationPayload,
  A2UIAlertPayload,
  A2UIProgressPayload,
  A2UICardPayload,
  A2UIChartPayload,
  A2UITablePayload,
  A2UIStreamEvent,
  A2UIBlocksResponse,
} from "./types";

export {
  A2UIProvider,
  useA2UIBlocks,
  useA2UIDispatch,
  addBlock,
  dismissBlock,
  replaceBlock,
  setBlocks,
} from "./store";

export { useA2UIClient } from "./client";
