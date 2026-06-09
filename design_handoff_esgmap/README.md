# Handoff: ESGMap — Global Sustainability Atlas

## Overview
ESGMap is an interactive, dark-themed world-map application that visualises national
sustainability indicators. A user picks a **map layer** (one of seven metrics), the world
recolours by that metric, and clicking any country opens a detail panel with its energy mix,
disclosure status, environmental indicators, and a 25-year historical trend. Supporting views
add a sortable **Rankings** league table, a **Regional trends** overlay (25-year trajectories
averaged per region), a two-country **Compare** view, and a **Methodology** page that documents
the data source for every variable.

The current prototype ships with **representative (illustrative) data**. The next job — the
reason for this handoff — is to **replace that representative data with real, dated values pulled
from the authoritative sources listed below**, and otherwise reproduce the design's behaviour in
the target codebase.

## About the Design Files
The files in this bundle are **design references created in HTML/React-via-Babel** — a working
prototype that demonstrates the intended look, layout, and interactions. They are **not meant to
be shipped as-is**. The task is to **recreate this design in the target codebase's environment**
(e.g. a real React/Next.js app with a proper build step, or Vue/Svelte/etc.) using its
established patterns, then **wire in real data**. If no front-end environment exists yet, choose
an appropriate modern stack (React + Vite + D3, or similar) and implement there.

The prototype loads React, ReactDOM, and Babel from CDNs and transpiles JSX in the browser. In
production you should use a real bundler/transpiler instead of in-browser Babel.

## Fidelity
**High-fidelity.** Colours, typography, spacing, component styling, and interactions are final
and intended to be reproduced faithfully. Exact tokens are listed in the Design Tokens section.
The only thing that is *not* final is the underlying data, which is representative and must be
replaced with real feeds.

## Architecture of the Prototype
Files load in this order (see `ESGMap.html`):

1. `esg-data.js` — plain JS. All data + the `window.ESG` API (records, color scales, metric
   metadata, `valueAt()`, `regionalTrend()`). **This is the file to gut and replace with a real
   data layer.**
2. `esg-ui.jsx` — shared primitives: `Icon`, `StatusDot`, `ScoreRing`, `MixBar`, `LineChart`,
   `Segmented`, color maps. Exported to `window`.
3. `esg-map.jsx` — the `WorldMap` React component wrapping an imperative D3 map (Mercator,
   full-bleed, zoom/pan, hover tooltip, click-select, fly-to).
4. `esg-panel.jsx` — `CountryPanel` (the right-hand country detail drawer) + `StatTile`,
   `DisclosureRow`, `SectionLabel`.
5. `esg-app.jsx` — chrome: `Sidebar`, `SearchBox`, `Legend`, `TimeSlider`, `CompareBar`,
   the `LAYERS` array, `gradientCss()`.
6. `esg-main.jsx` — `App` (root state) + overlays: `RankingsOverlay`, `RegionTrendsOverlay`,
   `CompareOverlay`, `AboutOverlay`. Mounts to `#root`.

### The data API (`window.ESG`) — the contract to preserve
Whatever real data layer you build, keep this shape so the UI keeps working:

- `ESG.all` — array of country records.
- `ESG.byName` — map of `matchName → record` (matchName matches the Natural Earth `name`
  property used by the world-atlas TopoJSON).
- `ESG.lookupByName(neName)` — resolve a Natural Earth feature name (handles alias spellings).
- `ESG.METRICS` — per-metric metadata: `{ key, label, short, unit, domain, ticks, hasHistory,
  better: 'high'|'low', fmt(v) }`.
- `ESG.buildScales()` — returns `{ <metricKey>: d3.scaleLinear()... }` color scales (call after
  d3 is loaded).
- `ESG.valueAt(record, metricKey, year)` — current or historical value (returns `null` if no
  data). History only exists for `renewable` and `carbon`.
- `ESG.regionalTrend(metricKey)` — `[{ region, years[], values[], n }]` averaged across the
  rich-tier members of each region.
- `ESG.YEAR_MIN` (2000), `ESG.YEAR_MAX` (2025), `ESG.NO_DATA` (the grey fill for uncovered
  countries).

A country record currently looks like:
```js
{
  name, region, capital, tier: 'rich'|'base', match,
  renewable, carbon, co2pc, score,          // headline metrics
  pm25, forest, energy, ev, climate,        // environment & energy
  mix: { hydro, wind, solar, nuclear, fossil, other },  // % of generation
  paris, parisYear, ndc, netZero, ifrsS1, ifrsS2, esg,  // policy/disclosure (rich tier)
  history: { years[], renewable[], carbon[] }           // 2000–2025 series
}
```

