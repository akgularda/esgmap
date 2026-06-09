/* ESGMap — application shell & state. */
const ESG = window.ESG;

function gradientCss(key, scales) {
  const M = ESG.METRICS[key], sc = scales[key];
  const [d0, d1] = M.domain, stops = [];
  for (let i = 0; i <= 10; i++) { const v = d0 + (d1 - d0) * i / 10; stops.push(`${sc(v)} ${i * 10}%`); }
  return `linear-gradient(90deg, ${stops.join(",")})`;
}

const LAYERS = [
  { value: "renewable", label: "Renewable power", icon: "leaf", desc: "Clean share of electricity" },
  { value: "carbon", label: "Carbon intensity", icon: "cloud", desc: "Grid CO₂ per kWh" },
  { value: "co2pc", label: "CO₂ per capita", icon: "bolt", desc: "Annual emissions / person" },
  { value: "pm25", label: "Air quality", icon: "cloud", desc: "PM2.5 pollution" },
  { value: "forest", label: "Forest cover", icon: "leaf", desc: "% of land forested" },
  { value: "climate", label: "Climate risk", icon: "target", desc: "Exposure & readiness" },
  { value: "score", label: "Sustainability score", icon: "globe", desc: "Composite index" },
];

/* ---------------- Sidebar ---------------- */
function Sidebar({ view, setView, metric, setMetric, year }) {
  const nav = [
    { id: "map", label: "Map", icon: "map" },
    { id: "rankings", label: "Rankings", icon: "rank" },
    { id: "trends", label: "Regional trends", icon: "arrowUp" },
    { id: "compare", label: "Compare", icon: "compare" },
    { id: "about", label: "Methodology", icon: "info" },
  ];
  return (
    <aside style={{ width: "var(--sidebar-w)", flex: "0 0 auto", background: "var(--panel)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: "20px 16px 16px", overflowY: "auto", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "2px 6px 20px" }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(150deg,#2f9e57,#1f6b3c)", display: "grid", placeItems: "center", boxShadow: "0 4px 14px -4px rgba(47,158,87,.6)" }}>
          <Icon name="leaf" size={19} style={{ color: "#eafff0" }} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-.01em" }}>ESGMap</div>
          <div style={{ fontSize: 10.5, color: "var(--text-3)", letterSpacing: ".02em" }}>Global Sustainability Atlas</div>
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {nav.map(n => {
          const active = view === n.id || (n.id === "map" && view === null);
          return (
            <button key={n.id} onClick={() => setView(n.id === "map" ? null : n.id)}
              style={{
                display: "flex", alignItems: "center", gap: 11, padding: "9px 11px", borderRadius: 8, border: "none",
                background: active ? "var(--elev)" : "transparent", color: active ? "var(--text)" : "var(--text-2)",
                fontSize: 13.5, fontWeight: active ? 600 : 500, textAlign: "left", transition: "background .15s, color .15s",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--panel-2)"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
              <Icon name={n.icon} size={17} style={{ color: active ? "var(--accent)" : "var(--text-3)" }} />
              {n.label}
            </button>
          );
        })}
      </nav>

      <div style={{ height: 1, background: "var(--border)", margin: "18px 6px" }} />

      <div style={{ padding: "0 6px" }}>
        <div style={{ fontSize: 10.5, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".09em", marginBottom: 10 }}>Map layer</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {LAYERS.map(l => {
            const active = metric === l.value;
            return (
              <button key={l.value} onClick={() => { setMetric(l.value); }}
                style={{
                  display: "flex", alignItems: "center", gap: 11, padding: "10px 11px", borderRadius: 9,
                  border: "1px solid " + (active ? "var(--border-2)" : "transparent"),
                  background: active ? "var(--panel-2)" : "transparent", textAlign: "left", transition: "background .15s",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--panel-2)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                <span style={{ width: 30, height: 30, borderRadius: 7, display: "grid", placeItems: "center", flex: "0 0 auto", background: active ? "rgba(95,191,127,.13)" : "var(--elev)", color: active ? "var(--accent)" : "var(--text-3)" }}>
                  <Icon name={l.icon} size={16} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: active ? 600 : 500, color: active ? "var(--text)" : "var(--text-2)" }}>{l.label}</div>
                  <div style={{ fontSize: 10.5, color: "var(--text-3)" }}>{l.desc}</div>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1 }} />
      <div style={{ padding: "0 6px", fontSize: 10.5, color: "var(--text-3)", lineHeight: 1.55 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--warn)" }} />
          Representative data · prototype
        </div>
        Edition {year} · {ESG.all.length} territories
      </div>
    </aside>
  );
}

/* ---------------- Search ---------------- */
function SearchBox({ onPick, metric, year, scales }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const results = useMemo(() => {
    if (!q.trim()) return [];
    const s = q.trim().toLowerCase();
    return ESG.all.filter(c => c.name.toLowerCase().includes(s) || c.region.toLowerCase().includes(s))
      .sort((a, b) => a.name.localeCompare(b.name)).slice(0, 8);
  }, [q]);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  const M = ESG.METRICS[metric];
  return (
    <div ref={ref} style={{ position: "relative", width: 340 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, height: 44, padding: "0 14px", background: "rgba(19,24,21,.92)", border: "1px solid var(--border-2)", borderRadius: 11, boxShadow: "var(--shadow)", backdropFilter: "blur(6px)" }}>
        <Icon name="search" size={17} style={{ color: "var(--text-3)" }} />
        <input value={q} onChange={e => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
          placeholder="Search 90+ countries & regions" spellCheck="false"
          style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: "var(--text)", fontSize: 14 }} />
        {q && <button onClick={() => { setQ(""); setOpen(false); }} style={{ border: "none", background: "transparent", color: "var(--text-3)", display: "grid", placeItems: "center" }}><Icon name="close" size={15} /></button>}
      </div>
      {open && results.length > 0 && (
        <div className="fadein" style={{ position: "absolute", top: 50, left: 0, right: 0, background: "var(--panel)", border: "1px solid var(--border-2)", borderRadius: 11, boxShadow: "var(--shadow)", overflow: "hidden", zIndex: 30 }}>
          {results.map(c => {
            const v = ESG.valueAt(c, metric, year);
            return (
              <button key={c.match} onClick={() => { onPick(c); setQ(""); setOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "10px 14px", border: "none", borderBottom: "1px solid var(--border)", background: "transparent", textAlign: "left" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--panel-2)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: window.regionFlagTone(c.region), flex: "0 0 auto" }} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)" }}>{c.region}{c.tier === "rich" ? "" : " · limited"}</div>
                </span>
                <span className="mono tnum" style={{ fontSize: 13, color: scales[metric](v), fontWeight: 600 }}>{M.fmt(v)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------- Legend ---------------- */
function Legend({ metric, scales }) {
  const M = ESG.METRICS[metric];
  return (
    <div style={{ background: "rgba(19,24,21,.92)", border: "1px solid var(--border)", borderRadius: 11, padding: "12px 15px 11px", width: 300, boxShadow: "var(--shadow)", backdropFilter: "blur(6px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600 }}>{M.label}</span>
        <span className="mono" style={{ fontSize: 10.5, color: "var(--text-3)" }}>{M.unit}</span>
      </div>
      <div style={{ height: 11, borderRadius: 4, background: gradientCss(metric, scales), border: "1px solid var(--border)" }} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        {M.ticks.map(t => <span key={t} className="mono tnum" style={{ fontSize: 10, color: "var(--text-3)" }}>{t}</span>)}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 10.5, color: "var(--text-3)" }}>
        <span style={{ width: 11, height: 11, borderRadius: 3, background: ESG.NO_DATA, border: "1px solid var(--border-2)" }} />
        No data in this edition
      </div>
    </div>
  );
}

/* ---------------- Time slider ---------------- */
function TimeSlider({ year, setYear, metric }) {
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
        onChange={e => setYear(+e.target.value)} className="esg-range" style={{ width: "100%" }} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
        <span className="mono" style={{ fontSize: 10, color: "var(--text-3)" }}>{ESG.YEAR_MIN}</span>
        <span style={{ fontSize: 10, color: "var(--text-3)" }}>{disabled ? "energy layers only" : "drag to replay trend"}</span>
        <span className="mono" style={{ fontSize: 10, color: "var(--text-3)" }}>{ESG.YEAR_MAX}</span>
      </div>
    </div>
  );
}

/* ---------------- Compare bar ---------------- */
function CompareBar({ pinned, onOpen, onClear }) {
  if (!pinned.length) return null;
  return (
    <div className="fadein" style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(19,24,21,.95)", border: "1px solid var(--border-2)", borderRadius: 11, padding: "9px 9px 9px 15px", boxShadow: "var(--shadow)", backdropFilter: "blur(6px)" }}>
      <Icon name="compare" size={16} style={{ color: "var(--accent)" }} />
      <div style={{ display: "flex", gap: 7 }}>
        {pinned.map(c => (
          <span key={c.match} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: 7, padding: "4px 9px" }}>
            <span style={{ width: 7, height: 7, borderRadius: 2, background: window.regionFlagTone(c.region) }} />{c.name}
          </span>
        ))}
      </div>
      <button onClick={onOpen} disabled={pinned.length < 2} style={{ height: 32, padding: "0 14px", borderRadius: 8, border: "none", background: pinned.length < 2 ? "var(--elev)" : "var(--accent)", color: pinned.length < 2 ? "var(--text-3)" : "#08120c", fontSize: 12.5, fontWeight: 600 }}>Compare</button>
      <button onClick={onClear} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-3)", display: "grid", placeItems: "center" }}><Icon name="close" size={14} /></button>
    </div>
  );
}

window.gradientCss = gradientCss;
window.LAYERS = LAYERS;
Object.assign(window, { Sidebar, SearchBox, Legend, TimeSlider, CompareBar });
