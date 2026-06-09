/* ESGMap — locale-aware number/date formatting.
 *
 * Centralises Intl formatting so a future locale switch (decimal comma, ISO dates)
 * flows everywhere. Defaults to the visitor's browser locale; numbers used inside
 * mono/tabular UI keep their plain look unless a locale is explicitly chosen. */
let LOCALE: string | undefined = undefined; // undefined → runtime/browser default

export function setLocale(loc: string | undefined) { LOCALE = loc; }
export function getLocale(): string { return LOCALE || (typeof navigator !== "undefined" ? navigator.language : "en"); }

export function fmtNumber(v: number, maximumFractionDigits = 1): string {
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits }).format(v);
}

export function fmtInt(v: number): string {
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 }).format(v);
}

export function fmtDate(iso: string): string {
  const d = new Date(iso.length <= 10 ? iso + "T00:00:00Z" : iso);
  if (isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(LOCALE, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(d);
}
