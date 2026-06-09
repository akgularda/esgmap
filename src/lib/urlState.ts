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

export function parseHash(hash: string): Partial<AppState> {
  const out: Partial<AppState> = {};
  const raw = hash.replace(/^#/, "");
  if (!raw) return out;
  const p = new URLSearchParams(raw);
  if (p.get("m")) out.metric = p.get("m") as MetricKey;
  const y = p.get("y");
  if (y && /^\d{4}$/.test(y)) out.year = +y;
  if (p.get("c")) out.selected = p.get("c");
  const pin = p.get("pin");
  if (pin) out.pins = pin.split("~").filter(Boolean).slice(0, 2);
  if (p.get("v")) out.view = p.get("v") as ViewId;
  if (p.get("p")) out.palette = p.get("p") as Palette;
  return out;
}

/** Absolute permalink to the current state (for citations / copy-link). */
export function permalink(s: AppState): string {
  const base = location.origin + location.pathname;
  return base + toHash(s);
}
