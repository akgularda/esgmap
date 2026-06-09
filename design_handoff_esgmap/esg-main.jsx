/* ESGMap — App composition, overlays, mount. */

/* ============ Rankings overlay ============ */
function RankingsOverlay({ metric, scales, onPick, onClose }) {
  const [sortMetric, setSortMetric] = useState(metric);
  const [region, setRegion] = useState("All");
  const regions = ["All", "Europe", "Asia", "Americas", "Africa", "Middle East", "Oceania", "Eurasia"];
  const M = ESG.METRICS[sortMetric];
  const list = useMemo(() => {
    let arr = ESG.all.filter(c => region === "All" || c.region === region);
    arr = arr.slice().sort((a, b) => {
      const va = ESG.valueAt(a, sortMetric, ESG.YEAR_MAX), vb = ESG.valueAt(b, sortMetric, ESG.YEAR_MAX);
      return M.better === "high" ? vb - va : va - vb;
    });
    return arr;
  }, [sortMetric, region]);
  const maxV = Math.max(...list.map(c => ESG.valueAt(c, sortMetric, ESG.YEAR_MAX)));

  return (
    <OverlayCard title="Rankings" subtitle={`${list.length} territories · sorted by ${M.short.toLowerCase()}`} icon="rank" onClose={onClose} width={760}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start", padding: "0 0 14px" }}>
        <div>
          <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Metric</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {LAYERS.map(l => (
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
            {regions.map(r => (
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
          const v = ESG.valueAt(c, sortMetric, ESG.YEAR_MAX);
          const w = Math.max(2, (M.better === "high" ? v / maxV : 1 - (v / (M.domain[1]))) * 100);
          return (
            <button key={c.match} onClick={() => onPick(c)} style={{
              display: "grid", gridTemplateColumns: "30px 1fr 120px 64px", alignItems: "center", gap: 12, width: "100%",
              padding: "9px 12px", border: "none", borderBottom: "1px solid var(--border)", background: "transparent", textAlign: "left",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--panel-2)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <span className="mono tnum" style={{ fontSize: 13, color: i < 3 ? "var(--accent)" : "var(--text-3)", fontWeight: 600 }}>{i + 1}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: window.regionFlagTone(c.region), flex: "0 0 auto" }} />
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

/* ============ Compare overlay ============ */
function CompareOverlay({ pinned, scales, onClose, onRemove }) {
  const [cm, setCm] = useState("renewable");
  const a = pinned[0], b = pinned[1];
  if (!a || !b) return (
    <OverlayCard title="Compare" icon="compare" onClose={onClose} width={520}>
      <div style={{ padding: "30px 0", textAlign: "center", color: "var(--text-3)" }}>Pin two countries from the map or rankings to compare them.</div>
    </OverlayCard>
  );
  const rows = [
    { k: "renewable", label: "Renewable power", unit: "%", better: "high", fmt: v => Math.round(v) + "%" },
    { k: "carbon", label: "Grid carbon", unit: "gCO₂/kWh", better: "low", fmt: v => Math.round(v) },
    { k: "co2pc", label: "CO₂ / capita", unit: "t", better: "low", fmt: v => v != null ? v : "—" },
    { k: "pm25", label: "Air quality (PM2.5)", unit: "µg/m³", better: "low", fmt: v => v != null ? Math.round(v) : "—" },
    { k: "forest", label: "Forest cover", unit: "%", better: "high", fmt: v => v != null ? Math.round(v) + "%" : "—" },
    { k: "score", label: "Sustainability score", unit: "/100", better: "high", fmt: v => Math.round(v) },
  ];
  const M = ESG.METRICS[cm];
  const hColor = { a: "#5fbf7f", b: "#3b8fd4" };

  const Col = ({ c, tone }) => (
    <div style={{ flex: 1, textAlign: "center", position: "relative" }}>
      <button onClick={() => onRemove(c)} style={{ position: "absolute", top: -4, right: 0, width: 24, height: 24, borderRadius: 6, border: "1px solid var(--border)", background: "var(--panel-2)", color: "var(--text-3)", display: "grid", placeItems: "center" }}><Icon name="close" size={12} /></button>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <span style={{ width: 10, height: 10, borderRadius: 3, background: tone }} />
        <div style={{ fontSize: 16, fontWeight: 600 }}>{c.name}</div>
        <ScoreRing value={c.score} color={scales.score(c.score)} size={64} />
      </div>
    </div>
  );

  return (
    <OverlayCard title="Compare countries" icon="compare" onClose={onClose} width={620}>
      <div style={{ display: "flex", gap: 16, padding: "4px 0 18px" }}>
        <Col c={a} tone={hColor.a} /><div style={{ width: 1, background: "var(--border)" }} /><Col c={b} tone={hColor.b} />
      </div>
      <div style={{ borderTop: "1px solid var(--border)" }}>
        {rows.map(r => {
          const va = a[r.k], vb = b[r.k];
          const aBetter = va != null && vb != null && (r.better === "high" ? va > vb : va < vb);
          const bBetter = va != null && vb != null && (r.better === "high" ? vb > va : vb < va);
          return (
            <div key={r.k} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", padding: "11px 0", borderBottom: "1px solid var(--border)" }}>
              <span className="mono tnum" style={{ fontSize: 16, fontWeight: 600, textAlign: "right", color: aBetter ? "var(--accent)" : "var(--text-2)" }}>{r.fmt(va)}</span>
              <span style={{ fontSize: 11.5, color: "var(--text-3)", padding: "0 18px", textAlign: "center", whiteSpace: "nowrap" }}>{r.label}</span>
              <span className="mono tnum" style={{ fontSize: 16, fontWeight: 600, textAlign: "left", color: bBetter ? "var(--accent)" : "var(--text-2)" }}>{r.fmt(vb)}</span>
            </div>
          );
        })}
        {/* disclosure quick row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", padding: "11px 0", borderBottom: "1px solid var(--border)" }}>
          <span style={{ textAlign: "right", fontSize: 12.5, color: "var(--text-2)" }}>{a.netZero || "—"}</span>
          <span style={{ fontSize: 11.5, color: "var(--text-3)", padding: "0 18px" }}>Net-zero year</span>
          <span style={{ textAlign: "left", fontSize: 12.5, color: "var(--text-2)" }}>{b.netZero || "—"}</span>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <SectionLabel icon="rank" text="Historical trend" noMargin />
          <Segmented size="sm" value={cm} onChange={setCm} options={[{ value: "renewable", label: "Renewables" }, { value: "carbon", label: "Carbon" }]} />
        </div>
        {a.history && b.history && (
          <LineChart width={560} height={150}
            series={[{ years: a.history.years, values: a.history[cm], color: hColor.a, label: a.name }, { years: b.history.years, values: b.history[cm], color: hColor.b, label: b.name }]}
            yMax={cm === "renewable" ? 100 : Math.max(200, Math.ceil(Math.max(...a.history.carbon, ...b.history.carbon) / 100) * 100)} unit={M.unit} />
        )}
        <div style={{ display: "flex", gap: 18, marginTop: 8, fontSize: 12 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 3, background: hColor.a, borderRadius: 2 }} />{a.name}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 3, background: hColor.b, borderRadius: 2 }} />{b.name}</span>
        </div>
      </div>
    </OverlayCard>
  );
}

/* ============ Regional Trends overlay ============ */
function RegionTrendsOverlay({ onClose }) {
  const [tm, setTm] = useState("renewable");
  const [hidden, setHidden] = useState({});
  const series = useMemo(() => ESG.regionalTrend(tm), [tm]);
  const M = ESG.METRICS[tm];
  const visible = series.filter(s => !hidden[s.region]);
  const yMax = tm === "renewable" ? 100 : Math.max(200, Math.ceil(Math.max(...series.flatMap(s => s.values)) / 100) * 100);
  const lc = visible.map(s => ({ years: s.years, values: s.values, color: window.regionFlagTone(s.region), label: s.region }));

  return (
    <OverlayCard title="Regional trends" subtitle={`Average ${M.short.toLowerCase()} by region · 2000–2025 (major economies)`} icon="arrowUp" onClose={onClose} width={780}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 0 16px" }}>
        <Segmented size="sm" value={tm} onChange={setTm}
          options={[{ value: "renewable", label: "Renewables" }, { value: "carbon", label: "Carbon intensity" }]} />
        <span style={{ fontSize: 11.5, color: "var(--text-3)" }}>Click a region to toggle it</span>
      </div>

      {lc.length > 0 ? (
        <LineChart width={720} height={300} series={lc} yMax={yMax} unit={M.unit} />
      ) : (
        <div style={{ height: 300, display: "grid", placeItems: "center", color: "var(--text-3)" }}>Select at least one region</div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginTop: 16 }}>
        {series.map(s => {
          const off = hidden[s.region];
          const last = s.values[s.values.length - 1];
          const first = s.values[0];
          const d = Math.round((last - first) * 10) / 10;
          const good = tm === "renewable" ? d >= 0 : d <= 0;
          return (
            <button key={s.region} onClick={() => setHidden(h => ({ ...h, [s.region]: !h[s.region] }))}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 11px", borderRadius: 8, border: "1px solid var(--border)", background: off ? "transparent" : "var(--panel-2)", opacity: off ? 0.45 : 1 }}>
              <span style={{ width: 12, height: 3, borderRadius: 2, background: window.regionFlagTone(s.region) }} />
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

/* ============ Methodology overlay ============ */
function AboutOverlay({ onClose }) {
  return (
    <OverlayCard title="Methodology & sources" icon="info" onClose={onClose} width={640}>
      <div style={{ overflowY: "auto", flex: 1, fontSize: 13.5, lineHeight: 1.62, color: "var(--text-2)" }}>
        <p style={{ marginTop: 0 }}>
          <b style={{ color: "var(--text)" }}>ESGMap</b> visualises national sustainability indicators on an interactive world map.
          Choose a <b style={{ color: "var(--text)" }}>map layer</b> in the sidebar, then click any country for its full profile, energy mix, disclosure status and historical trend.
        </p>
        <Def t="Renewable electricity" d="Share of national electricity generation from hydro, wind, solar, geothermal and other renewables. Nuclear is shown in the mix but excluded from the renewable share." src="Ember Electricity Data Explorer; IEA; IRENA" />
        <Def t="Grid carbon intensity" d="Lifecycle CO₂-equivalent grams emitted per kWh of electricity consumed. Lower is cleaner." src="Ember; IEA Emissions Factors; electricitymaps.com" />
        <Def t="CO₂ per capita" d="Annual territorial CO₂ emissions divided by population, in tonnes per person." src="Global Carbon Project; Our World in Data; EDGAR (JRC)" />
        <Def t="Air quality (PM2.5)" d="Population-weighted annual mean concentration of fine particulate matter, µg/m³." src="WHO Ambient Air Quality Database; IQAir World AQ Report" />
        <Def t="Forest cover" d="Forest area as a share of total land area." src="FAO FRA / FAOSTAT; World Bank (AG.LND.FRST.ZS)" />
        <Def t="Electricity use per capita" d="Annual electricity consumption per person, kWh." src="IEA; Ember; World Bank" />
        <Def t="EV adoption" d="Battery-electric & plug-in hybrid share of new car sales." src="IEA Global EV Outlook" />
        <Def t="Climate-risk exposure" d="A 0–100 index blending physical climate vulnerability with adaptive readiness — higher means more exposed and less prepared. Lower is better." src="ND-GAIN Country Index; INFORM Risk Index" />
        <Def t="Sustainability score" d="Composite 0–100 index blending clean-power share, grid carbon intensity, per-capita emissions and disclosure readiness." src="ESGMap composite (derived from the variables above)" />
        <Def t="Paris Agreement & NDC" d="Ratification status of the 2015 Paris Agreement and the headline 2030 Nationally Determined Contribution target." src="UNFCCC NDC Registry; Climate Watch (WRI)" />
        <Def t="Net-zero pledge" d="National net-zero / carbon-neutrality target year, where pledged." src="Net Zero Tracker (Oxford / ECIU); Climate Watch" />
        <Def t="IFRS S1 / S2" d="Adoption status of the ISSB's IFRS S1 (general sustainability) and S2 (climate) disclosure standards: mandatory, adopting, roadmap, consulting, or none." src="IFRS Foundation jurisdiction profiles; IOSCO" />

        <div style={{ marginTop: 20, fontSize: 11.5, color: "var(--text-3)", lineHeight: 1.6 }}>
          <b style={{ color: "var(--text-2)" }}>Reference sources (per variable above).</b> These are the authoritative datasets each indicator would be sourced from in a production build. The figures shown in this prototype are <b>not</b> scraped from them — see the notice below.
        </div>

        <div style={{ marginTop: 18, padding: "13px 15px", background: "rgba(224,162,60,.08)", border: "1px solid rgba(224,162,60,.3)", borderRadius: 10, color: "var(--text-2)", fontSize: 12.5 }}>
          <b style={{ color: "var(--warn)" }}>Prototype data notice.</b> The numbers in this build are <b>representative</b> — assembled by the author to be directionally realistic for demonstration, and are <b>not</b> pulled live from the sources listed above. Do not cite them as official statistics. A production version would wire the named feeds directly with dated retrievals.
        </div>
      </div>
    </OverlayCard>
  );
}
function Def({ t, d, src }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ color: "var(--text)", fontWeight: 600, fontSize: 13 }}>{t}</div>
      <div style={{ marginTop: 2 }}>{d}</div>
      {src && (
        <div style={{ marginTop: 4, display: "flex", alignItems: "baseline", gap: 6, fontSize: 11.5 }}>
          <span style={{ color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".06em", flex: "0 0 auto" }}>Source</span>
          <span style={{ color: "var(--accent)" }}>{src}</span>
        </div>
      )}
    </div>
  );
}

/* ============ Overlay shell ============ */
function OverlayCard({ title, subtitle, icon, onClose, width, children }) {
  return (
    <div className="fadein" onMouseDown={onClose} style={{ position: "absolute", inset: 0, zIndex: 50, background: "rgba(6,9,7,.62)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", padding: 30 }}>
      <div onMouseDown={e => e.stopPropagation()} style={{ width: width || 640, maxWidth: "100%", maxHeight: "86vh", background: "var(--panel)", border: "1px solid var(--border-2)", borderRadius: 14, boxShadow: "var(--shadow)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--panel-2)", border: "1px solid var(--border)", display: "grid", placeItems: "center", color: "var(--accent)" }}><Icon name={icon} size={17} /></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: "var(--text-3)" }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)", background: "var(--panel-2)", color: "var(--text-2)", display: "grid", placeItems: "center" }}><Icon name="close" size={16} /></button>
        </div>
        <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

/* ============ App ============ */
function App() {
  const [metric, setMetric] = useState("renewable");
  const [year, setYear] = useState(ESG.YEAR_MAX);
  const [selRec, setSelRec] = useState(null);
  const [pins, setPins] = useState([]); // match names
  const [flyTo, setFlyTo] = useState(null);
  const [view, setView] = useState(null); // null | rankings | compare | about
  const scales = useMemo(() => ESG.buildScales(), []);

  const selectRec = useCallback((rec) => {
    if (!rec) { setSelRec(null); return; }
    setSelRec(rec);
    setFlyTo({ name: rec.match, token: Date.now() });
    setView(null);
  }, []);

  const onMapSelect = useCallback((rec) => { setSelRec(rec || null); }, []);

  const togglePin = useCallback((rec) => {
    setPins(prev => prev.indexOf(rec.match) >= 0 ? prev.filter(m => m !== rec.match)
      : prev.length >= 2 ? [prev[1], rec.match] : [...prev, rec.match]);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (view) setView(null); else if (selRec) setSelRec(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, selRec]);

  const pinnedRecs = pins.map(m => ESG.byName[m]).filter(Boolean);
  const panelOpen = !!selRec;

  return (
    <div style={{ display: "flex", height: "100vh", minWidth: 0 }}>
      <Sidebar view={view} setView={setView} metric={metric} setMetric={setMetric} year={year} />
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
            <Icon name={LAYERS.find(l => l.value === metric).icon} size={14} style={{ color: "var(--accent)" }} />
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
        {view === "compare" && <CompareOverlay pinned={pinnedRecs} scales={scales} onClose={() => setView(null)} onRemove={(c) => setPins(prev => prev.filter(m => m !== c.match))} />}
        {view === "about" && <AboutOverlay onClose={() => setView(null)} />}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
