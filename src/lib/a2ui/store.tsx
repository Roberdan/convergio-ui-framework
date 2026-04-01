"use client";

/**
 * A2UI block store — React context + reducer for managing live A2UI blocks.
 *
 * Provides addBlock, dismissBlock, replaceBlock, and setBlocks actions.
 * Used by the SSE client and REST hydration to keep UI in sync with
 * daemon-pushed agent blocks.
 */

import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import type { A2UIBlock } from "./types";

/* ── State ── */

export interface A2UIState {
  blocks: A2UIBlock[];
}

const initialState: A2UIState = { blocks: [] };

/* ── Actions ── */

type A2UIAction =
  | { type: "SET_BLOCKS"; blocks: A2UIBlock[] }
  | { type: "ADD_BLOCK"; block: A2UIBlock }
  | { type: "DISMISS_BLOCK"; blockId: string }
  | { type: "REPLACE_BLOCK"; blockId: string; block: A2UIBlock };

function a2uiReducer(state: A2UIState, action: A2UIAction): A2UIState {
  switch (action.type) {
    case "SET_BLOCKS":
      return { blocks: action.blocks };
    case "ADD_BLOCK":
      return { blocks: [...state.blocks, action.block] };
    case "DISMISS_BLOCK":
      return {
        blocks: state.blocks.filter((b) => b.block_id !== action.blockId),
      };
    case "REPLACE_BLOCK":
      return {
        blocks: state.blocks.map((b) =>
          b.block_id === action.blockId ? action.block : b
        ),
      };
    default:
      return state;
  }
}

/* ── Context ── */

const A2UIStateCtx = createContext<A2UIState>(initialState);
const A2UIDispatchCtx = createContext<Dispatch<A2UIAction>>(() => {
  /* noop default — overridden by provider */
});

export function A2UIProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(a2uiReducer, initialState);
  return (
    <A2UIStateCtx.Provider value={state}>
      <A2UIDispatchCtx.Provider value={dispatch}>
        {children}
      </A2UIDispatchCtx.Provider>
    </A2UIStateCtx.Provider>
  );
}

/* ── Hooks ── */

export function useA2UIBlocks(): A2UIBlock[] {
  return useContext(A2UIStateCtx).blocks;
}

export function useA2UIDispatch(): Dispatch<A2UIAction> {
  return useContext(A2UIDispatchCtx);
}

/* ── Convenience dispatchers ── */

export function addBlock(dispatch: Dispatch<A2UIAction>, block: A2UIBlock) {
  dispatch({ type: "ADD_BLOCK", block });
}

export function dismissBlock(dispatch: Dispatch<A2UIAction>, blockId: string) {
  dispatch({ type: "DISMISS_BLOCK", blockId });
}

export function replaceBlock(
  dispatch: Dispatch<A2UIAction>,
  blockId: string,
  block: A2UIBlock
) {
  dispatch({ type: "REPLACE_BLOCK", blockId, block });
}

export function setBlocks(dispatch: Dispatch<A2UIAction>, blocks: A2UIBlock[]) {
  dispatch({ type: "SET_BLOCKS", blocks });
}
