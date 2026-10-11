// Package version - synced by release-it
export const PACKAGE_VERSION = '3.0.0';

// Maximum allowed lengths for various fields
// Single source of truth for all validation and adapter modules
export const MAX_CARD_NUMBER_LENGTH = 19;
export const MAX_CVC_LENGTH = 4;
export const MAX_NAME_LENGTH = 100;
export const MAX_EMAIL_LENGTH = 254;
export const MAX_PHONE_LENGTH = 20;
export const MAX_POSTAL_CODE_LENGTH = 20;
export const MAX_COUNTRY_LENGTH = 3;
export const MAX_EXPIRY_LENGTH = 4;
// Card number bounds used when no brand range applies: the shortest PAN any
// issued brand has (Visa 13) against the longest any network allows (19).
// Luhn validation gates on these; per-brand ranges live in
// core/formatters/card-formatter.ts.
export const MIN_CARD_NUMBER_LENGTH = 13;

// 'MM / YY' as the expiry input renders it: the 4 digits of MAX_EXPIRY_LENGTH
// plus the two separator characters, so a typed "12/26" or a pasted
// "12 / 26" both fit without truncation.
export const MAX_EXPIRY_DISPLAY_LENGTH = 7;

// CVC: Amex prints 4 digits, every other brand 3 (use MAX_CVC_LENGTH for the
// 4). Read these through getExpectedCvcLength() rather than re-deriving the
// brand check at each call site.
export const CVC_LENGTH_DEFAULT = 3;

// Popover chrome shared by all three bindings so the three widgets cannot
// disagree about stacking and size. CSS twins (src/vanilla/styles.scss and the
// Angular component's inline stylesheet) must keep this value in sync — CSS
// cannot import a TS constant.
export const DROPDOWN_Z_INDEX = 9999;
export const DROPDOWN_DEFAULT_MAX_HEIGHT = 300;

export const MAX_ADDRESS_LINE_LENGTH = 200;
export const MAX_CITY_LENGTH = 100;
export const MAX_STATE_LENGTH = 100;