/* ESGMap — shared UI primitives. Exported to window for other babel files. */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ---------- tiny inline icon set (stroke, 1.6) ---------- */
function Icon({ name, size = 18, style }) {
  const p = {
    map: "M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6zM9 3v15M15 6v15",
    layers: "M12 3l9 5-9 5-9-5 9-5zM3 14l9 5 9-5",
    compare: "M9 3v18M4 7l5-4 5 4M20 17l-5 4-5-4M15 3v18",
    rank: "M4 19h4V9H4v10zM10 19h4V5h-4v14zM16 19h4v-7h-4v7z",
    info: "M12 8h.01M11 12h1v4h1M12 3a9 9 0 100 18 9 9 0 000-18z",
    search: "M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-4.3-4.3",
    close: "M6 6l12 12M18 6L6 18",
    plus: "M12 5v14M5 12h14",
    minus: "M5 12h14",
    target: "M12 3v3M12 18v3M3 12h3M18 12h3M12 7a5 5 0 100 10 5 5 0 000-10z",
    leaf: "M5 21c0-7 4-13 14-15-1 9-5 14-14 15zM5 21c2-5 5-8 9-10",
    bolt: "M13 2L4 14h7l-1 8 9-12h-7l1-8z",
    cloud: "M7 18a4 4 0 010-8 5 5 0 019.6-1.3A3.5 3.5 0 0117 18H7z",
    check: "M5 12l4 4L19 6",
    dash: "M5 12h14",
    pin: "M12 21s-6-5.5-6-10a6 6 0 1112 0c0 4.5-6 10-6 10zM12 9a2 2 0 100 4 2 2 0 000-4z",
    arrowUp: "M12 19V5M6 11l6-6 6 6",
    arrowDown: "M12 5v14M6 13l6 6 6-6",
    globe: "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.5 2.5 4 6 4 9s-1.5 6.5-4 9c-2.5-2.5-4-6-4-9s1.5-6.5 4-9z",
    doc: "M14 3H6v18h12V7l-4-4zM14 3v4h4",
  }[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      style={style} aria-hidden="true">
      {p.split("M").filter(Boolean).map((seg, i) => <path key={i} d={"M" + seg} />)}
    </svg>
  );
}

/* ---------- status pill ---------- */
const STATUS_STYLE = {
  ratified: { c: "#5fbf7f", label: "Ratified" },
  mandatory:{ c: "#5fbf7f", label: "Mandatory" },
  adopting: { c: "#7fb86a", label: "Adopting" },
  roadmap:  { c: "#e0c542", label: "Roadmap" },
  consulting:{ c: "#e0a23c", label: "Consulting" },
  signed:   { c: "#e0a23c", label: "Signed" },
  withdrawn:{ c: "#d4503e", label: "Withdrawn" },
  none:     { c: "#8a948c", label: "None" },
};
function StatusDot({ status, size = 8 }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.none;
  return <span style={{ width: size, height: size, borderRadius: 99, background: s.c, display: "inline-block", flex: "0 0 auto", boxShadow: `0 0 0 3px ${s.c}22` }} />;
}

