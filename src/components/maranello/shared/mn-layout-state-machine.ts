/**
 * UT-03 — Maranello Layout State Machine
 * Manages responsive layout transitions (sidebar, mobile-nav, fullscreen)
 * driven by viewport breakpoints and user actions.
 * Pure utility module — no React, no side-effects.
 */

// ── Layout states ──────────────────────────────────────────────────

export type MnLayoutState =
  | 'sidebar-open'
  | 'sidebar-collapsed'
  | 'mobile-nav'
  | 'fullscreen';

// ── Actions that trigger transitions ───────────────────────────────

export type MnLayoutAction =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'COLLAPSE_SIDEBAR' }
  | { type: 'EXPAND_SIDEBAR' }
  | { type: 'ENTER_FULLSCREEN' }
  | { type: 'EXIT_FULLSCREEN' }
  | { type: 'VIEWPORT_CHANGE'; width: number };

// ── Breakpoints (px) ──────────────────────────────────────────────

export interface MnBreakpoints {
  readonly mobile: number;
  readonly tablet: number;
  readonly desktop: number;
}

export const DEFAULT_BREAKPOINTS: MnBreakpoints = {
  mobile: 640,
  tablet: 1024,
  desktop: 1280,
} as const;

// ── Transition table ───────────────────────────────────────────────

export interface MnLayoutTransition {
  readonly from: MnLayoutState;
  readonly to: MnLayoutState;
  readonly action: MnLayoutAction['type'];
}

/** State before fullscreen was entered, used for EXIT_FULLSCREEN restore. */
type PreFullscreenState = Exclude<MnLayoutState, 'fullscreen'>;

export interface MnLayoutContext {
  readonly state: MnLayoutState;
  readonly previousState: MnLayoutState | null;
  readonly viewportWidth: number;
  readonly breakpoints: MnBreakpoints;
}

// ── Viewport → default state mapping ──────────────────────────────

export function stateForViewport(
  width: number,
  breakpoints: MnBreakpoints = DEFAULT_BREAKPOINTS,
): PreFullscreenState {
  if (width < breakpoints.mobile) return 'mobile-nav';
  if (width < breakpoints.tablet) return 'sidebar-collapsed';
  return 'sidebar-open';
}

// ── Pure transition function ──────────────────────────────────────

export function transition(
  ctx: MnLayoutContext,
  action: MnLayoutAction,
): MnLayoutContext {
  const { state, breakpoints } = ctx;

  switch (action.type) {
    case 'VIEWPORT_CHANGE': {
      const target = stateForViewport(action.width, breakpoints);
      if (state === 'fullscreen') {
        return { ...ctx, viewportWidth: action.width };
      }
      if (target === state) {
        return { ...ctx, viewportWidth: action.width };
      }
      return {
        ...ctx,
        state: target,
        previousState: state,
        viewportWidth: action.width,
      };
    }

    case 'TOGGLE_SIDEBAR': {
      if (state === 'fullscreen') return ctx;
      if (state === 'mobile-nav') return ctx;
      const next: MnLayoutState =
        state === 'sidebar-open' ? 'sidebar-collapsed' : 'sidebar-open';
      return { ...ctx, state: next, previousState: state };
    }

    case 'COLLAPSE_SIDEBAR': {
      if (state !== 'sidebar-open') return ctx;
      return { ...ctx, state: 'sidebar-collapsed', previousState: state };
    }

    case 'EXPAND_SIDEBAR': {
      if (state !== 'sidebar-collapsed') return ctx;
      return { ...ctx, state: 'sidebar-open', previousState: state };
    }

    case 'ENTER_FULLSCREEN': {
      if (state === 'fullscreen') return ctx;
      return { ...ctx, state: 'fullscreen', previousState: state };
    }

    case 'EXIT_FULLSCREEN': {
      if (state !== 'fullscreen') return ctx;
      const prev = ctx.previousState;
      let restore: PreFullscreenState;
      if (prev === null || prev === 'fullscreen') {
        restore = stateForViewport(ctx.viewportWidth, breakpoints);
      } else {
        restore = prev;
      }
      return { ...ctx, state: restore, previousState: 'fullscreen' };
    }

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

// ── Context factory ────────────────────────────────────────────────

export function createLayoutContext(
  viewportWidth: number,
  breakpoints: MnBreakpoints = DEFAULT_BREAKPOINTS,
): MnLayoutContext {
  return {
    state: stateForViewport(viewportWidth, breakpoints),
    previousState: null,
    viewportWidth,
    breakpoints,
  };
}

// ── Guard helpers ──────────────────────────────────────────────────

export function canToggleSidebar(state: MnLayoutState): boolean {
  return state === 'sidebar-open' || state === 'sidebar-collapsed';
}

export function isMobile(ctx: MnLayoutContext): boolean {
  return ctx.viewportWidth < ctx.breakpoints.mobile;
}

export function isTablet(ctx: MnLayoutContext): boolean {
  const { viewportWidth: w, breakpoints: bp } = ctx;
  return w >= bp.mobile && w < bp.tablet;
}

export function isDesktop(ctx: MnLayoutContext): boolean {
  return ctx.viewportWidth >= ctx.breakpoints.tablet;
}

// ── All valid transitions (declarative reference) ──────────────────

export const VALID_TRANSITIONS: readonly MnLayoutTransition[] = [
  { from: 'sidebar-open', to: 'sidebar-collapsed', action: 'TOGGLE_SIDEBAR' },
  { from: 'sidebar-open', to: 'sidebar-collapsed', action: 'COLLAPSE_SIDEBAR' },
  { from: 'sidebar-open', to: 'fullscreen', action: 'ENTER_FULLSCREEN' },
  { from: 'sidebar-collapsed', to: 'sidebar-open', action: 'TOGGLE_SIDEBAR' },
  { from: 'sidebar-collapsed', to: 'sidebar-open', action: 'EXPAND_SIDEBAR' },
  { from: 'sidebar-collapsed', to: 'fullscreen', action: 'ENTER_FULLSCREEN' },
  { from: 'mobile-nav', to: 'fullscreen', action: 'ENTER_FULLSCREEN' },
  { from: 'fullscreen', to: 'sidebar-open', action: 'EXIT_FULLSCREEN' },
  { from: 'fullscreen', to: 'sidebar-collapsed', action: 'EXIT_FULLSCREEN' },
  { from: 'fullscreen', to: 'mobile-nav', action: 'EXIT_FULLSCREEN' },
] as const;
