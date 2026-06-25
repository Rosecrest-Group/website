/** UK outward + inward postcode (lenient spacing). Used for soft UI hints only. */
export const UK_POSTCODE_REGEX =
  /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

export function isLikelyUkPostcode(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return UK_POSTCODE_REGEX.test(trimmed);
}

export function normalizeUkPostcode(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, " ");
}

export const UK_POSTCODE_HINT =
  "This doesn't look like a UK postcode (e.g. SW1A 1AA). You can still submit — we'll review it.";
