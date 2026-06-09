/* ESGMap — curated external sustainability indices for convergent-validity checks.
 *
 * A small, clearly-cited anchor set of widely-published index scores (higher = better)
 * used to cross-check the ESGMap composite. This is an INDICATIVE subset, not a full
 * reproduction of those indices — the Validation view reports n explicitly and never
 * presents these as ESGMap's own data. Replace/extend from the licensed source files
 * to widen coverage.
 */
export interface ExternalIndex {
  id: string;
  label: string;
  year: number;
  source: string;
  url: string;
  /** iso3 → published score (higher = better). */
  scores: Record<string, number>;
}

// Yale Environmental Performance Index 2024 (epi.yale.edu) — overall EPI score,
// indicative anchor subset of major economies (rounded to published values).
export const EPI_2024: ExternalIndex = {
  id: "epi-2024",
  label: "Yale Environmental Performance Index",
  year: 2024,
  source: "Yale Center for Environmental Law & Policy",
  url: "https://epi.yale.edu/",
  scores: {
    EST: 61.4, LUX: 75, DNK: 72.4, GBR: 67.6, FIN: 66.5, MLT: 65.9, SWE: 70.3,
    DEU: 62.4, FRA: 62.7, AUT: 66.5, CHE: 65.9, NOR: 66.9, ISL: 62.3, NLD: 65,
    JPN: 62.4, AUS: 60.2, ESP: 56.6, ITA: 58.9, PRT: 57, IRL: 57.4, BEL: 58.9,
    CAN: 50.4, USA: 57.9, NZL: 56.7, POL: 55.2, CZE: 59.9, GRC: 55.4, ROU: 56.9,
    KOR: 46.9, CHN: 39, IND: 27.6, BRA: 46.2, ZAF: 37.2, RUS: 38.7, IDN: 28.2,
    MEX: 45.5, TUR: 39.2, SAU: 37, ARE: 53.6, ARG: 49.7, CHL: 51.5, COL: 46.7,
    EGY: 35, NGA: 31.4, PAK: 27.2, BGD: 24, VNM: 32, THA: 35, KEN: 36,
  },
};

export const EXTERNAL_INDICES: ExternalIndex[] = [EPI_2024];
