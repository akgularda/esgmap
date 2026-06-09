import * as ESG from "../data/esg";
import type { MetricKey } from "../types";
import type { Scales } from "../data/esg";
import { gradientCss } from "../layers";

export function Legend({ metric, scales }: { metric: MetricKey; scales: Scales }) {
  const M = ESG.METRICS[metric];
  return (
    <div style={{ background: "rgba(19,24,21,.92)", border: "1px solid var(--border)", borderRadius: 11, padding: "12px 15px 11px", width: 300, boxShadow: "var(--shadow)", backdropFilter: "blur(6px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600 }}>{M.label}</span>
        <span className="mono" style={{ fontSize: 10.5, color: "var(--text-3)" }}>{M.unit}</span>
      </div>
      <div style={{ height: 11, borderRadius: 4, background: gradientCss(metric, scales), border: "1px solid var(--border)" }} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        {M.ticks.map((t) => <span key={t} className="mono tnum" style={{ fontSize: 10, color: "var(--text-3)" }}>{t}</span>)}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 10.5, color: "var(--text-3)" }}>
        <span style={{ width: 11, height: 11, borderRadius: 3, background: ESG.NO_DATA, border: "1px solid var(--border-2)" }} />
        No data in this edition
      </div>
    </div>
  );
}
