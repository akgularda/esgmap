import * as ESG from "../data/esg";
import type { MetricKey } from "../types";
import { Icon } from "../ui/Icon";

export function TimeSlider({ year, setYear, metric }: {
  year: number;
  setYear: (y: number) => void;
  metric: MetricKey;
}) {
  const disabled = !ESG.METRICS[metric].hasHistory;
  return (
    <div style={{ background: "rgba(19,24,21,.92)", border: "1px solid var(--border)", borderRadius: 11, padding: "12px 16px 13px", width: 360, boxShadow: "var(--shadow)", backdropFilter: "blur(6px)", opacity: disabled ? 0.6 : 1 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-2)" }}>
          <Icon name="rank" size={14} style={{ color: "var(--text-3)" }} />
          Historical view
        </span>
        <span className="mono tnum" style={{ fontSize: 17, fontWeight: 600, color: disabled ? "var(--text-3)" : "var(--accent)" }}>{disabled ? "—" : year}</span>
      </div>
      <input type="range" min={ESG.YEAR_MIN} max={ESG.YEAR_MAX} step={1} value={year} disabled={disabled}
        onChange={(e) => setYear(+e.target.value)} className="esg-range" style={{ width: "100%" }} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
        <span className="mono" style={{ fontSize: 10, color: "var(--text-3)" }}>{ESG.YEAR_MIN}</span>
        <span style={{ fontSize: 10, color: "var(--text-3)" }}>{disabled ? "energy layers only" : "drag to replay trend"}</span>
        <span className="mono" style={{ fontSize: 10, color: "var(--text-3)" }}>{ESG.YEAR_MAX}</span>
      </div>
    </div>
  );
}
