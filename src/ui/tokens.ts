/* ESGMap — shared visual tokens (colors, status styles, region tones). */
import type { DisclosureStatus, Region } from "../types";

export const MIX_COLORS: Record<string, string> = {
  hydro: "#3b8fd4",
  wind: "#5fbf7f",
  solar: "#e0c542",
  nuclear: "#a07fd4",
  fossil: "#6b5142",
  other: "#7f8a82",
};

export const MIX_LABELS: Record<string, string> = {
  hydro: "Hydro", wind: "Wind", solar: "Solar", nuclear: "Nuclear", fossil: "Fossil", other: "Other",
};

export const STATUS_STYLE: Record<string, { c: string; label: string }> = {
  ratified: { c: "#5fbf7f", label: "Ratified" },
  mandatory: { c: "#5fbf7f", label: "Mandatory" },
  adopting: { c: "#7fb86a", label: "Adopting" },
  roadmap: { c: "#e0c542", label: "Roadmap" },
  consulting: { c: "#e0a23c", label: "Consulting" },
  signed: { c: "#e0a23c", label: "Signed" },
  withdrawn: { c: "#d4503e", label: "Withdrawn" },
  none: { c: "#8a948c", label: "None" },
};

export function statusStyle(s: DisclosureStatus | null | undefined) {
  return (s && STATUS_STYLE[s]) || STATUS_STYLE.none;
}

const REGION_TONES: Record<Region, string> = {
  Europe: "#3b8fd4",
  Asia: "#d4823c",
  Africa: "#e0c542",
  Americas: "#5fbf7f",
  "Middle East": "#a07fd4",
  Oceania: "#3bc4c4",
  Eurasia: "#c4683b",
};

export function regionFlagTone(region: string): string {
  return REGION_TONES[region as Region] || "#7f8a82";
}
