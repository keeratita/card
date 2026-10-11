import { describe, it, expect } from 'vitest';
import {
  comboboxKeyCommand,
  isComboboxKeyHandled,
  type ComboboxKeyModifiers,
} from '../../src/core/form/combobox';
import {
  comboboxReduce,
  comboboxFilter,
  computeDropdownPlacement,
  moveHighlight,
  INITIAL_COMBOBOX_STATE,
  ComboboxState,
} from '../../src/core/form/combobox';
import * as formBarrel from '../../src/core/form';

const openState: ComboboxState = { isOpen: true, query: 'ab', highlightedIndex: 3 };

describe('Core Form - combobox', () => {
  describe('moveHighlight', () => {
    it('returns -1 for an empty list', () => {
      expect(moveHighlight(0, 'down', 0)).toBe(-1);
    });

    it('lands on the first item from no selection in either direction', () => {
      expect(moveHighlight(-1, 'down', 4)).toBe(0);
      expect(moveHighlight(-1, 'up', 4)).toBe(0);
    });

    it('wraps down from the end to the first item', () => {
      expect(moveHighlight(3, 'down', 4)).toBe(0);
    });

    it('wraps up from the first item to the last', () => {
      expect(moveHighlight(0, 'up', 4)).toBe(3);
    });
  });

  describe('comboboxReduce', () => {
    it('starts closed with an empty query and no highlight', () => {
      expect(INITIAL_COMBOBOX_STATE).toEqual({
        isOpen: false,
        query: '',
        highlightedIndex: -1,
      });
    });

    it('opens and resets the query and highlight', () => {
      const next = comboboxReduce(openState, { type: 'open' });
      expect(next).toEqual({ isOpen: true, query: '', highlightedIndex: -1 });
    });

    it('closes and resets the query and highlight', () => {
      const next = comboboxReduce(openState, { type: 'close' });
      expect(next).toEqual({
        isOpen: false,
        query: '',
        highlightedIndex: -1,
      });
    });

    it('toggles closed when currently open', () => {
      expect(
        comboboxReduce(openState, { type: 'toggle' }).isOpen,
      ).toBe(false);
    });

    it('toggles open when currently closed', () => {
      expect(
        comboboxReduce(INITIAL_COMBOBOX_STATE, { type: 'toggle' }).isOpen,
      ).toBe(true);
    });

    it('setQuery updates the query and clears the highlight', () => {
      const next = comboboxReduce(openState, {
        type: 'setQuery',
        query: 'th',
      });
      expect(next.query).toBe('th');
      expect(next.highlightedIndex).toBe(-1);
    });

    it('setHighlight sets the highlight directly', () => {
      const next = comboboxReduce(openState, { type: 'setHighlight', index: 5 });
      expect(next.highlightedIndex).toBe(5);
    });

    it('move wraps the highlight at the end of the list', () => {
      const atEnd = comboboxReduce(openState, {
        type: 'move',
        direction: 'down',
        count: 4,
      });
      expect(atEnd.highlightedIndex).toBe(0);
    });

    it('move with zero items always yields -1', () => {
      const next = comboboxReduce(openState, {
        type: 'move',
        direction: 'down',
        count: 0,
      });
      expect(next.highlightedIndex).toBe(-1);
    });

    // Bindings dispatch actions built elsewhere; an unhandled action must
    // fail at the dispatch site instead of silently poisoning the state.
    it('throws on an unknown action instead of returning stale state', () => {
      const rogue = { type: 'explode' } as unknown as Parameters<
        typeof comboboxReduce
      >[1];
      expect(() => comboboxReduce(openState, rogue)).toThrow();
    });
  });

  describe('comboboxFilter', () => {
    const items = [
      { value: 'AF', label: 'Afghanistan' },
      { value: 'TH', label: 'Thailand' },
      { value: 'TW', label: 'Taiwan' },
      { value: 'TD', label: 'Chad' },
      { value: 'US', label: 'United States' },
    ];

    it('returns all items for an empty query', () => {
      expect(comboboxFilter(items, '')).toHaveLength(items.length);
      expect(comboboxFilter(items, '  ')).toHaveLength(items.length);
    });

    it('prioritizes label starts-with over label contains', () => {
      const results = comboboxFilter(items, 't');
      const thaiIndex = results.findIndex((i) => i.value === 'TH');
      const taiwanIndex = results.findIndex((i) => i.value === 'TW');
      const afIndex = results.findIndex((i) => i.value === 'AF');
      expect(thaiIndex).toBeGreaterThanOrEqual(0);
      expect(taiwanIndex).toBeGreaterThanOrEqual(0);
      expect(thaiIndex).toBeLessThan(afIndex);
      expect(taiwanIndex).toBeLessThan(afIndex);
    });

    it('matches an exact value but never a partial value by default', () => {
      const exact = comboboxFilter(items, 'US');
      expect(exact.map((i) => i.value)).toEqual(['US']);

      // "T" must not surface Chad (value "TD") — values only match exactly.
      const partial = comboboxFilter(items, 't');
      expect(partial.map((i) => i.value)).not.toContain('TD');
    });

    it('includes value prefix/contains matches when includeValuePrefixMatch is set', () => {
      const prefix = comboboxFilter(items, 't', { includeValuePrefixMatch: true });
      // Chad (value "TD") now matches via its value prefix.
      expect(prefix.map((i) => i.value)).toContain('TD');
    });

    it('matches mid-value substrings only when includeValuePrefixMatch is set', () => {
      // 'bc' is a mid-value substring, not a prefix; no label contains it.
      const coded = [
        { value: 'ABC', label: 'Orange' },
        { value: 'DEF', label: 'Mango' },
      ];
      expect(
        comboboxFilter(coded, 'bc', { includeValuePrefixMatch: true }).map(
          (i) => i.value,
        ),
      ).toContain('ABC');
      expect(comboboxFilter(coded, 'bc').map((i) => i.value)).not.toContain(
        'ABC',
      );
    });

    it('is case-insensitive', () => {
      expect(comboboxFilter(items, 'THA')).toHaveLength(1);
      expect(comboboxFilter(items, 'tha')).toHaveLength(1);
    });

    it('does not mutate the input list', () => {
      const before = items.map((i) => i.value);
      comboboxFilter(items, 't');
      expect(items.map((i) => i.value)).toEqual(before);
    });
  });

  describe('computeDropdownPlacement', () => {
    const anchor = { top: 100, bottom: 140 };

    it('renders below when there is enough space', () => {
      const placement = computeDropdownPlacement(anchor, 300, 800);
      expect(placement.placement).toBe('below');
      expect(placement.top).toBe(140);
      expect(placement.maxHeight).toBe(300);
    });

    it('renders above when space below is insufficient and space above is larger', () => {
      const placement = computeDropdownPlacement(
        { top: 250, bottom: 290 },
        300,
        350,
      );
      expect(placement.placement).toBe('above');
      expect(placement.top).toBe(0);
      expect(placement.maxHeight).toBe(240);
    });

    it('stays below when space above is also insufficient', () => {
      // Both sides are too small; below wins (matches the bindings).
      const placement = computeDropdownPlacement({ top: 10, bottom: 50 }, 300, 100);
      expect(placement.placement).toBe('below');
    });

    it('forceBelow never flips and clamps to the space below', () => {
      const placement = computeDropdownPlacement(
        { top: 250, bottom: 290 },
        300,
        350,
        { forceBelow: true },
      );
      expect(placement.placement).toBe('below');
      expect(placement.maxHeight).toBe(60);
    });

    it('never returns a negative top or maxHeight', () => {
      // Above placement near the top of the viewport stays clamped at 0.
      const placement = computeDropdownPlacement(
        { top: 20, bottom: 30 },
        300,
        40,
      );
      expect(placement.placement).toBe('above');
      expect(placement.top).toBeGreaterThanOrEqual(0);
      expect(placement.maxHeight).toBeGreaterThanOrEqual(0);
    });
  });

  // The bindings import the combobox core through the `core/form` barrel;
  // a missing re-export would break every binding at build time.
  describe('core/form barrel re-exports', () => {
    it('exposes the combobox API consumers rely on', () => {
      expect(formBarrel.comboboxReduce).toBe(comboboxReduce);
      expect(formBarrel.comboboxFilter).toBe(comboboxFilter);
      expect(formBarrel.computeDropdownPlacement).toBe(
        computeDropdownPlacement,
      );
      expect(formBarrel.moveHighlight).toBe(moveHighlight);
      expect(formBarrel.INITIAL_COMBOBOX_STATE).toBe(INITIAL_COMBOBOX_STATE);
    });

    it('keeps the shared state type assignable through the barrel', () => {
      // Compile-time guarantee: the barrel's types match the module's.
      const state: formBarrel.ComboboxState = INITIAL_COMBOBOX_STATE;
      const action: formBarrel.ComboboxAction = { type: 'open' };
      const item: formBarrel.ComboboxItem = { value: 'TH', label: 'Thailand' };
      const options: formBarrel.ComboboxFilterOptions = {
        includeValuePrefixMatch: true,
      };
      const anchor: formBarrel.DropdownAnchor = { top: 0, bottom: 10 };
      const placement: formBarrel.DropdownPlacement = {
        placement: 'below',
        top: 10,
        maxHeight: 100,
      };
      expect(formBarrel.comboboxReduce(state, action).isOpen).toBe(true);
      expect(formBarrel.comboboxFilter([item], 'th', options)).toHaveLength(1);
      expect(placement.placement).toBe('below');
      expect(anchor.bottom).toBe(10);
    });
  });
});

