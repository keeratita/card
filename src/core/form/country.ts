import { COUNTRIES, Country } from '../../data/countries';

/**
 * Pure, framework-agnostic country search/filter and keyboard-navigation
 * helpers. Shared by the vanilla, React, and Angular autocomplete wrappers so
 * the filtering and navigation behavior stays consistent across bindings.
 */

/**
 * Filters countries by name or ISO code (case-insensitive).
 * - Name matches that start with the query are prioritized, then name matches
 *   that merely contain it.
 * - Codes only match on exact equality (e.g. "US" -> United States, "TH" ->
 *   Thailand), so a partial query like "T" does not surface countries whose
 *   code happens to start with "T" (e.g. Chad "TD").
 */
export function filterCountries(
  query: string,
  countries: readonly Country[] = COUNTRIES,
): Country[] {
  const term = (query ?? '').toLowerCase().trim();
  if (!term) return [...countries];

  const startsWith: Country[] = [];
  const contains: Country[] = [];

  for (const c of countries) {
    const name = c.name.toLowerCase();
    const code = c.code.toLowerCase();
    if (name.startsWith(term) || code === term) {
      startsWith.push(c);
    } else if (name.includes(term)) {
      contains.push(c);
    }
  }

  return [...startsWith, ...contains];
}

/** Moves a highlighted index within bounds, wrapping at the ends. */
export function moveHighlight(
  current: number,
  direction: 'up' | 'down',
  length: number,
): number {
  if (length === 0) return -1;
  if (direction === 'down') {
    return current < length - 1 ? current + 1 : 0;
  }
  return current > 0 ? current - 1 : length - 1;
}

/** Finds a country by ISO code. */
export function findCountryByCode(
  code: string,
  countries: readonly Country[] = COUNTRIES,
): Country | undefined {
  if (!code) return undefined;
  return countries.find((c) => c.code === code);
}
