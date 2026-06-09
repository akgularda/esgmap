# Claude Code Prompt — Build ESGMap with Real Data

Copy everything below the line into Claude Code, with the `design_handoff_esgmap/` folder
present in your repo. It tells Claude Code exactly what to build, how to wire real data, and how
to verify it.

---

## Role & Goal

You are building **ESGMap**, an interactive dark-themed world-map application that visualises
national sustainability indicators. A working **HTML/JSX design reference** lives in
`design_handoff_esgmap/` (see `README.md` there for the full spec, design tokens, and component
breakdown; see `screenshots/` for the intended look of every view).

Your job has two parts:

1. **Recreate the design faithfully** in a production stack (not in-browser Babel).
2. **Replace the prototype's representative data with real, dated values** pulled from the
   authoritative open datasets named below.

Treat the HTML files as the source of truth for **look and behaviour**; treat them as **wrong**
on the actual numbers — those are placeholders.

## Tech Stack

- **React + TypeScript + Vite** (or Next.js App Router if you prefer SSR).
- **D3** (`d3-geo`, `d3-zoom`, `d3-scale`, `d3-selection`) for the map and scales.
- **topojson-client** + Natural Earth 110m geometry (`world-atlas` `countries-110m.json`),
  self-hosted under `public/`.
- Fonts: **IBM Plex Sans** + **IBM Plex Mono**.
- No CSS framework required; use CSS variables / CSS modules. Match the tokens in the handoff
  README exactly.

## Architecture

Mirror the prototype's separation of concerns:

- `src/data/` — the real data layer (see below). Expose a typed API equivalent to the
  prototype's `window.ESG`:
  - `countries: CountryRecord[]`, `byName: Record<string, CountryRecord>`
  - `lookupByName(neName: string): CountryRecord | null` (with an ISO-3 → Natural-Earth alias map)
  - `METRICS` metadata (`key, label, short, unit, domain, ticks, hasHistory, better, fmt`)
  - `buildScales()` → d3 color scales per metric
  - `valueAt(record, metricKey, year)` and `regionalTrend(metricKey)`
- `src/components/WorldMap.tsx` — D3 map (Mercator, full-bleed, latitude-clipped, zoom/pan,
  hover tooltip, click-select, fly-to-largest-landmass).
- `src/components/CountryPanel.tsx`, `Sidebar.tsx`, `SearchBox.tsx`, `Legend.tsx`,
  `TimeSlider.tsx`, `CompareBar.tsx`.
- `src/overlays/` — `Rankings.tsx`, `RegionalTrends.tsx`, `Compare.tsx`, `Methodology.tsx`.
- `src/App.tsx` — root state: `metric, year, selected, pins, view, scales`.
- `src/ui/` — `Icon`, `StatusDot`, `ScoreRing`, `MixBar`, `LineChart`, `Segmented`.

## Real Data — the core task

Build an **ingestion script** (`scripts/build-data.ts`, run at build time) that downloads the
open CSVs, normalises them on **ISO-3166 alpha-3** country codes, maps ISO-3 → Natural Earth
`name`, and emits a single typed `data/countries.json` consumed by the app. Stamp each source
with a `retrievedAt` date and surface those dates in the Methodology view.

Wire each metric to its real source:

| Field | Metric | Unit | Source (open data) |
|---|---|---|---|
| `renewable` | Renewable electricity share | % | **Ember** Electricity Data (yearly); fallback IEA/IRENA |
| `carbon` | Grid carbon intensity | gCO₂/kWh | **Ember**; Our World in Data `carbon-intensity-electricity` |
| `co2pc` | CO₂ per capita | t/yr | **Our World in Data** CO₂ dataset (Global Carbon Project) |
| `pm25` | Air quality (PM2.5) | µg/m³ | **WHO** Ambient Air Quality DB; World Bank `EN.ATM.PM25.MC.M3` |
| `forest` | Forest cover | % land | **World Bank** `AG.LND.FRST.ZS` (FAO FRA) |
| `energy` | Electricity use per capita | kWh | **Our World in Data** / Ember per-capita electricity |
| `ev` | EV sales share | % | **IEA** Global EV Outlook |
| `climate` | Climate-risk exposure | /100 | **ND-GAIN** Country Index (invert readiness) or INFORM Risk |
| `mix` | Electricity mix | % | **Ember** generation by source |
| `paris`, `ndc` | Paris status / 2030 NDC | — | **UNFCCC** NDC Registry; Climate Watch (WRI) |
| `netZero` | Net-zero target year | year | **Net Zero Tracker** (Oxford/ECIU) |
| `ifrsS1/2`, `esg` | ISSB adoption | enum | **IFRS Foundation** jurisdiction profiles |
| `score` | Sustainability composite | /100 | **Derive** (documented formula, see below) |

