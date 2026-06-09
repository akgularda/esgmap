import { useMemo, useState } from "react";
import * as ESG from "../data/esg";
import { OverlayCard } from "./OverlayCard";
import { LineChart } from "../ui/LineChart";
import { Segmented } from "../ui/Segmented";
import { regionFlagTone } from "../ui/tokens";

export function RegionTrendsOverlay({ onClose }: { onClose: () => void }) {
  const [tm, setTm] = useState<"renewable" | "carbon">("renewable");
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const series = useMemo(() => ESG.regionalTrend(tm), [tm]);
  const M = ESG.METRICS[tm];
  const visible = series.filter((s) => !hidden[s.region]);
  const yMax = tm === "renewable" ? 100 : Math.max(200, Math.ceil(Math.max(...series.flatMap((s) => s.values)) / 100) * 100);
  const lc = visible.map((s) => ({ years: s.years, values: s.values, color: regionFlagTone(s.region), label: s.region }));

  return (
    <OverlayCard title="Regional trends" subtitle={`Average ${M.short.toLowerCase()} by region · ${ESG.YEAR_MIN}–${ESG.YEAR_MAX} (major economies)`} icon="arrowUp" onClose={onClose} width={780}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 0 16px" }}>
        <Segmented size="sm" value={tm} onChange={setTm}
          options={[{ value: "renewable", label: "Renewables" }, { value: "carbon", label: "Carbon intensity" }]} />
        <span style={{ fontSize: 11.5, color: "var(--text-3)" }}>Click a region to toggle it</span>
      </div>

      {lc.length > 0 ? (
        <LineChart width={720} height={300} series={lc} yMax={yMax} />
      ) : (
        <div style={{ height: 300, display: "grid", placeItems: "center", color: "var(--text-3)" }}>Select at least one region</div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginTop: 16 }}>
        {series.map((s) => {
          const off = hidden[s.region];
          const last = s.values[s.values.length - 1];
          const first = s.values[0];
          const d = Math.round((last - first) * 10) / 10;
          const good = tm === "renewable" ? d >= 0 : d <= 0;
          return (
            <button key={s.region} onClick={() => setHidden((h) => ({ ...h, [s.region]: !h[s.region] }))}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 11px", borderRadius: 8, border: "1px solid var(--border)", background: off ? "transparent" : "var(--panel-2)", opacity: off ? 0.45 : 1 }}>
              <span style={{ width: 12, height: 3, borderRadius: 2, background: regionFlagTone(s.region) }} />
              <span style={{ fontSize: 12.5, fontWeight: 500 }}>{s.region}</span>
              <span className="mono tnum" style={{ fontSize: 12, color: "var(--text)" }}>{M.fmt(last)}</span>
              <span className="mono tnum" style={{ fontSize: 11, color: good ? "var(--accent)" : "var(--bad)" }}>{d >= 0 ? "+" : ""}{d}{M.unit === "%" ? "pp" : ""}</span>
            </button>
          );
        })}
      </div>
    </OverlayCard>
  );
}
