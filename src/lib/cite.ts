/* ESGMap — citation string builders (BibTeX / RIS / APA).
 *
 * Assembles a correct, copy-paste citation from the dataset metadata already in
 * the bundle, crediting ESGMap and naming the upstream sources + retrieval date. */
import { META } from "../data/esg";
import type { CountryRecord } from "../types";

const AUTHOR = "ESGMap contributors";
const TITLE = "ESGMap — Global Sustainability Atlas";
const YEAR = () => META.generatedAt.slice(0, 4);

export type CiteFormat = "bibtex" | "ris" | "apa";

function note(country?: CountryRecord | null): string {
  return country
    ? `Indicator values for ${country.name}. `
    : "";
}

export function citation(format: CiteFormat, url: string, country?: CountryRecord | null): string {
  const accessed = META.generatedAt;
  const ver = META.version;
  const srcLine = META.sources.map((s) => `${s.label} (retrieved ${s.retrievedAt})`).join("; ");

  if (format === "bibtex") {
    const key = `esgmap${YEAR()}${country ? country.iso3 : ""}`;
    return [
      `@misc{${key},`,
      `  author       = {{${AUTHOR}}},`,
      `  title        = {{${TITLE}}},`,
      `  year         = {${YEAR()}},`,
      `  version      = {${ver}},`,
      `  howpublished = {\\url{${url}}},`,
      `  note         = {${note(country)}Edition ${META.yearMax}. Underlying sources: ${srcLine}. Accessed ${accessed}.}`,
      `}`,
    ].join("\n");
  }
  if (format === "ris") {
    return [
      "TY  - DATA",
      `AU  - ${AUTHOR}`,
      `TI  - ${TITLE}${country ? " — " + country.name : ""}`,
      `PY  - ${YEAR()}`,
      `ET  - ${ver} (edition ${META.yearMax})`,
      `UR  - ${url}`,
      `N1  - ${note(country)}Underlying sources: ${srcLine}.`,
      `Y2  - ${accessed}`,
      "ER  - ",
    ].join("\n");
  }
  // APA 7
  return `${AUTHOR}. (${YEAR()}). ${TITLE} (Version ${ver}) [Data set]. ${note(country)}Retrieved ${accessed}, from ${url}`;
}

/** Per-source attribution block (for the "copy attribution" buttons). */
export function attributionBlock(): string {
  return META.sources
    .map((s) => `${s.label} — ${s.license} (retrieved ${s.retrievedAt}). ${s.url}`)
    .join("\n");
}
