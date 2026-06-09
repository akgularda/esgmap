/* ESGMap — Score Lab: adjust the composite weights and watch the ranking move.
 * The canonical answer to "is your ranking an artifact of the weights?". Never
 * overwrites the published score — clearly badged as custom. */
import { useMemo, useState } from "react";
import * as ESG from "../data/esg";
import type { CountryRecord, SubScoreKey } from "../types";
import { OverlayCard } from "./OverlayCard";
import { Icon } from "../ui/Icon";
import { regionFlagTone } from "../ui/tokens";

const KEYS: { k: SubScoreKey; label: string }[] = [
  { k: "renew", label: "Clean power" },
  { k: "carbon", label: "Grid carbon" },
  { k: "co2", label: "CO₂ / capita" },
  { k: "disclosure", label: "Disclosure" },
  { k: "climate", label: "Climate risk" },
];

// Standard competition ("1224") ranking: items with equal value share the lower rank.
function tieRanks(items: { iso: string; v: number }[]): Record<string, number> {
  const sorted = items.slice().sort((a, b) => b.v - a.v);
  const rank: Record<string, number> = {};
  let prevV: number | null = null, prevR = 0;
  sorted.forEach((x, i) => { const r = prevV != null && x.v === prevV ? prevR : i + 1; rank[x.iso] = r; prevV = x.v; prevR = r; });
  return rank;
}

const PUBLISHED = ESG.META.scoreWeights as Record<SubScoreKey, number>;
const PRESETS: Record<string, Record<SubScoreKey, number>> = {
  Published: PUBLISHED,
  "Equal weights": { renew: 0.2, carbon: 0.2, co2: 0.2, disclosure: 0.2, climate: 0.2 },
  "Drop disclosure": { renew: 0.34, carbon: 0.28, co2: 0.23, disclosure: 0, climate: 0.15 },
};

export function ScoreLabOverlay({ scales, onPick, onClose }: {
  scales: ESG.Scales;
  onPick: (c: CountryRecord) => void;
  onClose: () => void;
}) {
  const [w, setW] = useState<Record<SubScoreKey, number>>({ ...PUBLISHED });

  // Standard competition ranking (ties share a rank) so the Published preset shows
  // zero spurious movement and tied scores don't swap arbitrarily.
  const published = useMemo(() => tieRanks(ESG.all.filter((c) => c.score != null).map((c) => ({ iso: c.iso3, v: c.score! }))), []);

  const ranked = useMemo(() => {
    return ESG.all
      .map((c) => ({ c, s: ESG.scoreWith(c.subscores, w) }))
      .filter((x) => x.s != null)
      .sort((a, b) => b.s! - a.s!);
  }, [w]);
  const curRank = useMemo(() => tieRanks(ranked.map((x) => ({ iso: x.c.iso3, v: x.s! }))), [ranked]);

  const setKey = (k: SubScoreKey, val: number) => setW((prev) => ({ ...prev, [k]: val }));
  const sum = KEYS.reduce((s, { k }) => s + w[k], 0) || 1;
  const isPublished = KEYS.every(({ k }) => Math.abs(w[k] - PUBLISHED[k]) < 1e-9);

  return (
    <OverlayCard title="Score Lab" subtitle="Re-weight the composite and watch the ranking shift — your weights, not the published score" icon="rank" onClose={onClose} width={820}>
      <div style={{ display: "flex", gap: 18, minHeight: 0, flex: 1 }}>
        {/* weights */}
        <div style={{ width: 300, flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {!isPublished && (
            <div style={{ fontSize: 11, color: "var(--warn)", border: "1px solid rgba(224,162,60,.3)", background: "rgba(224,162,60,.08)", borderRadius: 8, padding: "7px 10px" }}>
              ⚠ Custom weights — this is <b>not</b> the published ESGMap score.
            </div>
          )}
          {KEYS.map(({ k, label }) => (
            <div key={k}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "var(--text-2)" }}>{label}</span>
                <span className="mono tnum" style={{ color: "var(--text)" }}>{Math.round((w[k] / sum) * 100)}%</span>
              </div>
              <input type="range" min={0} max={1} step={0.01} value={w[k]} className="esg-range" style={{ width: "100%" }}
                aria-label={`${label} weight`} onChange={(e) => setKey(k, +e.target.value)} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
            {Object.entries(PRESETS).map(([name, preset]) => (
              <button key={name} onClick={() => setW({ ...preset })}
                style={{ fontSize: 11.5, padding: "5px 10px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--panel-2)", color: "var(--text-2)" }}>{name}</button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.5 }}>
            Weights renormalise over whichever sub-scores a country has, so base-tier countries (no disclosure data) are scored on the remaining components.
          </div>
        </div>

        {/* live ranking */}
        <div style={{ flex: 1, minWidth: 0, overflowY: "auto", borderLeft: "1px solid var(--border)", paddingLeft: 16 }}>
          {ranked.map(({ c, s }, i) => {
            const newRank = i + 1;
            const oldRank = published[c.iso3];
            // movement compares tie-aware ranks so equal scores never spuriously swap
            const shift = oldRank ? oldRank - curRank[c.iso3] : 0;
            return (
              <button key={c.iso3} onClick={() => onPick(c)} style={{
                display: "grid", gridTemplateColumns: "26px 1fr 58px 48px", alignItems: "center", gap: 10, width: "100%",
                padding: "7px 8px", border: "none", borderBottom: "1px solid var(--border)", background: "transparent", textAlign: "left",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--panel-2)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <span className="mono tnum" style={{ fontSize: 12.5, color: i < 3 ? "var(--accent)" : "var(--text-3)", fontWeight: 600 }}>{newRank}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: regionFlagTone(c.region), flex: "0 0 auto" }} />
                  <span style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
                </span>
                <span className="mono tnum" style={{ fontSize: 13, fontWeight: 600, textAlign: "right", color: s != null ? scales.score(s) : "var(--text)" }}>{s}</span>
                <span className="mono tnum" style={{ fontSize: 11, textAlign: "right", color: shift > 0 ? "var(--accent)" : shift < 0 ? "var(--bad)" : "var(--text-3)" }}>
                  {shift === 0 ? "–" : (shift > 0 ? "▲" : "▼") + Math.abs(shift)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 11, color: "var(--text-3)" }}>
        <Icon name="info" size={13} /> Rank arrows show movement vs. the published weights ({KEYS.map(({ k }) => Math.round(PUBLISHED[k] * 100) + "%").join(" / ")}).
      </div>
    </OverlayCard>
  );
}
