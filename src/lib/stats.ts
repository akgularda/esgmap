/* ESGMap — small statistics helpers for the rigor / validation view. */

export function pearson(a: number[], b: number[]): number | null {
  const n = a.length;
  if (n < 3) return null;
  const ma = a.reduce((s, x) => s + x, 0) / n;
  const mb = b.reduce((s, x) => s + x, 0) / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) { const x = a[i] - ma, y = b[i] - mb; num += x * y; da += x * x; db += y * y; }
  const den = Math.sqrt(da * db);
  return den === 0 ? null : num / den;
}

function ranks(v: number[]): number[] {
  const idx = v.map((x, i) => [x, i] as [number, number]).sort((p, q) => p[0] - q[0]);
  const r = new Array(v.length).fill(0);
  let i = 0;
  while (i < idx.length) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
    const avg = (i + j) / 2 + 1; // average rank for ties (1-based)
    for (let k = i; k <= j; k++) r[idx[k][1]] = avg;
    i = j + 1;
  }
  return r;
}

export function spearman(a: number[], b: number[]): number | null {
  if (a.length < 3) return null;
  return pearson(ranks(a), ranks(b));
}

/** Pair two metric arrays over indices where BOTH are non-null. */
export function pairwise<T>(items: T[], fa: (t: T) => number | null, fb: (t: T) => number | null): [number[], number[]] {
  const a: number[] = [], b: number[] = [];
  for (const it of items) {
    const x = fa(it), y = fb(it);
    if (x != null && y != null) { a.push(x); b.push(y); }
  }
  return [a, b];
}
