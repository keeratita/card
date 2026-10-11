/**
 * Pure, framework-agnostic country search helpers shared by the vanilla,
 * React, and Angular autocomplete wrappers so filtering stays consistent.
 * Keyboard highlight navigation lives in the generic `./combobox` module.
 */
import { COUNTRIES, Country } from '../../data/countries';
import { comboboxFilter } from './combobox';

/**
 * Filters countries by name or ISO code (case-insensitive).
 * - Name matches that start with the query are prioritized, then name
 *   matches that merely contain it.
 * - Codes only match on exact equality (e.g. "US" -> United States), so a
 *   partial query like "T" does not surface countries whose code happens to
 *   start with "T" (e.g. Chad "TD").
 *
 * Delegates matching to the shared combobox filter (see `comboboxFilter`)
 * so all bindings share one implementation, and carries the source objects
 * through the filter so caller identity — and duplicate codes in custom
 * lists — survive the round-trip.
 */
export function filterCountries(
  query: string,
  countries: readonly Country[] = COUNTRIES,
): Country[] {
  const items = countries.map((country) => ({
    value: country.code,
    label: country.name,
    source: country,
  }));
  return comboboxFilter(items, query).map((item) => item.source);
}

/** Finds a country by ISO code. */
export function findCountryByCode(
  code: string,
  countries: readonly Country[] = COUNTRIES,
): Country | undefined {
  if (!code) return undefined;
  return countries.find((country) => country.code === code);
}
