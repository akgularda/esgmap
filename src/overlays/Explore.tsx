/* ESGMap — Explore: scatter any two indicators, coloured by region, with explicit
 * missing-data accounting. Supports hypothesis-style problem sets. */
import { useMemo, useState } from "react";
import * as ESG from "../data/esg";
import type { CountryRecord, MetricKey } from "../types";
import { OverlayCard } from "./OverlayCard";
import { LAYERS } from "../layers";
import { spearman, pairwise } from "../lib/stats";
import { regionFlagTone } from "../ui/tokens";

export function ExploreOverlay({ onPick, onClose }: {
  onPick: (c: CountryRecord) => void;
  onClose: () => void;
}) {
  const [x, setX] = useState<MetricKey>("co2pc");
  const [y, setY] = useState<MetricKey>("renewable");
  const Mx = ESG.METRICS[x], My = ESG.METRICS[y];

  const pts = useMemo(() => ESG.all
    .map((c) => ({ c, x: c[x] as number | null, y: c[y] as number | null }))
    .filter((p) => p.x != null && p.y != null) as { c: CountryRecord; x: number; y: number }[], [x, y]);
  const omitted = ESG.all.length - pts.length;
  const rho = useMemo(() => { const [a, b] = pairwise(pts, (p) => p.x, (p) => p.y); return spearman(a, b); }, [pts]);

  const W = 640, H = 380, pad = { l: 52, r: 16, t: 12, b: 40 };
  const xmax = Math.max(...pts.map((p) => p.x), Mx.domain[1] * 0.2);
  const ymax = Math.max(...pts.map((p) => p.y), My.domain[1] * 0.2);
  const sx = (v: number) => pad.l + (v / xmax) * (W - pad.l - pad.r);
  const sy = (v: number) => H - pad.b - (v / ymax) * (H - pad.t - pad.b);

  const picker = (val: MetricKey, set: (m: MetricKey) => void, label: string) => (
    <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--text-3)" }}>
      {label}
      <select value={val} onChange={(e) => set(e.target.value as MetricKey)}
        style={{ background: "var(--panel-2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 7, padding: "5px 8px", fontSize: 12.5 }}>
        {LAYERS.map((l) => <option key={l.value} value={l.value}>{ESG.METRICS[l.value].label}</option>)}
      </select>
    </label>
  );

  return (
    <OverlayCard title="Explore relationships" subtitle="Scatter any two indicators across the atlas" icon="compare" onClose={onClose} width={720}>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        {picker(y, setY, "Y")}
        {picker(x, setX, "X")}
        <span className="mono tnum" style={{ fontSize: 12, color: "var(--text-2)", marginLeft: "auto" }}>Spearman ρ = {rho == null ? "—" : rho.toFixed(2)}</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", background: "var(--panel-2)", borderRadius: 10, border: "1px solid var(--border)" }}>
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
          <g key={i}>
            <line x1={sx(xmax * f)} x2={sx(xmax * f)} y1={pad.t} y2={H - pad.b} stroke="#222a25" />
            <line x1={pad.l} x2={W - pad.r} y1={sy(ymax * f)} y2={sy(ymax * f)} stroke="#222a25" />
            <text x={sx(xmax * f)} y={H - pad.b + 14} textAnchor="middle" fontSize="9" fill="#8a948c" fontFamily="var(--mono)">{Math.round(xmax * f)}</text>
            <text x={pad.l - 6} y={sy(ymax * f) + 3} textAnchor="end" fontSize="9" fill="#8a948c" fontFamily="var(--mono)">{Math.round(ymax * f)}</text>
          </g>
        ))}
        <text x={(pad.l + W) / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--text-2)">{Mx.label} ({Mx.unit})</text>
        <text x={-(H / 2)} y={14} transform="rotate(-90)" textAnchor="middle" fontSize="11" fill="var(--text-2)">{My.label} ({My.unit})</text>
        {pts.map((p) => (
          <circle key={p.c.iso3} cx={sx(p.x)} cy={sy(p.y)} r={4.5} fill={regionFlagTone(p.c.region)} fillOpacity={0.78} stroke="#0c100e" strokeWidth={0.6}
            style={{ cursor: "pointer" }} onClick={() => onPick(p.c)}>
            <title>{p.c.name}: {My.short} {My.fmt(p.y)}, {Mx.short} {Mx.fmt(p.x)}</title>
          </circle>
        ))}
      </svg>
      <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 8 }}>
        {pts.length} of {ESG.all.length} territories plotted{omitted ? ` · ${omitted} omitted (missing data — never plotted as zero)` : ""}. Click a point to open its profile.
      </div>
    </OverlayCard>
  );
}
