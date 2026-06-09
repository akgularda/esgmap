export function ScoreRing({
  value, size = 76, stroke = 7, color,
}: {
  value: number | null;
  size?: number;
  stroke?: number;
  color: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value || 0));
  const off = c * (1 - v / 100);
  return (
    <div style={{ position: "relative", width: size, height: size, flex: "0 0 auto" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2a322c" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset .6s cubic-bezier(.22,.61,.36,1), stroke .4s" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <div className="tnum" style={{ fontFamily: "var(--mono)", fontWeight: 600, fontSize: size * 0.3, lineHeight: 1 }}>
          {value == null ? "—" : Math.round(v)}
        </div>
      </div>
    </div>
  );
}
