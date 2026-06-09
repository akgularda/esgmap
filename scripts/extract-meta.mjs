/**
 * One-off helper: extract the *curated, slow-moving* categorical layer from the
 * design-handoff prototype (`design_handoff_esgmap/esg-data.js`) and attach an
 * ISO-3166 alpha-3 code to every record. The output (`scripts/country-meta.json`)
 * is the only piece of the prototype we keep: region, capital, tier, and the
 * policy / disclosure / EV / climate-risk fields that the PROMPT explicitly
 * permits to live as a curated, dated JSON. Every *numeric headline* metric
 * (renewable, carbon, co2pc, pm25, forest, energy, mix, history) is discarded
 * here and re-sourced from real open datasets by `build-data.mjs`.
 *
 * Run:  node scripts/extract-meta.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// ISO-3 for every curated territory, keyed by the Natural Earth `match` name.
const ISO3 = {
  Norway: "NOR", Iceland: "ISL", Sweden: "SWE", Denmark: "DNK", Finland: "FIN",
  France: "FRA", Germany: "DEU", "United Kingdom": "GBR", Netherlands: "NLD",
  Belgium: "BEL", Austria: "AUT", Switzerland: "CHE", Spain: "ESP", Italy: "ITA",
  Portugal: "PRT", Ireland: "IRL", Poland: "POL", Czechia: "CZE", Romania: "ROU",
  Greece: "GRC", Ukraine: "UKR", Russia: "RUS", China: "CHN", India: "IND",
  Japan: "JPN", "South Korea": "KOR", Indonesia: "IDN", Vietnam: "VNM",
  Thailand: "THA", Pakistan: "PAK", Bangladesh: "BGD", Kazakhstan: "KAZ",
  Iran: "IRN", "Saudi Arabia": "SAU", "United Arab Emirates": "ARE", Turkey: "TUR",
  "South Africa": "ZAF", Egypt: "EGY", Morocco: "MAR", Nigeria: "NGA", Kenya: "KEN",
  "United States of America": "USA", Canada: "CAN", Mexico: "MEX", Brazil: "BRA",
  Argentina: "ARG", Chile: "CHL", Colombia: "COL", Peru: "PER", Australia: "AUS",
  "New Zealand": "NZL",
  // base tier
  Algeria: "DZA", Angola: "AGO", Ghana: "GHA", Ethiopia: "ETH", Tanzania: "TZA",
  Mozambique: "MOZ", Zambia: "ZMB", Zimbabwe: "ZWE", Sudan: "SDN", Tunisia: "TUN",
  Libya: "LBY", "Dem. Rep. Congo": "COD", Iraq: "IRQ", Qatar: "QAT", Kuwait: "KWT",
  Oman: "OMN", Israel: "ISR", Jordan: "JOR", Syria: "SYR", Afghanistan: "AFG",
  Myanmar: "MMR", Philippines: "PHL", Malaysia: "MYS", "Sri Lanka": "LKA",
  Nepal: "NPL", Mongolia: "MNG", Uzbekistan: "UZB", Turkmenistan: "TKM",
  Azerbaijan: "AZE", Georgia: "GEO", Belarus: "BLR", Bulgaria: "BGR",
  Hungary: "HUN", Slovakia: "SVK", Serbia: "SRB", Croatia: "HRV", Bolivia: "BOL",
  Venezuela: "VEN", Ecuador: "ECU", Paraguay: "PRY", Uruguay: "URY", Cuba: "CUB",
  Guatemala: "GTM",
};

// Evaluate the prototype IIFE in a minimal sandbox to recover window.ESG.
const proto = readFileSync(resolve(root, "design_handoff_esgmap", "esg-data.js"), "utf8");
const sandbox = { window: {}, Math, console };
const fn = new Function("window", "Math", "console", proto);
fn(sandbox.window, Math, console);
const ESG = sandbox.window.ESG;
if (!ESG) throw new Error("Failed to load prototype ESG data");

const KEEP = [
  "paris", "parisYear", "ndc", "netZero", "ifrsS1", "ifrsS2", "esg", "ev", "climate",
];

const meta = ESG.all.map((c) => {
  const match = c.match; // Natural Earth name
  const iso3 = ISO3[match];
  if (!iso3) throw new Error(`Missing ISO-3 for "${match}"`);
  const out = {
    iso3,
    name: c.name,
    match,
    region: c.region,
    tier: c.tier,
  };
  if (c.capital) out.capital = c.capital;
  for (const k of KEEP) if (c[k] != null) out[k] = c[k];
  return out;
}).sort((a, b) => a.name.localeCompare(b.name));

writeFileSync(
  resolve(__dirname, "country-meta.json"),
  JSON.stringify(meta, null, 2) + "\n",
);
console.log(`Wrote country-meta.json — ${meta.length} territories.`);
