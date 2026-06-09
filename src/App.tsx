/* ESGMap — root state & composition. */
import { useCallback, useEffect, useMemo, useState } from "react";
import * as ESG from "./data/esg";
import type { CountryRecord, MetricKey } from "./types";
import { LAYERS } from "./layers";
import { Icon } from "./ui/Icon";
import { WorldMap } from "./components/WorldMap";
import { Sidebar } from "./components/Sidebar";
import { SearchBox } from "./components/SearchBox";
import { Legend } from "./components/Legend";
import { TimeSlider } from "./components/TimeSlider";
import { CompareBar } from "./components/CompareBar";
import { CountryPanel } from "./components/CountryPanel";
import { RankingsOverlay } from "./overlays/Rankings";
import { RegionTrendsOverlay } from "./overlays/RegionalTrends";
import { CompareOverlay } from "./overlays/Compare";
import { AboutOverlay } from "./overlays/Methodology";

export type ViewId = "rankings" | "trends" | "compare" | "about";

export default function App() {
  const [metric, setMetric] = useState<MetricKey>("renewable");
  const [year, setYear] = useState<number>(ESG.YEAR_MAX);
  const [selRec, setSelRec] = useState<CountryRecord | null>(null);
  const [pins, setPins] = useState<string[]>([]); // match names
  const [flyTo, setFlyTo] = useState<{ name: string; token: number } | null>(null);
  const [view, setView] = useState<ViewId | null>(null);
  const scales = useMemo(() => ESG.buildScales(), []);

  const selectRec = useCallback((rec: CountryRecord | null) => {
    if (!rec) { setSelRec(null); return; }
    setSelRec(rec);
    setFlyTo({ name: rec.match, token: Date.now() });
    setView(null);
  }, []);

  const onMapSelect = useCallback((rec: CountryRecord | null) => { setSelRec(rec || null); }, []);

  const togglePin = useCallback((rec: CountryRecord) => {
    setPins((prev) =>
      prev.indexOf(rec.match) >= 0
        ? prev.filter((m) => m !== rec.match)
        : prev.length >= 2
          ? [prev[1], rec.match]
          : [...prev, rec.match],
    );
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (view) setView(null);
      else if (selRec) setSelRec(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, selRec]);

  const pinnedRecs = pins.map((m) => ESG.byName[m]).filter(Boolean);
  const panelOpen = !!selRec;
  const activeLayer = LAYERS.find((l) => l.value === metric)!;

  return (
    <div style={{ display: "flex", height: "100vh", minWidth: 0 }}>
      <Sidebar view={view} setView={setView} metric={metric} setMetric={setMetric} />
      <main style={{ position: "relative", flex: 1, minWidth: 0 }}>
        <WorldMap metric={metric} year={year} selected={selRec ? selRec.match : null} pinned={pins}
          onSelect={onMapSelect} flyTo={flyTo} />

        {/* top-left search */}
        <div style={{ position: "absolute", top: 18, left: 18, zIndex: 12 }}>
          <SearchBox onPick={selectRec} metric={metric} year={year} scales={scales} />
        </div>

        {/* active-layer chip top-center */}
        <div style={{ position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)", zIndex: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, background: "rgba(19,24,21,.86)", border: "1px solid var(--border)", borderRadius: 99, padding: "7px 15px", fontSize: 12.5, boxShadow: "var(--shadow)", backdropFilter: "blur(6px)" }}>
            <Icon name={activeLayer.icon} size={14} style={{ color: "var(--accent)" }} />
            <span style={{ fontWeight: 600 }}>{ESG.METRICS[metric].label}</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono" style={{ color: "var(--text-3)" }}>{ESG.METRICS[metric].hasHistory ? year : ESG.YEAR_MAX}</span>
          </div>
        </div>

        {/* bottom-left: compare bar + time slider */}
        <div style={{ position: "absolute", left: 18, bottom: 18, zIndex: 12, display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
          <CompareBar pinned={pinnedRecs} onOpen={() => setView("compare")} onClear={() => setPins([])} />
          <TimeSlider year={year} setYear={setYear} metric={metric} />
        </div>

        {/* bottom-right legend (shifts when panel open) */}
        <div style={{ position: "absolute", right: panelOpen ? 410 : 18, bottom: 18, zIndex: 12, transition: "right .32s cubic-bezier(.22,.61,.36,1)" }}>
          <Legend metric={metric} scales={scales} />
        </div>

        {/* country panel */}
        {selRec && (
          <CountryPanel rec={selRec} metric={metric} scales={scales} onClose={() => setSelRec(null)}
            onPin={togglePin} isPinned={pins.indexOf(selRec.match) >= 0} />
        )}

        {/* overlays */}
        {view === "rankings" && <RankingsOverlay metric={metric} scales={scales} onPick={selectRec} onClose={() => setView(null)} />}
        {view === "trends" && <RegionTrendsOverlay onClose={() => setView(null)} />}
        {view === "compare" && <CompareOverlay pinned={pinnedRecs} scales={scales} onClose={() => setView(null)} onRemove={(c) => setPins((prev) => prev.filter((m) => m !== c.match))} />}
        {view === "about" && <AboutOverlay onClose={() => setView(null)} />}
      </main>
    </div>
  );
}
