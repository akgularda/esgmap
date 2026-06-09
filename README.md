# ESGMap — Global Sustainability Atlas

An interactive, dark-themed world map of national sustainability indicators. Pick one of seven
map layers, the world recolours by that metric, and clicking any country opens a detail panel
with its energy mix, disclosure status, environmental indicators and a 25-year historical trend.
Supporting views add a sortable **Rankings** table, a **Regional trends** overlay, a two-country
**Compare** view, and a **Methodology** page documenting every source with its retrieval date.

Built with **React + TypeScript + Vite + D3**, wired to **real, dated open data**, and deployable
to **GitHub Pages** as a fully static site.

![Map view](design_handoff_esgmap/screenshots/01-map-renewable.png)

## Highlights

- **Real data, never invented.** Headline metrics are ingested from Our World in Data and the
  World Bank by a reproducible build script; missing values render grey / "no data".
- **Seven map layers** — renewable power, grid carbon intensity, CO₂ per capita, air quality
  (PM2.5), forest cover, climate-risk exposure, and a documented composite score.
- **D3 world map** — `geoMercator`, full-bleed, latitude-clipped to kill polar smear, zoom/pan,
  hover tooltips, click-to-select with fly-to that centres on a country's **largest landmass**.
- **Time slider** scrubs the 2000→latest history for the renewable and carbon layers.
- **Self-hosted geometry & data** — no third-party runtime calls; one JS bundle + one GeoJSON.

## Tech stack

| Concern | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 (static output, relative base for Pages) |
| Map / scales | `d3-geo`, `d3-zoom`, `d3-scale`, `d3-selection`, `d3-transition`, `topojson-client` |
| Geometry | Natural Earth 110m (`world-atlas`), self-hosted under `public/geo/` |
| Fonts | IBM Plex Sans + IBM Plex Mono |
| Data | Our World in Data (Energy, CO₂); World Bank (forest, PM2.5); curated policy layer |

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check (`tsc -b`) + production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Type-check only |
| `npm run build:data` | Re-ingest the live open-data feeds → `src/data/countries.json` |
| `npm run build:meta` | Regenerate the curated policy layer from the design handoff |

## Data pipeline

`scripts/build-data.mjs` downloads the open CSV / JSON feeds, normalises them on ISO-3166 alpha-3
codes, maps ISO-3 → Natural Earth `name`, derives the composite score, and emits a single typed
`src/data/countries.json` (imported directly by the app). Every source carries a `retrievedAt`
date that the Methodology view surfaces. See **[DATA_SOURCES.md](DATA_SOURCES.md)** for the full
provenance table, licensing, and the score formula.

```
OWID Energy CSV  ─┐
OWID CO₂ CSV     ─┤
World Bank API   ─┼─►  build-data.mjs  ─►  src/data/countries.json  ─►  app
curated layer    ─┘     (ISO-3 join, derive score, stamp dates)
```

The dataset is committed so the app builds and deploys without network access; the CI workflow
attempts a fresh ingest on each deploy and falls back to the committed copy if a feed is down.

## Architecture

```
src/
  data/        esg.ts (typed window.ESG-equivalent API) + countries.json (generated)
  ui/          Icon, StatusDot, ScoreRing, MixBar, LineChart, Segmented, tokens
  components/  WorldMap, CountryPanel, Sidebar, SearchBox, Legend, TimeSlider, CompareBar
  overlays/    Rankings, RegionalTrends, Compare, Methodology, OverlayCard
  layers.ts    map-layer config + legend gradient
  App.tsx      root state: metric, year, selected, pins, view, scales
scripts/
  build-data.mjs   real-data ingestion (run at build time)
  extract-meta.mjs  one-off: curated layer extraction
public/geo/    self-hosted Natural Earth TopoJSON
```

The typed `src/data/esg.ts` preserves the prototype's `window.ESG` contract (`all`, `byName`,
`lookupByName`, `METRICS`, `buildScales`, `valueAt`, `regionalTrend`, `YEAR_MIN/MAX`, `NO_DATA`)
so the UI maps 1:1 onto the design handoff.

## Deployment (GitHub Pages)

The repo ships a workflow at `.github/workflows/deploy.yml`:

1. Push to `main` (or `master`).
2. In the repo's **Settings → Pages**, set **Source = GitHub Actions**.
3. The workflow installs, optionally refreshes data, builds, and publishes `dist/`.

`vite.config.ts` uses `base: "./"` (relative URLs) and `public/.nojekyll` is included, so the
same build works at both a user page (`user.github.io`) and a project page
(`user.github.io/esgmap/`) with no config change. To deploy manually:

```bash
npm run build      # outputs dist/
# publish dist/ to the gh-pages branch or any static host
```

## Design provenance

The original high-fidelity HTML/JSX prototype lives in `design_handoff_esgmap/` (look, tokens,
component breakdown, and screenshots of every view). This app reproduces that design faithfully in
a production stack and replaces the prototype's representative numbers with real, dated values.

## License

Application code: MIT. Upstream datasets retain their own licenses — see
[DATA_SOURCES.md](DATA_SOURCES.md).
