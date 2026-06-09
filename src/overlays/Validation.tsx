/* ESGMap — Validation & statistical rigor.
 * (1) Spearman correlation matrix among the composite's sub-indicators (surfaces
 *     multicollinearity / double-counting). (2) Convergent validity vs an external
 *     peer-reviewed index. Both computed client-side from the shipped data. */
import { useMemo } from "react";
import * as ESG from "../data/esg";
import type { SubScoreKey } from "../types";
import { OverlayCard } from "./OverlayCard";
import { spearman, pairwise } from "../lib/stats";
import { EXTERNAL_INDICES } from "../data/externalIndices";

const DIMS: { k: SubScoreKey | "score"; label: string }[] = [
  { k: "renew", label: "Clean power" },
  { k: "carbon", label: "Grid carbon" },
  { k: "co2", label: "CO₂/cap" },
  { k: "disclosure", label: "Disclosure" },
  { k: "climate", label: "Climate" },
  { k: "score", label: "Score" },
];

function val(c: (typeof ESG.all)[number], k: SubScoreKey | "score"): number | null {
  return k === "score" ? c.score : c.subscores[k];
}

function corrColor(r: number): string {
  // diverging: strong + → amber (multicollinearity warning), 0 → panel, − → blue
  const a = Math.abs(r);
  if (r >= 0) return `rgba(224,162,60,${(a * 0.55).toFixed(2)})`;
  return `rgba(59,143,212,${(a * 0.55).toFixed(2)})`;
}

export function ValidationOverlay({ onClose }: { onClose: () => void }) {
  const matrix = useMemo(() => DIMS.map((row) => DIMS.map((col) => {
    if (row.k === col.k) return 1;
    const [a, b] = pairwise(ESG.all, (c) => val(c, row.k), (c) => val(c, col.k));
    return spearman(a, b);
  })), []);

  const external = useMemo(() => EXTERNAL_INDICES.map((ix) => {
    const items = ESG.all.filter((c) => ix.scores[c.iso3] != null && c.score != null);
    const [a, b] = pairwise(items, (c) => c.score, (c) => ix.scores[c.iso3]);
    return { ix, n: a.length, rho: spearman(a, b) };
  }), []);

  return (
    <OverlayCard title="Validation & statistical rigor" subtitle="Inter-indicator correlations and convergent validity — computed live from the dataset" icon="rank" onClose={onClose} width={720}>
      <div style={{ overflowY: "auto", flex: 1 }}>
        <div style={{ fontSize: 12.5, color: "var(--text-2)", fontWeight: 600, marginBottom: 8 }}>Sub-indicator correlation (Spearman ρ)</div>
        <div style={{ fontSize: 11.5, color: "var(--text-3)", lineHeight: 1.5, marginBottom: 12 }}>
          High positive correlations indicate overlap / partial double-counting in the composite (e.g. clean-power share and grid carbon are inversely linked by construction). Per OECD/JRC composite-indicator guidance, weights should be read in light of this.
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="mono tnum" style={{ borderCollapse: "collapse", fontSize: 11.5 }}>
            <thead>
              <tr>
                <th />
                {DIMS.map((d) => <th key={d.k} style={{ padding: "4px 7px", color: "var(--text-3)", fontWeight: 500, textAlign: "right" }}>{d.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {DIMS.map((row, i) => (
                <tr key={row.k}>
                  <td style={{ padding: "4px 8px", color: "var(--text-3)", whiteSpace: "nowrap" }}>{row.label}</td>
                  {matrix[i].map((r, j) => (
                    <td key={j} style={{ padding: "5px 7px", textAlign: "right", background: r == null ? "transparent" : corrColor(r), color: "var(--text)", border: "1px solid var(--bg)" }}>
                      {r == null ? "—" : (i === j ? "1.00" : r.toFixed(2))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ fontSize: 12.5, color: "var(--text-2)", fontWeight: 600, margin: "22px 0 8px" }}>Convergent validity vs external indices</div>
        {external.map(({ ix, n, rho }) => (
          <div key={ix.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 13px", border: "1px solid var(--border)", borderRadius: 9, background: "var(--panel-2)", marginBottom: 8 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, color: "var(--text)" }}>{ix.label} {ix.year}</div>
              <div style={{ fontSize: 11, color: "var(--text-3)" }}>{ix.source} · indicative subset, n = {n}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="mono tnum" style={{ fontSize: 18, fontWeight: 600, color: rho != null && rho > 0.5 ? "var(--accent)" : "var(--text-2)" }}>{rho == null ? "—" : "ρ " + rho.toFixed(2)}</div>
              <div style={{ fontSize: 10.5, color: "var(--text-3)" }}>vs ESGMap score</div>
            </div>
          </div>
        ))}
        <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.5, marginTop: 4 }}>
          A positive rank correlation indicates the ESGMap composite broadly agrees with the established index over the overlapping countries; it is a sanity check, not a claim of equivalence. External scores are a clearly-cited indicative subset, never presented as ESGMap data.
        </div>
      </div>
    </OverlayCard>
  );
}