## Metrics & Real Data Sources (the core task)
Each map layer maps to a metric key. Replace the representative values with real ones from:

| Metric key | Label | Unit | better | Real source to wire in |
|---|---|---|---|---|
| `renewable` | Renewable electricity | % | high | Ember Electricity Data Explorer; IEA; IRENA |
| `carbon` | Grid carbon intensity | gCO₂/kWh | low | Ember; IEA Emissions Factors; electricitymaps.com |
| `co2pc` | CO₂ per capita | t/yr | low | Global Carbon Project; Our World in Data; EDGAR (JRC) |
| `pm25` | Air quality (PM2.5) | µg/m³ | low | WHO Ambient Air Quality DB; IQAir World AQ Report |
| `forest` | Forest cover | % land | high | FAO FRA / FAOSTAT; World Bank `AG.LND.FRST.ZS` |
| `climate` | Climate-risk exposure | /100 | low | ND-GAIN Country Index; INFORM Risk Index |
| `score` | Sustainability score | /100 | high | ESGMap composite (derive from the above) |

Non-layer fields shown in the panel:
- Electricity use per capita (`energy`, kWh) → IEA; Ember; World Bank
- EV adoption (`ev`, % of new car sales) → IEA Global EV Outlook
- Energy mix (`mix`) → Ember; IEA
- Paris Agreement & NDC (`paris`, `ndc`) → UNFCCC NDC Registry; Climate Watch (WRI)
- Net-zero pledge (`netZero`) → Net Zero Tracker (Oxford/ECIU); Climate Watch
- IFRS S1/S2 adoption (`ifrsS1`, `ifrsS2`, `esg`) → IFRS Foundation jurisdiction profiles; IOSCO

History (`renewable` and `carbon` time series, 2000–2025) should come from Ember/IEA annual
series rather than the prototype's synthetic interpolation.

**Recommended implementation:** ingest the open CSVs (Our World in Data and Ember both publish
permissively-licensed country-year CSVs), normalise country names to the Natural Earth `name`
field used by the map, and emit the `window.ESG`-shaped API (or an idiomatic data hook in your
framework). Keep a dated "retrieved on" stamp per source and surface it in the Methodology view.

## Screens / Views

### 1. Main map (default)
- **Layout:** Fixed left **Sidebar** (248px) + flexible **main** map area filling the rest.
  Map is absolutely-positioned full-bleed over an ocean background.
