/* ESGMap — tiny inline icon set (stroke, 1.6). No external icon library. */
import type { CSSProperties } from "react";

const PATHS: Record<string, string> = {
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
};

export interface IconProps {
  name: keyof typeof PATHS | string;
  size?: number;
  style?: CSSProperties;
}

export function Icon({ name, size = 18, style }: IconProps) {
  const p = PATHS[name] || "";
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
      style={style} aria-hidden="true"
    >
      {p.split("M").filter(Boolean).map((seg, i) => (
        <path key={i} d={"M" + seg} />
      ))}
    </svg>
  );
}
