/* ESGMap — deep-linkable app state via the URL hash.
 *
 * Serialises {metric, year, selected, pins, view, palette} into location.hash so
 * every view is a citable, shareable, embeddable permalink. Path-independent, so
 * it survives the relative GitHub Pages base. No router dependency. */
import type { MetricKey } from "../types";
import type { Palette } from "../data/esg";

export type ViewId = "rankings" | "trends" | "compare" | "about" | "scorelab" | "validate" | "explore";

export interface AppState {
  metric: MetricKey;
  year: number;
  selected: string | null; // match name
  pins: string[]; // match names
  view: ViewId | null;
  palette: Palette;
}

export function toHash(s: AppState): string {
  const p = new URLSearchParams();
  if (s.metric !== "renewable") p.set("m", s.metric);
  if (s.year) p.set("y", String(s.year));
  if (s.selected) p.set("c", s.selected);
  if (s.pins.length) p.set("pin", s.pins.join("~"));
  if (s.view) p.set("v", s.view);
  if (s.palette !== "default") p.set("p", s.palette);
  const q = p.toString();
  return q ? "#" + q : "";
}

const VALID_METRICS = new Set<string>(["renewable", "carbon", "co2pc", "pm25", "forest", "climate", "score"]);
const VALID_VIEWS = new Set<string>(["rankings", "trends", "compare", "about", "scorelab", "validate", "explore"]);
const VALID_PALETTES = new Set<string>(["default", "cividis", "mono"]);

export function parseHash(hash: string): Partial<AppState> {
  const out: Partial<AppState> = {};
  const raw = hash.replace(/^#/, "");
  if (!raw) return out;
  let p: URLSearchParams;
  try { p = new URLSearchParams(raw); } catch { return out; }
  // Validate every param against the known set — a garbage permalink must degrade
  // gracefully (ignored), never crash the app to a blank page.
  const m = p.get("m"); if (m && VALID_METRICS.has(m)) out.metric = m as MetricKey;
  const y = p.get("y"); if (y && /^\d{4}$/.test(y)) out.year = +y;
  if (p.get("c")) out.selected = p.get("c");
  const pin = p.get("pin"); if (pin) out.pins = pin.split("~").filter(Boolean).slice(0, 2);
  const v = p.get("v"); if (v && VALID_VIEWS.has(v)) out.view = v as ViewId;
  const pal = p.get("p"); if (pal && VALID_PALETTES.has(pal)) out.palette = pal as Palette;
  return out;
}

/** Absolute permalink to the current state (for citations / copy-link). */
export function permalink(s: AppState): string {
  const base = location.origin + location.pathname;
  return base + toHash(s);
}
