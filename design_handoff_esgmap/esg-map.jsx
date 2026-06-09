/* ESGMap — interactive D3 world map (imperative inside React). */
const TOPO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";
// Clipped lat band (drop the high-Arctic / Antarctic, which Mercator smears) so the map fills the frame cleanly.
const FIT_BOX = { type: "Polygon", coordinates: [[[-179, 73], [179, 73], [179, -56], [-179, -56], [-179, 73]]] };
function fitMap(proj, w, h) {
  // Fill the full width with the -180..180 lon range (true web-map look), then centre the lat band vertically.
  proj.scale(w / (2 * Math.PI)).translate([w / 2, h / 2]);
  const yT = proj([0, 73])[1], yB = proj([0, -56])[1];
  const bandH = yB - yT;
  const cur = proj.translate();
  proj.translate([cur[0], cur[1] + ((h - bandH) / 2 - yT)]);
}
function applyClip(proj, pathGen, rectNode) {
  proj.clipExtent(null);
  // project the band corners directly (bounds() is unreliable across the antimeridian)
  const topY = proj([0, 73])[1];
  const botY = proj([0, -56])[1];
  const leftX = proj([-179.9, 0])[0];
  const rightX = proj([179.9, 0])[0];
  const x0 = Math.floor(Math.min(leftX, rightX)), x1 = Math.ceil(Math.max(leftX, rightX));
  const y0 = Math.floor(Math.min(topY, botY)), y1 = Math.ceil(Math.max(topY, botY));
  proj.clipExtent([[x0, y0], [x1, y1]]);
  if (rectNode) {
    rectNode.setAttribute("x", x0); rectNode.setAttribute("y", y0);
    rectNode.setAttribute("width", Math.max(0, x1 - x0)); rectNode.setAttribute("height", Math.max(0, y1 - y0));
  }
}