const open = (highlightedIndex = -1, query = ''): ComboboxState => ({
  isOpen: true,
  query,
  highlightedIndex,
});
const closed: ComboboxState = { isOpen: false, query: '', highlightedIndex: -1 };

describe('comboboxKeyCommand', () => {
  it('is the single key map: activation keys open a closed list from the trigger', () => {
    for (const key of ['ArrowDown', 'ArrowUp', 'Enter', ' ']) {
      expect(comboboxKeyCommand(key, closed, 'trigger')).toEqual({ type: 'open' });
    }
  });

  it('does not let the search input open a closed list', () => {
    for (const key of ['ArrowDown', 'ArrowUp', 'Enter', ' ']) {
      expect(comboboxKeyCommand(key, closed, 'search')).toEqual({ type: 'ignore' });
    }
  });

  it('opens a closed list with a bare printable character as the filter', () => {
    expect(comboboxKeyCommand('t', closed, 'trigger')).toEqual({
      type: 'open',
      query: 't',
    });
  });

  it.each([
    ['with meta', { metaKey: true }],
    ['with ctrl', { ctrlKey: true }],
    ['with alt', { altKey: true }],
  ])('ignores a modified key %s so shortcuts are not swallowed', (_label, mods) => {
    expect(
      comboboxKeyCommand('t', closed, 'trigger', mods as ComboboxKeyModifiers),
    ).toEqual({ type: 'ignore' });
  });

  it('navigates and selects while open', () => {
    expect(comboboxKeyCommand('ArrowDown', open(0), 'trigger')).toEqual({
      type: 'move',
      direction: 'down',
    });
    expect(comboboxKeyCommand('ArrowUp', open(3), 'search')).toEqual({
      type: 'move',
      direction: 'up',
    });
    expect(comboboxKeyCommand('Enter', open(2), 'search')).toEqual({
      type: 'select',
    });
  });

  it('keeps Space typeable in the search input and inert on the trigger', () => {
    expect(comboboxKeyCommand(' ', open(0), 'search')).toEqual({ type: 'ignore' });
    expect(comboboxKeyCommand(' ', open(0), 'trigger')).toEqual({ type: 'ignore' });
  });

  it('dismisses from the trigger when nothing is highlighted, but does not commit from the search box', () => {
    expect(comboboxKeyCommand('Enter', open(-1), 'trigger')).toEqual({
      type: 'close',
      restoreFocusToTrigger: false,
    });
    expect(comboboxKeyCommand('Enter', open(-1), 'search')).toEqual({
      type: 'ignore',
    });
  });

  it('returns focus to the trigger only when closing from the search box', () => {
    expect(comboboxKeyCommand('Escape', open(1), 'search')).toEqual({
      type: 'close',
      restoreFocusToTrigger: true,
    });
    expect(comboboxKeyCommand('Escape', open(1), 'trigger')).toEqual({
      type: 'close',
      restoreFocusToTrigger: false,
    });
  });

  it('reports every command except ignore as handled', () => {
    expect(isComboboxKeyHandled({ type: 'ignore' })).toBe(false);
    expect(isComboboxKeyHandled({ type: 'open' })).toBe(true);
    expect(isComboboxKeyHandled({ type: 'close', restoreFocusToTrigger: false })).toBe(true);
  });
});

describe("comboboxReduce 'open' seeding", () => {
  it('applies query and highlight, so bindings never spread the reduced state', () => {
    expect(comboboxReduce(closed, { type: 'open', query: 'th', highlight: 5 })).toEqual({
      isOpen: true,
      query: 'th',
      highlightedIndex: 5,
    });
  });

  it('defaults to a fresh unhighlighted list', () => {
    expect(comboboxReduce(open(4, 'stale'), { type: 'open' })).toEqual({
      isOpen: true,
      query: '',
      highlightedIndex: -1,
    });
  });
});
