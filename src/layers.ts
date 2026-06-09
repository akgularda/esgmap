import * as ESG from "./data/esg";
import type { MetricKey } from "./types";
import type { Scales } from "./data/esg";

export interface Layer {
  value: MetricKey;
  label: string;
  icon: string;
  desc: string;
}

export const LAYERS: Layer[] = [
  { value: "renewable", label: "Renewable power", icon: "leaf", desc: "Clean share of electricity" },
  { value: "carbon", label: "Carbon intensity", icon: "cloud", desc: "Grid CO₂ per kWh" },
  { value: "co2pc", label: "CO₂ per capita", icon: "bolt", desc: "Annual emissions / person" },
  { value: "pm25", label: "Air quality", icon: "cloud", desc: "PM2.5 pollution" },
  { value: "forest", label: "Forest cover", icon: "leaf", desc: "% of land forested" },
  { value: "climate", label: "Climate risk", icon: "target", desc: "Exposure & readiness" },
  { value: "score", label: "Sustainability score", icon: "globe", desc: "Composite index" },
];

export function gradientCss(key: MetricKey, scales: Scales): string {
  const M = ESG.METRICS[key], sc = scales[key];
  const [d0, d1] = M.domain;
  const stops: string[] = [];
  for (let i = 0; i <= 10; i++) {
    const v = d0 + ((d1 - d0) * i) / 10;
    stops.push(`${sc(v)} ${i * 10}%`);
  }
  return `linear-gradient(90deg, ${stops.join(",")})`;
}
