/**
 * Pure, framework-agnostic combobox state machine shared by the vanilla,
 * React, and Angular country-autocomplete bindings. All decision logic
 * (open/close, filtering, highlight navigation, viewport placement)
 * lives here so the three bindings can never drift apart.
 *
 * This module is self-contained: it must not import from any
 * country-specific module (that would both reverse the dependency and pull
 * the country dataset into generic combobox consumers). The country
 * module adapts its data to the generic `ComboboxItem` shape here.
 */

export interface ComboboxItem {
  /** Stable identifier (e.g. the ISO country code). */
  value: string;
  /** Human-readable label (e.g. the country name). */
  label: string;
}

/** Moves a highlighted index within bounds, wrapping at the ends. */
export function moveHighlight(
  current: number,
  direction: 'up' | 'down',
  length: number,
): number {
  if (length === 0) return -1;
  // No current selection: both directions should land on the first item
  // rather than wrapping a "phantom" index onto the last one.
  if (current < 0) return 0;
  if (direction === 'down') {
    return current < length - 1 ? current + 1 : 0;
  }
  return current > 0 ? current - 1 : length - 1;
}

export interface ComboboxState {
  isOpen: boolean;
  query: string;
  highlightedIndex: number;
}

export type ComboboxAction =
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'toggle' }
  | { type: 'setQuery'; query: string }
  | { type: 'setHighlight'; index: number }
  | { type: 'move'; direction: 'up' | 'down'; count: number };

export const INITIAL_COMBOBOX_STATE: ComboboxState = {
  isOpen: false,
  query: '',
  highlightedIndex: -1,
};

/**
 * State transition function. Opening resets the query and highlight so a
 * fresh list (with the search box cleared) is shown on every open; closing
 * also resets, so the previous filter never persists.
 */
export function comboboxReduce(
  state: ComboboxState,
  action: ComboboxAction,
): ComboboxState {
  switch (action.type) {
    case 'open':
      return { isOpen: true, query: '', highlightedIndex: -1 };
    case 'close':
      return { isOpen: false, query: '', highlightedIndex: -1 };
    case 'toggle':
      return state.isOpen
        ? comboboxReduce(state, { type: 'close' })
        : comboboxReduce(state, { type: 'open' });
    case 'setQuery':
      return { ...state, query: action.query, highlightedIndex: -1 };
    case 'setHighlight':
      return { ...state, highlightedIndex: action.index };
    case 'move':
      return {
        ...state,
        highlightedIndex: moveHighlight(
          state.highlightedIndex,
          action.direction,
          action.count,
        ),
      };
    default: {
      // Exhaustiveness guard: adding a new action to the union without
      // handling it here is a compile-time error. At runtime (untyped JS
      // callers) fail loudly at the dispatch site instead of poisoning the
      // state with `undefined` and crashing later inside a binding.
      const _exhaustive: never = action;
      throw new Error(
        `Unknown combobox action: ${String((_exhaustive as { type?: unknown }).type)}`,
      );
    }
  }
}

export interface ComboboxFilterOptions {
  /**
   * When false (default), values match only on exact equality. When true,
   * values also participate in prefix/contains matching. Consumers whose
   * `value` is a short code should keep the default so a partial query
   * does not surface unrelated items whose code happens to start with it.
   */
  includeValuePrefixMatch?: boolean;
}

/**
 * Filters combobox items by label or value (case-insensitive).
 * - Label matches that start with the query are prioritized, then label
 *   matches that merely contain it.
 * - Values match exactly unless `includeValuePrefixMatch` is set, in which
 *   case values also match on prefix/contains.
 */
export function comboboxFilter<T extends ComboboxItem>(
  items: readonly T[],
  query: string,
  options: ComboboxFilterOptions = {},
): T[] {
  const term = (query ?? '').toLowerCase().trim();
  if (!term) return [...items];

  const { includeValuePrefixMatch = false } = options;

  const startsWith: T[] = [];
  const contains: T[] = [];

  for (const item of items) {
    const label = item.label.toLowerCase();
    const value = item.value.toLowerCase();
    const valuePrefix = includeValuePrefixMatch
      ? value.startsWith(term)
      : value === term;

    if (label.startsWith(term) || valuePrefix) {
      startsWith.push(item);
    } else if (label.includes(term) || (includeValuePrefixMatch && value.includes(term))) {
      contains.push(item);
    }
  }

  return [...startsWith, ...contains];
}

/**
 * Margin left above an above-placement dropdown, so its top edge does not
 * touch the top of the viewport. Load-bearing for all three bindings —
 * change deliberately, not accidentally.
 */
const ABOVE_VIEWPORT_GAP = 10;

export interface DropdownAnchor {
  top: number;
  bottom: number;
}

export interface DropdownPlacement {
  placement: 'above' | 'below';
  top: number;
  maxHeight: number;
}

export interface DropdownPlacementOptions {
  /** Never flip above; clamp maxHeight to the space below the anchor. */
  forceBelow?: boolean;
}

/**
 * Computes where a dropdown should be positioned relative to its anchor,
 * preferring to render below it and flipping above only when the dropdown
 * would overflow the bottom of the viewport.
 */
export function computeDropdownPlacement(
  anchor: DropdownAnchor,
  dropdownHeight: number,
  viewportHeight: number,
  options: DropdownPlacementOptions = {},
): DropdownPlacement {
  const spaceBelow = viewportHeight - anchor.bottom;
  const spaceAbove = anchor.top;

  if (
    !options.forceBelow &&
    spaceBelow < dropdownHeight &&
    spaceAbove > spaceBelow
  ) {
    return {
      placement: 'above',
      top: Math.max(anchor.top - dropdownHeight, 0),
      maxHeight: Math.max(anchor.top - ABOVE_VIEWPORT_GAP, 0),
    };
  }

  return {
    placement: 'below',
    top: anchor.bottom,
    // Never taller than the space that actually exists below the anchor:
    // an unclamped list would run past the bottom of the viewport (the
    // dropdown is position:fixed, so nothing clips it back).
    maxHeight: Math.max(0, Math.min(dropdownHeight, spaceBelow)),
  };
}