/* ---------- score ring (svg) ---------- */
function ScoreRing({ value, size = 76, stroke = 7, color }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value || 0));
  const off = c * (1 - v / 100);
  return (
    <div style={{ position: "relative", width: size, height: size, flex: "0 0 auto" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2a322c" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset .6s cubic-bezier(.22,.61,.36,1), stroke .4s" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <div style={{ fontFamily: "var(--mono)", fontWeight: 600, fontSize: size * 0.3, lineHeight: 1 }} className="tnum">{Math.round(v)}</div>
      </div>
    </div>
  );
}

/* ---------- horizontal mix bar ---------- */
const MIX_COLORS = {
  hydro:   "#3b8fd4",
  wind:    "#5fbf7f",
  solar:   "#e0c542",
  nuclear: "#a07fd4",
  fossil:  "#6b5142",
  other:   "#7f8a82",
};
const MIX_LABELS = { hydro: "Hydro", wind: "Wind", solar: "Solar", nuclear: "Nuclear", fossil: "Fossil", other: "Other" };

function MixBar({ mix }) {
  const order = ["hydro", "wind", "solar", "nuclear", "fossil", "other"];
  const total = order.reduce((s, k) => s + (mix[k] || 0), 0) || 1;
  return (
    <div>
      <div style={{ display: "flex", height: 14, borderRadius: 4, overflow: "hidden", background: "#0c100e", border: "1px solid var(--border)" }}>
        {order.map(k => {
          const w = (mix[k] || 0) / total * 100;
          if (w <= 0) return null;
          return <div key={k} title={`${MIX_LABELS[k]} ${Math.round(mix[k])}%`} style={{ width: w + "%", background: MIX_COLORS[k] }} />;
        })}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 14px", marginTop: 10 }}>
        {order.filter(k => (mix[k] || 0) >= 0.5).sort((a, b) => mix[b] - mix[a]).map(k => (
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

/* ---------- line chart (history) ---------- */
function LineChart({ series, width = 320, height = 120, yMax, yMin = 0, unit, colorMode = "renewable" }) {
  // series: [{ years:[], values:[], color, label }]
  const pad = { t: 10, r: 8, b: 20, l: 34 };
  const w = width, h = height;
  const innerW = w - pad.l - pad.r, innerH = h - pad.t - pad.b;
  const allVals = series.flatMap(s => s.values);
  const max = yMax != null ? yMax : Math.max(10, Math.ceil(Math.max(...allVals) / 10) * 10);
  const min = yMin;
  const years = series[0].years;
  const x = (i) => pad.l + (i / (years.length - 1)) * innerW;
  const y = (v) => pad.t + innerH - ((v - min) / (max - min)) * innerH;
  const gridY = [0, 0.25, 0.5, 0.75, 1].map(f => min + (max - min) * f);
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      {gridY.map((gv, i) => (
        <g key={i}>
          <line x1={pad.l} x2={w - pad.r} y1={y(gv)} y2={y(gv)} stroke="#222a25" strokeWidth="1" />
          <text x={pad.l - 6} y={y(gv) + 3} textAnchor="end" fontSize="9" fill="#717b73" fontFamily="var(--mono)">{Math.round(gv)}</text>
        </g>
      ))}
      {[0, years.length - 1].map((i, k) => (
        <text key={k} x={x(i)} y={h - 6} textAnchor={k === 0 ? "start" : "end"} fontSize="9" fill="#717b73" fontFamily="var(--mono)">{years[i]}</text>
      ))}
      {series.map((s, si) => {
        const d = s.values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
        const area = d + ` L${x(years.length - 1).toFixed(1)},${y(min)} L${x(0).toFixed(1)},${y(min)} Z`;
        return (
          <g key={si}>
            {series.length === 1 && <path d={area} fill={s.color} opacity="0.10" />}
            <path d={d} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={x(years.length - 1)} cy={y(s.values[s.values.length - 1])} r="3" fill={s.color} stroke="#131815" strokeWidth="1.5" />
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- generic segmented control ---------- */
function Segmented({ options, value, onChange, size = "md" }) {
  return (
    <div style={{ display: "inline-flex", background: "#0c100e", border: "1px solid var(--border)", borderRadius: 8, padding: 3, gap: 2 }}>
      {options.map(o => {
        const active = o.value === value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)}
            style={{
              border: "none", borderRadius: 6, padding: size === "sm" ? "5px 10px" : "7px 13px",
              fontSize: size === "sm" ? 12 : 13, fontWeight: active ? 600 : 500,
              background: active ? "var(--elev)" : "transparent",
              color: active ? "var(--text)" : "var(--text-3)",
              boxShadow: active ? "inset 0 0 0 1px var(--border-2)" : "none",
              display: "flex", alignItems: "center", gap: 6, transition: "color .15s, background .15s",
            }}>
            {o.icon && <Icon name={o.icon} size={14} />}{o.label}
          </button>
        );
      })}
    </div>
  );
}

function regionFlagTone(region) {
  return { Europe: "#3b8fd4", Asia: "#d4823c", Africa: "#e0c542", Americas: "#5fbf7f", "Middle East": "#a07fd4", Oceania: "#3bc4c4", Eurasia: "#c4683b" }[region] || "#7f8a82";
}

Object.assign(window, {
  Icon, StatusDot, STATUS_STYLE, ScoreRing, MixBar, MIX_COLORS, MIX_LABELS,
  LineChart, Segmented, regionFlagTone,
  useState, useEffect, useRef, useMemo, useCallback,
});