Notes:
- Prefer the **latest year** with broad coverage for headline values; build the
  `renewable`/`carbon` **time series 2000→latest** from the yearly CSVs (no synthetic
  interpolation — use real annual points; gap-fill only by carrying forward and flag it).
- Define `score` as a transparent, documented composite, e.g. a weighted blend of normalised
  clean-power share, inverted grid carbon intensity, inverted CO₂/capita, and a disclosure-
  readiness sub-score. Put the exact weights in `Methodology.tsx`.
- Some indicators are policy/categorical (Paris, IFRS, net-zero) and update rarely — a curated,
  dated JSON maintained in-repo is acceptable; cite the source + date.
- Countries with missing data must render in the `--no-data` grey and show "no data" in the
  panel/tooltip — never invent values.

## Visual Spec (match exactly)

Pull the full token list from `design_handoff_esgmap/README.md`. Key points:
- Colors: backgrounds `#0c100e` / ocean `#0a161a`, panels `#131815`, accent green `#5fbf7f`,
  no-data `#2c352d`, etc.
- Seven metric color scales (exact d3 `scaleLinear` domains/ranges are in the README).
- All **numbers** use IBM Plex Mono with `tabular-nums`.
- Map: `geoMercator`, fit to fill width, **SVG clipPath rect** to a latitude band (≈ +73°…−56°)
  to kill polar smear and the floating-oval look. **No country-name labels on the map**
  (intentional). Country fills set **imperatively** (not via CSS `fill` transition — that froze
  black in some contexts).
- Fly-to centers on a multipolygon's **largest landmass** (France → metropolitan France).
  Include a `setTimeout` fallback so the end state is reached even if rAF is throttled.
- Entrance animations are **transform-only** (no opacity fade) and respect
  `prefers-reduced-motion`.

## Views to build (screenshots in `design_handoff_esgmap/screenshots/`)

1. **Map** (`01-map-renewable.png`, `03-climate-layer.png`) — sidebar + full-bleed map, search,
   active-layer chip, legend, time slider, zoom controls.
2. **Country panel** (`02-country-panel.png`) — score ring, stat tiles, environment/energy tiles,
   EV highlight, mix bar, history chart with Renewables/Carbon toggle, disclosure rows.
3. **Rankings** (`04-rankings.png`) — metric + region filters, sorted bar rows, click to select.
4. **Regional trends** (`05-regional-trends.png`) — multi-line chart per region, toggle chips.
5. **Methodology** (`06-methodology.png`) — per-variable definition + **SOURCE** line; update the
   amber notice to cite live sources **with retrieval dates** once real data is wired.

## Acceptance Criteria

- [ ] App runs from a real build (Vite/Next), no in-browser Babel.
- [ ] All 7 map layers recolor the map, legend, and chip; time slider scrubs `renewable`/`carbon`.
- [ ] Every value originates from a real dataset via the ingestion script; `data/countries.json`
      is reproducible by re-running `scripts/build-data.ts`.
- [ ] Each source carries a `retrievedAt` date shown in Methodology.
- [ ] Missing data renders grey + "no data", never fabricated.
- [ ] Country panel, Rankings, Regional trends, Compare all match the screenshots.
- [ ] Map has no polar smear, no floating oval, no country-name labels; fly-to lands on the
      correct landmass.
- [ ] Lighthouse/perf sane; map interactions smooth at 60fps on a mid laptop.
- [ ] Licensing respected: keep each dataset's attribution + license in `DATA_SOURCES.md`.

## Start by

1. Reading `design_handoff_esgmap/README.md` end to end.
2. Scaffolding the Vite + React + TS app and porting the UI primitives + tokens.
3. Building `scripts/build-data.ts` for **renewable** first (Ember), proving the end-to-end path
   (CSV → ISO-3 normalise → Natural-Earth name → map recolor), then adding the other metrics.
4. Wiring the remaining views against the typed data API.