function WorldMap(props) {
  const { metric, year, selected, pinned, onSelect, onHover, flyTo, onReady, dimNoData } = props;
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const zoomRef = useRef(null);
  const projRef = useRef(null);
  const pathGenRef = useRef(null);
  const featuresRef = useRef(null);
  const selByName = useRef({});      // matchName -> path node
  const sizeRef = useRef({ w: 0, h: 0 });
  const roFirstRef = useRef(true);
  const clipRectRef = useRef(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  /* fit projection to current container size & redraw all paths */
  const fit = useCallback(() => {
    const d3 = window.d3;
    const wrap = wrapRef.current, proj = projRef.current, pathGen = pathGenRef.current;
    if (!wrap || !proj || !pathGen) return false;
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (!w || !h) return false;
    sizeRef.current = { w, h };
    fitMap(proj, w, h);
    applyClip(proj, pathGen, clipRectRef.current);
    const g = d3.select(gRef.current);
    g.select("path.graticule").attr("d", pathGen(d3.geoGraticule10()));
    g.selectAll("path.country").attr("d", pathGen);
    return true;
  }, []);

  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [tip, setTip] = useState(null); // {x,y,rec,name}

  const scales = useMemo(() => (window.d3 ? window.ESG.buildScales() : null), [status === "ready"]);

  const colorOf = useCallback((rec) => {
    const p = propsRef.current;
    const ESG = window.ESG;
    if (!rec) return ESG.NO_DATA;
    const v = ESG.valueAt(rec, p.metric, p.year);
    if (v == null) return ESG.NO_DATA;
    return (scales || ESG.buildScales())[p.metric](v);
  }, [scales]);

  /* ----- paint fills ----- */
  const paint = useCallback(() => {
    const sel = selByName.current;
    const ESG = window.ESG;
    Object.keys(sel).forEach(name => {
      const node = sel[name];
      const rec = node.__rec;
      node.setAttribute("fill", colorOf(rec));
    });
  }, [colorOf]);

  /* ----- highlight selected / pinned ----- */
  const repaintHighlight = useCallback(() => {
    const p = propsRef.current;
    const sel = selByName.current;
    Object.keys(sel).forEach(name => {
      const node = sel[name];
      node.classList.toggle("selected", name === p.selected);
      node.classList.toggle("pinned", p.pinned && p.pinned.indexOf(name) >= 0);
    });
  }, []);

  /* ----- build once ----- */
  useEffect(() => {
    let cancelled = false;
    const d3 = window.d3, topojson = window.topojson, ESG = window.ESG;
    if (!d3 || !topojson) { setStatus("error"); return; }

    d3.json(TOPO_URL).then(topo => {
      if (cancelled) return;
      const feats = topojson.feature(topo, topo.objects.countries).features
        .filter(f => f.properties && f.properties.name && f.properties.name !== "Antarctica");
      featuresRef.current = feats;

      const svg = d3.select(svgRef.current);
      const g = d3.select(gRef.current);
      const wrap = wrapRef.current;
      const w = wrap.clientWidth, h = wrap.clientHeight;
      sizeRef.current = { w, h };

      const projection = d3.geoMercator();
      projRef.current = projection;
      const pathGen = d3.geoPath(projection);
      pathGenRef.current = pathGen;
      // fit to a clipped lat band so the world fills the frame like a real map (no polar stretch / empty oval)
      fitMap(projection, w, h);
      applyClip(projection, pathGen, clipRectRef.current);

      // faint graticule only (ocean is the wrapper background — full bleed, no floating sphere)
      g.append("path").attr("class", "graticule").attr("d", pathGen(d3.geoGraticule10()));

      const gc = g.append("g").attr("class", "countries");
      const nodes = {};
      gc.selectAll("path.country").data(feats).enter().append("path")
        .attr("class", "country")
        .attr("d", pathGen)
        .each(function (d) {
          const rec = ESG.lookupByName(d.properties.name);
          this.__rec = rec;
          this.__name = rec ? rec.match : d.properties.name;
          this.__feat = d;
          if (!rec) this.classList.add("nodata");
          this.setAttribute("fill", colorOf(rec)); // colored at creation — base state, not a transition target
          nodes[this.__name] = this;
        })
        .on("mousemove", function (ev, d) {
          const rec = this.__rec;
          const rect = wrapRef.current.getBoundingClientRect();
          setTip({ x: ev.clientX - rect.left, y: ev.clientY - rect.top, rec, name: d.properties.name });
          if (!this.classList.contains("selected")) this.classList.add("hover");
          if (propsRef.current.onHover) propsRef.current.onHover(rec, d.properties.name);
        })
        .on("mouseleave", function () {
          this.classList.remove("hover");
          setTip(null);
          if (propsRef.current.onHover) propsRef.current.onHover(null, null);
        })
        .on("click", function (ev, d) {
          ev.stopPropagation();
          const rec = this.__rec;
          if (propsRef.current.onSelect) propsRef.current.onSelect(rec || null, d.properties.name);
        });
      selByName.current = nodes;

      // zoom
      const zoom = d3.zoom().scaleExtent([1, 9])
        .on("zoom", (ev) => { g.attr("transform", ev.transform); });
      zoomRef.current = zoom;
      svg.call(zoom);
      svg.on("click", () => { if (propsRef.current.onSelect) propsRef.current.onSelect(null, null); });
      svg.on("dblclick.zoom", null);

      setStatus("ready");
      if (onReady) onReady();
      // initial paint + deferred refit (layout may not be settled when topojson resolves)
      requestAnimationFrame(() => {
        paint(); repaintHighlight();
        requestAnimationFrame(() => { fit(); });
      });
      setTimeout(() => { fit(); }, 120);
    }).catch(err => { console.error("topojson load failed", err); if (!cancelled) setStatus("error"); });

    return () => { cancelled = true; };
    // eslint-disable-next-line
  }, []);

  /* ----- resize ----- */
  useEffect(() => {
    if (status !== "ready") return;
    const d3 = window.d3;
    const wrap = wrapRef.current;
    const ro = new ResizeObserver(() => {
      const w = wrap.clientWidth, h = wrap.clientHeight;
      if (!w || !h) return;
      const first = roFirstRef.current;
      roFirstRef.current = false;
      // always fit on the first callback (real layout); afterwards skip sub-pixel jitter
      if (!first && Math.abs(w - sizeRef.current.w) < 2 && Math.abs(h - sizeRef.current.h) < 2) return;
      fit();
      // reset zoom to identity so the freshly-fit map is centered
      d3.select(svgRef.current).call(zoomRef.current.transform, d3.zoomIdentity);
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [status]);

  /* ----- recolor on metric / year ----- */
  useEffect(() => { if (status === "ready") paint(); }, [metric, year, status, paint]);
  /* ----- highlight ----- */
  useEffect(() => { if (status === "ready") repaintHighlight(); }, [selected, pinned, status, repaintHighlight]);
  /* ----- dim no-data when score view? keep simple ----- */

  /* ----- fly to country ----- */
  useEffect(() => {
    if (status !== "ready" || !flyTo || !flyTo.name) return;
    const d3 = window.d3;
    const node = selByName.current[flyTo.name];
    if (!node) return;
    const feat = node.__feat;
    const pathGen = pathGenRef.current;
    const b = flyBounds(feat, pathGen);
    const { w, h } = sizeRef.current;
    const dx = b[1][0] - b[0][0], dy = b[1][1] - b[0][1];
    const cx = (b[0][0] + b[1][0]) / 2, cy = (b[0][1] + b[1][1]) / 2;
    const scale = Math.max(1.9, Math.min(7, 0.55 / Math.max(dx / w, dy / h)));
    const tx = w / 2 - scale * cx, ty = h / 2 - scale * cy;
    const target = d3.zoomIdentity.translate(tx, ty).scale(scale);
    d3.select(svgRef.current).transition().duration(760).ease(d3.easeCubicInOut)
      .call(zoomRef.current.transform, target);
    // safety net: if the tab is backgrounded (rAF throttled), the animated transition can't run —
    // snap to the target so the map always lands on the country.
    const svgNode = svgRef.current;
    setTimeout(() => {
      const cur = svgNode.__zoom;
      if (!cur || Math.abs(cur.k - scale) > 0.02) {
        window.d3.select(svgNode).call(zoomRef.current.transform, target);
      }
    }, 820);
  }, [flyTo, status]);

  const zoomBy = (k) => {
    const d3 = window.d3;
    d3.select(svgRef.current).transition().duration(250).call(zoomRef.current.scaleBy, k);
  };
  const resetZoom = () => {
    const d3 = window.d3;
    d3.select(svgRef.current).transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity);
  };

  // tooltip content
  const tipRec = tip && tip.rec;
  const tipVal = tipRec ? window.ESG.valueAt(tipRec, metric, year) : null;
  const M = window.ESG.METRICS[metric];

  return (
    <div ref={wrapRef} style={{ position: "absolute", inset: 0, background: "var(--bg-map)", overflow: "hidden" }}>
      <svg ref={svgRef} width="100%" height="100%" style={{ display: "block", cursor: "grab" }}>
        <defs>
          <clipPath id="esg-mapclip"><rect ref={clipRectRef} x="0" y="0" width="0" height="0" /></clipPath>
        </defs>
        <g clipPath="url(#esg-mapclip)">
          <g ref={gRef}></g>
        </g>
      </svg>

      {/* zoom controls */}
      <div style={{ position: "absolute", top: 18, right: 18, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", boxShadow: "var(--shadow)" }}>
          <button onClick={() => zoomBy(1.5)} style={zbtn}><Icon name="plus" size={17} /></button>
          <div style={{ height: 1, background: "var(--border)" }} />
          <button onClick={() => zoomBy(1 / 1.5)} style={zbtn}><Icon name="minus" size={17} /></button>
        </div>
        <button onClick={resetZoom} title="Reset view" style={{ ...zbtn, border: "1px solid var(--border)", borderRadius: 10, background: "var(--panel)", boxShadow: "var(--shadow)" }}><Icon name="globe" size={17} /></button>
      </div>

      {/* tooltip */}
      {tip && (
        <div style={{
          position: "absolute", left: Math.min(tip.x + 16, sizeRef.current.w - 190), top: Math.max(10, tip.y - 14),
          pointerEvents: "none", background: "rgba(16,21,18,.96)", border: "1px solid var(--border-2)",
          borderRadius: 9, padding: "9px 12px", minWidth: 150, boxShadow: "var(--shadow)", zIndex: 5,
          backdropFilter: "blur(4px)",
        }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: tipRec ? 5 : 0 }}>{tipRec ? tipRec.name : tip.name}</div>
          {tipRec ? (
            <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
              <span className="mono tnum" style={{ fontSize: 19, fontWeight: 600, color: scales ? scales[metric](tipVal) : "#fff" }}>{M.fmt(tipVal)}</span>
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>{M.unit !== "%" ? M.unit : ""} {M.short}</span>
            </div>
          ) : (
            <div style={{ fontSize: 11, color: "var(--text-3)" }}>No coverage in dataset</div>
          )}
          {tipRec && <div style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 4 }}>{tipRec.region} · click for detail</div>}
        </div>
      )}

      {/* loading / error overlay */}
      {status !== "ready" && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "var(--text-3)" }}>
          {status === "loading"
            ? <div className="mono" style={{ fontSize: 13, letterSpacing: ".08em" }}>LOADING WORLD GEOMETRY…</div>
            : <div style={{ textAlign: "center" }}><div className="mono" style={{ color: "var(--bad)" }}>MAP DATA FAILED TO LOAD</div><div style={{ fontSize: 12, marginTop: 6 }}>Check network access to jsdelivr CDN.</div></div>}
        </div>
      )}
    </div>
  );
}

const zbtn = {
  width: 38, height: 38, display: "grid", placeItems: "center",
  background: "var(--panel)", border: "none", color: "var(--text-2)", transition: "color .15s, background .15s",
};

window.WorldMap = WorldMap;
