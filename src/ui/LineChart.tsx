export interface LineSeries {
  years: number[];
  values: (number | null)[];
  color: string;
  label?: string;
}

export function LineChart({
  series, width = 320, height = 120, yMax, yMin = 0,
}: {
  series: LineSeries[];
  width?: number;
  height?: number;
  yMax?: number;
  yMin?: number;
}) {
  const pad = { t: 10, r: 8, b: 20, l: 34 };
  const w = width, h = height;
  const innerW = w - pad.l - pad.r, innerH = h - pad.t - pad.b;
  const allVals = series.flatMap((s) => s.values).filter((v): v is number => v != null);
  const max = yMax != null ? yMax : Math.max(10, Math.ceil(Math.max(10, ...allVals) / 10) * 10);
  const min = yMin;
  const years = series[0].years;
  const x = (i: number) => pad.l + (i / (years.length - 1)) * innerW;
  const y = (v: number) => pad.t + innerH - ((v - min) / (max - min)) * innerH;
  const gridY = [0, 0.25, 0.5, 0.75, 1].map((f) => min + (max - min) * f);

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      {gridY.map((gv, i) => (
        <g key={i}>
          <line x1={pad.l} x2={w - pad.r} y1={y(gv)} y2={y(gv)} stroke="#222a25" strokeWidth={1} />
          <text x={pad.l - 6} y={y(gv) + 3} textAnchor="end" fontSize={9} fill="#717b73" fontFamily="var(--mono)">{Math.round(gv)}</text>
        </g>
      ))}
      {[0, years.length - 1].map((i, k) => (
        <text key={k} x={x(i)} y={h - 6} textAnchor={k === 0 ? "start" : "end"} fontSize={9} fill="#717b73" fontFamily="var(--mono)">{years[i]}</text>
      ))}
      {series.map((s, si) => {
        // build the path over the defined (non-null) points, starting a fresh
        // sub-path after any gap so missing years don't draw a flat false line.
        let d = "";
        let started = false;
        let lastI = -1, lastV: number | null = null;
        s.values.forEach((v, i) => {
          if (v == null) { started = false; return; }
          d += `${started ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)} `;
          started = true;
          lastI = i; lastV = v;
        });
        const firstI = s.values.findIndex((v) => v != null);
        const single = series.length === 1 && firstI >= 0 && lastV != null;
        const area = single
          ? d + `L${x(lastI).toFixed(1)},${y(min)} L${x(firstI).toFixed(1)},${y(min)} Z`
          : "";
        return (
          <g key={si}>
            {single && <path d={area} fill={s.color} opacity={0.1} />}
            <path d={d.trim()} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {lastV != null && <circle cx={x(lastI)} cy={y(lastV)} r={3} fill={s.color} stroke="#131815" strokeWidth={1.5} />}
          </g>
        );
      })}
    </svg>
  );
}
