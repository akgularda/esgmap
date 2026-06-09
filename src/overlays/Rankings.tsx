import { useMemo, useState } from "react";
import * as ESG from "../data/esg";
import type { CountryRecord, MetricKey, Region } from "../types";
import type { Scales } from "../data/esg";
import { LAYERS } from "../layers";
import { OverlayCard } from "./OverlayCard";
import { regionFlagTone } from "../ui/tokens";

const REGIONS: (Region | "All")[] = ["All", "Europe", "Asia", "Americas", "Africa", "Middle East", "Oceania", "Eurasia"];

export function RankingsOverlay({ metric, scales, onPick, onClose }: {
  metric: MetricKey;
  scales: Scales;
  onPick: (c: CountryRecord) => void;
  onClose: () => void;
}) {
  const [sortMetric, setSortMetric] = useState<MetricKey>(metric);
  const [region, setRegion] = useState<Region | "All">("All");
  const M = ESG.METRICS[sortMetric];

  const list = useMemo(() => {
    const arr = ESG.all
      .filter((c) => region === "All" || c.region === region)
      .filter((c) => ESG.valueAt(c, sortMetric, ESG.YEAR_MAX) != null);
    return arr.slice().sort((a, b) => {
      const va = ESG.valueAt(a, sortMetric, ESG.YEAR_MAX)!, vb = ESG.valueAt(b, sortMetric, ESG.YEAR_MAX)!;
      return M.better === "high" ? vb - va : va - vb;
    });
  }, [sortMetric, region, M.better]);

  const maxV = list.length ? Math.max(...list.map((c) => ESG.valueAt(c, sortMetric, ESG.YEAR_MAX)!)) : 1;

  return (
    <OverlayCard title="Rankings" subtitle={`${list.length} territories · sorted by ${M.short.toLowerCase()}`} icon="rank" onClose={onClose} width={760}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start", padding: "0 0 14px" }}>
        <div>
          <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Metric</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {LAYERS.map((l) => (
              <button key={l.value} onClick={() => setSortMetric(l.value)} style={{
                fontSize: 11.5, padding: "5px 10px", borderRadius: 7, border: "1px solid " + (sortMetric === l.value ? "var(--border-2)" : "transparent"),
                background: sortMetric === l.value ? "var(--panel-2)" : "transparent", color: sortMetric === l.value ? "var(--text)" : "var(--text-3)", fontWeight: sortMetric === l.value ? 600 : 500,
              }}>{ESG.METRICS[l.value].short}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Region</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {REGIONS.map((r) => (
              <button key={r} onClick={() => setRegion(r)} style={{
                fontSize: 11.5, padding: "5px 10px", borderRadius: 7, border: "1px solid " + (region === r ? "var(--border-2)" : "transparent"),
                background: region === r ? "var(--panel-2)" : "transparent", color: region === r ? "var(--text)" : "var(--text-3)",
              }}>{r}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ overflowY: "auto", flex: 1, margin: "0 -6px", padding: "0 6px" }}>
        {list.map((c, i) => {
          const v = ESG.valueAt(c, sortMetric, ESG.YEAR_MAX)!;
          const w = Math.max(2, (M.better === "high" ? v / maxV : 1 - v / M.domain[1]) * 100);
          return (
            <button key={c.match} onClick={() => onPick(c)} style={{
              display: "grid", gridTemplateColumns: "30px 1fr 120px 64px", alignItems: "center", gap: 12, width: "100%",
              padding: "9px 12px", border: "none", borderBottom: "1px solid var(--border)", background: "transparent", textAlign: "left",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--panel-2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              <span className="mono tnum" style={{ fontSize: 13, color: i < 3 ? "var(--accent)" : "var(--text-3)", fontWeight: 600 }}>{i + 1}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: regionFlagTone(c.region), flex: "0 0 auto" }} />
                <span style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
                <span style={{ fontSize: 11, color: "var(--text-3)" }}>{c.region}</span>
              </span>
              <span style={{ height: 7, borderRadius: 4, background: "var(--elev)", overflow: "hidden" }}>
                <span style={{ display: "block", height: "100%", width: w + "%", background: scales[sortMetric](v) }} />
              </span>
              <span className="mono tnum" style={{ fontSize: 13.5, fontWeight: 600, textAlign: "right", color: scales[sortMetric](v) }}>{M.fmt(v)}</span>
            </button>
          );
        })}
      </div>
    </OverlayCard>
  );
}
