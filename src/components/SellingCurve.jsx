import { survival, pct } from '../lib/model';

/**
 * Chance the car is still unsold by day (solid), sold comparables (dashed),
 * expected 80% range (shaded) and today's position (red dot).
 * `alt` draws a second curve for a what-if scenario.
 */
export default function SellingCurve({ car, alt }) {
  const W = 520, H = 250, l = 44, r = 16, t = 16, b = 34, maxD = 80;
  const X = (d) => l + (d / maxD) * (W - l - r);
  const Y = (p) => t + (1 - p) * (H - t - b);

  let km = '';
  let prev = 1;
  for (let d = 0; d <= maxD; d += 4) {
    const v = survival(d, car.med * 1.04);
    km += `${d ? 'L' : 'M'}${X(d)} ${Y(prev)}L${X(d)} ${Y(v)}`;
    prev = v;
  }
  const curve = (m) => Array.from({ length: maxD + 1 }, (_, d) => `${d ? 'L' : 'M'}${X(d)} ${Y(survival(d, m))}`).join('');
  const sv = survival(car.dom, car.med);
  const labelLeft = X(car.dom) > W - 190;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Probability the car is still unsold by day">
      {[0, 0.25, 0.5, 0.75, 1].map((p) => (
        <g key={p}>
          <line x1={l} x2={W - r} y1={Y(p)} y2={Y(p)} stroke="var(--line)" />
          <text x={l - 6} y={Y(p) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">{pct(p)}</text>
        </g>
      ))}
      {[0, 20, 40, 60, 80].map((d) => (
        <text key={d} x={X(d)} y={H - 12} textAnchor="middle" fontSize="11" fill="var(--muted)">{d}</text>
      ))}
      <rect x={X(car.p10)} y={t} width={X(car.p90) - X(car.p10)} height={H - t - b} fill="var(--band)" opacity=".35" />
      <path d={km} fill="none" stroke="var(--muted)" strokeDasharray="4 3" strokeWidth="1.4" />
      <path d={curve(car.med)} fill="none" stroke="var(--ink)" strokeWidth="2.2" />
      {alt && <path d={curve(alt)} fill="none" stroke="var(--ok)" strokeWidth="2.2" />}
      <line x1={X(car.dom)} x2={X(car.dom)} y1={t} y2={H - b} stroke="var(--crit)" strokeDasharray="3 3" />
      <circle cx={X(car.dom)} cy={Y(sv)} r="6" fill="var(--crit)" stroke="var(--panel)" strokeWidth="2" />
      <text
        x={labelLeft ? X(car.dom) - 10 : X(car.dom) + 8}
        y={Y(sv) - 12}
        textAnchor={labelLeft ? 'end' : 'start'}
        fontSize="12"
        fontWeight="600"
        fill="var(--crit)"
        style={{ paintOrder: 'stroke', stroke: 'var(--panel)', strokeWidth: 4 }}
      >
        Day {car.dom}: {pct(sv)} still unsold
      </text>
      <text x={X(car.med) + 6} y={t + 14} fontSize="11" fill="var(--muted)">expected {car.med} d</text>
    </svg>
  );
}
