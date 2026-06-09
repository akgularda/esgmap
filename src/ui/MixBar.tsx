import type { EnergyMix } from "../types";
import { MIX_COLORS, MIX_LABELS } from "./tokens";

const ORDER: (keyof EnergyMix)[] = ["hydro", "wind", "solar", "nuclear", "fossil", "other"];

export function MixBar({ mix }: { mix: EnergyMix }) {
  const total = ORDER.reduce((s, k) => s + (mix[k] || 0), 0) || 1;
  return (
    <div>
      <div style={{ display: "flex", height: 14, borderRadius: 4, overflow: "hidden", background: "#0c100e", border: "1px solid var(--border)" }}>
        {ORDER.map((k) => {
          const w = ((mix[k] || 0) / total) * 100;
          if (w <= 0) return null;
          return <div key={k} title={`${MIX_LABELS[k]} ${Math.round(mix[k])}%`} style={{ width: w + "%", background: MIX_COLORS[k] }} />;
        })}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 14px", marginTop: 10 }}>
        {ORDER.filter((k) => (mix[k] || 0) >= 0.5)
          .sort((a, b) => mix[b] - mix[a])
          .map((k) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              <span style={{ width: 9, height: 9, borderRadius: 2, background: MIX_COLORS[k] }} />
              <span style={{ color: "var(--text-2)" }}>{MIX_LABELS[k]}</span>
              <span className="mono tnum" style={{ color: "var(--text)" }}>{mix[k] >= 10 ? Math.round(mix[k]) : mix[k]}%</span>
            </div>
          ))}
      </div>
    </div>
  );
}