- **Sidebar (top→bottom):** brand lockup (leaf logo tile + "ESGMap" / "Global Sustainability
  Atlas"); nav (Map, Rankings, Regional trends, Compare, Methodology); divider; "MAP LAYER"
  list of 7 layer buttons (icon tile + label + description, selected = darker bg + accent icon);
  spacer; footer ("Representative data · prototype", edition year + territory count). Sidebar
  scrolls if short.
- **Map overlays:** top-left **search** box (340px); top-center **active-layer chip** (pill
  showing current layer + year); bottom-left **CompareBar** (only when countries pinned) stacked
  above the **TimeSlider** (360px); bottom-right **Legend** (300px, shifts left by ~392px when a
  country panel is open); top-right zoom controls (+/−/reset).
- **Map itself:** D3 `geoMercator`, fit to fill width edge-to-edge, clipped to a latitude band
  (≈ +73°…−56°) so polar smearing is hidden. Countries colored by the active metric via the
  matching d3 scale; uncovered countries use `--no-data` grey. Hover raises a tooltip with the
  country name + value; click opens the panel and flies/zooms to the country. **No country-name
  labels are drawn on the map** (intentional — removed per design review).

### 2. Country panel (right drawer, 392px)
Slides in from the right when a country is selected. Top→bottom:
- Header: 3px region-tone accent bar, region label, "limited coverage" tag for base-tier,
  country name (25px/600), capital, close button.
- Score block: `ScoreRing` (composite score) + description.
- Stat tiles grid (2-col): Renewable power, Grid carbon, Emissions (CO₂/cap), Net-zero target.
- "Environment & energy" tiles (2-col): Air quality, Forest cover, Electricity use, Climate
  risk; plus an **EV adoption** highlight row with a progress bar (rich tier only).
- Electricity mix: `MixBar` stacked horizontal bar + legend chips.
- History chart: `LineChart` with a Renewables/Carbon `Segmented` toggle + a "+X pp over
  2015–2025" delta line.
- Policy & disclosure (rich tier): `DisclosureRow`s for Paris Agreement, 2030 NDC, Net-zero
  pledge, IFRS S1, IFRS S2 — each with a status dot + label. Base-tier shows a "headline metrics
  only" note.
- Footer: "Add to compare" / "Added to compare" toggle button.

### 3. Rankings overlay
Modal card (760px). Metric pills (7) + region filter pills. Sorted list rows: rank number
(top-3 in accent), region swatch + country name + region, a horizontal value bar, and the
formatted value (colored by scale). Clicking a row selects that country (opens panel + flies to
it). Sort direction respects each metric's `better` flag.

### 4. Regional trends overlay
Modal card (780px). Renewables/Carbon `Segmented` toggle. A multi-line `LineChart` (720×300)
with one line per region (colored by region tone). Below: toggle chips per region showing the
latest value and the 2000→2025 delta; clicking a chip hides/shows that line.

### 5. Compare overlay
Modal card (620px). Two country columns (region swatch, name, score ring, remove button). A
metric comparison table (Renewable, Grid carbon, CO₂/capita, PM2.5, Forest, Sustainability,
Net-zero year) where the better side is highlighted in accent. A two-line `LineChart` history
with Renewables/Carbon toggle + legend.

### 6. Methodology overlay
Modal card (640px), scrollable. Intro paragraph, then a `Def` per variable: title, description,
and a green **SOURCE** line. Closes with a "Reference sources" note and an amber **Prototype data
notice** making clear the current numbers are representative, not scraped. **When real data is
wired in, update this notice to cite the live sources + retrieval dates instead.**

## Interactions & Behavior
- **Layer switch:** recolors every country (CSS transition removed from fill — fills are set
  imperatively at creation/update so they never freeze at black), updates legend gradient/ticks
  and the active-layer chip. Non-historical metrics disable the time slider.
- **Hover:** country gets a light stroke; floating tooltip follows the cursor (clamped to map
  bounds) showing name + current-metric value.
- **Click country:** selects it → panel slides in, legend shifts left, map zooms/pans to the
  feature (fly-to). Fly-to centers on the **largest landmass** of a multipolygon (so France
  centers on metropolitan France, not the midpoint with French Guiana). A `setTimeout` fallback
  snaps to the target if animation frames are throttled (e.g. backgrounded tab).
- **Click empty ocean / Esc:** closes panel (or closes the open overlay first).
- **Zoom:** d3-zoom, scaleExtent [1, 9], wheel + drag pan; +/− buttons scale by 1.5×; reset
  returns to identity. ResizeObserver refits the projection on container resize.
- **Search:** filters countries by name/region, shows up to 8 results with the current-metric
  value; picking one selects + flies to it.
- **Time slider (2000–2025):** scrubs historical value for `renewable`/`carbon` layers; recolors
  the map per year. Disabled (greyed) for metrics without history.
- **Compare:** pin up to 2 countries (3rd replaces the oldest); CompareBar shows pins; "Compare"
  opens the overlay.
- **Transitions:** panel/​overlay entrance animations are **transform-only** (no opacity fade)
  so a paused/exported frame is never blank. Respect `prefers-reduced-motion`.

## State Management
Root state lives in `App` (`esg-main.jsx`):
- `metric` — active map layer key (default `'renewable'`).
- `year` — selected year (default `YEAR_MAX` = 2025).
- `selRec` — selected country record (or null) → drives the panel.
- `pins` — array of up to 2 pinned match-names → CompareBar/Compare.
- `flyTo` — `{ name, token }` signal consumed by `WorldMap` to zoom to a country.
- `view` — `null | 'rankings' | 'trends' | 'compare' | 'about'` → which overlay is open.
- `scales` — memoized `ESG.buildScales()`.
Map internals (zoom transform, D3 selections, projection, sizes) are kept in refs inside
`WorldMap`, not React state.

## Design Tokens

### Colors
```
--bg:        #0c100e   (app background)
--bg-map:    #0a161a   (ocean / map background)
--ocean:     #0a161a
--panel:     #131815   (sidebar, panel, modal surface)
--panel-2:   #171d19   (tiles, inset surfaces)
--elev:      #1c231e   (raised controls)
--border:    #283029
--border-2:  #323b34
--text:      #e9ede9
--text-2:    #aab3ac
--text-3:    #717b73   (muted)
--accent:    #5fbf7f   (primary green)
--accent-2:  #3f8f5c
--warn:      #e0a23c
--bad:       #d4503e
--no-data:   #2c352d   (uncovered countries)   [ESG.NO_DATA]
--shadow:    0 18px 50px -12px rgba(0,0,0,.7)
```

### Metric color scales (d3 scaleLinear, RGB interpolation, clamped)
- `renewable` [0,20,40,60,80,100] → #7a4a1e #a06a22 #c2982e #9bbf4a #5aae54 #2f9e57
- `carbon` [0,150,300,600,900,1200] → #2f9e57 #9bbf4a #e0c542 #e08a3c #d4503e #7a2d28
- `co2pc` [0,2,6,12,20,35] → #2f9e57 #9bbf4a #e0c542 #e08a3c #d4503e #7a2d28
- `pm25` [0,10,25,40,60,100] → #2f9e57 #9bbf4a #e0c542 #e08a3c #d4503e #7a2d28
- `forest` [0,15,35,55,80] → #8a6a3a #bfa24a #9bbf4a #4fa85a #1f7a44
- `climate` [15,30,45,60,80] → #2f9e57 #9bbf4a #e0c542 #e08a3c #b34334
- `score` [20,40,60,80,95] → #b34334 #d4823c #e0c542 #7fb35a #2f9e57

### Energy-mix colors
hydro #3b8fd4 · wind #5fbf7f · solar #e0c542 · nuclear #a07fd4 · fossil #6b5142 · other #7f8a82

### Region tones
Europe #3b8fd4 · Asia #d4823c · Africa #e0c542 · Americas #5fbf7f · Middle East #a07fd4 ·
Oceania #3bc4c4 · Eurasia #c4683b

### Disclosure-status colors
ratified/mandatory #5fbf7f · adopting #7fb86a · roadmap #e0c542 · consulting/signed #e0a23c ·
withdrawn #d4503e · none #8a948c

### Typography
- Sans: **IBM Plex Sans** (300–700). Base 14px.
- Mono: **IBM Plex Mono** (400–600) — used for all numbers (with `font-variant-numeric:
  tabular-nums`), the active-layer chip year, and legend ticks.
- Notable sizes: sidebar brand 16/700; nav 13.5; country name 25/600; stat-tile value 23/600
  mono; score ring number ≈30% of ring size.

### Radii / misc
Controls/tiles 7–11px; modal cards 14px; pills 99px. Country stroke 0.4px (#0a0e0c),
hover 1.1px (#eef3ee), selected 1.4px (#fff), `vector-effect: non-scaling-stroke`.

## Assets
- **Map geometry:** `world-atlas@2.0.2/countries-110m.json` (Natural Earth 110m, via CDN). Host
  this yourself in production. Country matching keys off the TopoJSON `properties.name`.
- **Icons:** inline single-path SVGs defined in `esg-ui.jsx` (`Icon` component) — no external
  icon library. No raster images or logos are used; the brand mark is a CSS tile + leaf icon.
- **Fonts:** IBM Plex Sans / Mono via Google Fonts.

## Files (in this bundle)
- `ESGMap.html` — entry point, design tokens, font + library loading, script order.
- `esg-data.js` — data + `window.ESG` API (**replace this with the real data layer**).
- `esg-ui.jsx` — shared UI primitives.
- `esg-map.jsx` — D3 world-map component.
- `esg-panel.jsx` — country detail panel.
- `esg-app.jsx` — sidebar, search, legend, time slider, compare bar, layer list.
- `esg-main.jsx` — root App + overlays + mount.

## Implementation Notes / Gotchas
- Country fills are set imperatively (attribute), **not** via a CSS `fill` transition — a fill
  transition froze countries black in some render contexts. Keep fills imperative.
- The Mercator projection is fit to fill width and then clipped via an SVG `clipPath` rect to a
  latitude band; this both removes the empty-oval look and hides Arctic-island smearing. See
  `fitMap()` + `applyClip()` in `esg-map.jsx`.
- d3 transitions don't tick when animation frames are throttled; fly-to has a `setTimeout`
  fallback to guarantee the end state. Plan for the same in production.
- Name matching: the prototype keeps an `ALIAS` table (e.g. "Czech Republic"→"Czechia",
  "Republic of Korea"→"South Korea", USA, UAE, Türkiye, DR Congo). A real pipeline should
  normalise on ISO-3 codes and map ISO-3 → Natural Earth name once.
