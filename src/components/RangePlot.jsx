import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STATUS_COLOR = { Critical: 'var(--crit)', Alert: 'var(--alert)', Watch: 'var(--watch)', 'On track': 'var(--ok)' };

/** Every car's expected 80% range (band), median (tick) and today's days on market (dot). */
export default function RangePlot({ vehicles }) {
  const navigate = useNavigate();
  const ref = useRef(null);
  const [narrow, setNarrow] = useState(false);

  // On small screens use a narrower drawing so labels stay readable.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([entry]) => setNarrow(entry.contentRect.width < 560));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const W = narrow ? 440 : 760;
  const left = narrow ? 128 : 210;
  const rowH = narrow ? 28 : 31;
  const top = 30, right = 16, maxD = 70;
  const H = top + vehicles.length * rowH + 30;
  const X = (d) => left + (Math.min(d, maxD) / maxD) * (W - left - right);
  const ticks = [];
  for (let d = 0; d <= maxD; d += narrow ? 20 : 10) ticks.push(d);
  const label = (c) => (narrow ? `${c.id} ${c.model}` : `${c.id} · ${`${c.make} ${c.model} ${c.trim}`.slice(0, 22)}`);

  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Each car against its expected days-to-sell range">
        {ticks.map((d) => (
          <g key={d}>
            <line x1={X(d)} x2={X(d)} y1={top - 6} y2={H - 26} stroke="var(--line)" />
            <text x={X(d)} y={H - 10} textAnchor="middle" fontSize="12" fill="var(--muted)">{d}</text>
          </g>
        ))}
        <text x={W - right} y="16" textAnchor="end" fontSize="12" fill="var(--muted)">days on market</text>
        {vehicles.map((c, i) => {
          const y = top + i * rowH + rowH / 2;
          return (
            <g key={c.id} className="rp" onClick={() => navigate(`/vehicle/${c.id}`)} role="link" aria-label={`Open ${c.id}`}>
              <rect x="0" y={y - rowH / 2} width={W} height={rowH} fill="transparent" />
              <text x="4" y={y + 4} fontSize={narrow ? 13 : 12} fill="var(--ink)">{label(c)}</text>
              <rect x={X(c.p10)} y={y - 6} width={X(c.p90) - X(c.p10)} height="12" rx="3" fill="var(--band)" stroke="var(--bandline)" strokeWidth=".8" />
              <line x1={X(c.med)} x2={X(c.med)} y1={y - 8} y2={y + 8} stroke="var(--ink)" strokeWidth="2" />
              <circle cx={X(c.dom)} cy={y} r="6" fill={STATUS_COLOR[c.status]} stroke="var(--panel)" strokeWidth="2" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
