/* ESGMap — figure export. Serialises a live <svg> to a standalone, self-attributing
 * SVG (vector, print-ready) and rasterises to high-res PNG. Colours already live as
 * inline attributes on the cloned nodes (the map/charts set fills imperatively), so
 * they travel with the figure; a Source/edition footer is appended for attribution. */
import { META } from "../data/esg";

const FONT = `@font-face{font-family:'IBM Plex Sans';}`;

function attributionText(): string {
  const srcs = META.sources.filter((s) => s.id !== "esgmap-curated").map((s) => s.label.split(" — ")[0]).join(", ");
  return `Source: ${srcs} · retrieved ${META.generatedAt} · ESGMap ${META.version} · CC BY 4.0`;
}

/** Serialise an SVG element to a standalone SVG string with a baked-in attribution footer. */
export function serializeSvg(svg: SVGSVGElement, opts: { title: string; lightBg?: boolean } = { title: "ESGMap figure" }): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const vb = svg.viewBox.baseVal;
  const w = vb && vb.width ? vb.width : svg.clientWidth || 800;
  const h = (vb && vb.height ? vb.height : svg.clientHeight || 500) + 26;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("viewBox", `0 0 ${w} ${h}`);
  clone.setAttribute("width", String(w));
  clone.setAttribute("height", String(h));

  // background + alt text
  const bg = opts.lightBg ? "#ffffff" : "#0c100e";
  const ns = "http://www.w3.org/2000/svg";
  const rect = document.createElementNS(ns, "rect");
  rect.setAttribute("x", "0"); rect.setAttribute("y", "0");
  rect.setAttribute("width", String(w)); rect.setAttribute("height", String(h));
  rect.setAttribute("fill", bg);
  clone.insertBefore(rect, clone.firstChild);
  const titleEl = document.createElementNS(ns, "title");
  titleEl.textContent = opts.title;
  clone.insertBefore(titleEl, clone.firstChild);

  // attribution footer
  const foot = document.createElementNS(ns, "text");
  foot.setAttribute("x", "6");
  foot.setAttribute("y", String(h - 8));
  foot.setAttribute("font-family", "IBM Plex Mono, monospace");
  foot.setAttribute("font-size", "10");
  foot.setAttribute("fill", opts.lightBg ? "#555" : "#8a948c");
  foot.textContent = attributionText();
  clone.appendChild(foot);

  const style = document.createElementNS(ns, "style");
  style.textContent = FONT;
  clone.insertBefore(style, clone.firstChild);

  return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadSvg(svg: SVGSVGElement, filename: string, opts?: { title: string; lightBg?: boolean }) {
  const str = serializeSvg(svg, opts);
  triggerDownload(new Blob([str], { type: "image/svg+xml" }), filename);
}

export async function downloadPng(svg: SVGSVGElement, filename: string, scale = 3, opts?: { title: string; lightBg?: boolean }) {
  const str = serializeSvg(svg, opts);
  const vb = svg.viewBox.baseVal;
  const w = (vb && vb.width ? vb.width : svg.clientWidth || 800);
  const h = (vb && vb.height ? vb.height : svg.clientHeight || 500) + 26;
  const img = new Image();
  const svgUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(str);
  await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = svgUrl; });
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  await new Promise<void>((res) => canvas.toBlob((b) => { if (b) triggerDownload(b, filename); res(); }, "image/png"));
}

/** Generic data download (CSV/JSON strings) from any view. */
export function downloadText(text: string, filename: string, mime = "text/csv") {
  triggerDownload(new Blob([text], { type: mime + ";charset=utf-8" }), filename);
}
