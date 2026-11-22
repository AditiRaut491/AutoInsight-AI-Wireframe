import { useNavigate } from 'react-router-dom';
import { listVehicles } from '../api/mockApi';
import { useAppState } from '../context/AppState.jsx';
import { useVehicle } from '../lib/useVehicle';
import { usd } from '../lib/model';
import { StatusChip } from '../components/ui.jsx';
import NotFound from './NotFound.jsx';

function NumberField({ label, value, onChange, step }) {
  return (
    <label className="f">
      {label}
      <input
        type="number"
        min="0"
        step={step}
        defaultValue={value}
        onChange={(e) => { const v = parseFloat(e.target.value); if (!Number.isNaN(v) && v >= 0) onChange(v); }}
      />
    </label>
  );
}

export default function HoldingCost() {
  const c = useVehicle();
  const navigate = useNavigate();
  const { cost, setCost, dep, setDep, gross, setGross } = useAppState();
  if (!c) return <NotFound what="vehicle" />;

  const d = dep / 100;
  const rows = listVehicles()
    .map((x) => { const hold = x.stock * cost; const depr = (x.price * d * x.stock) / 30; return { x, hold, depr, left: gross - hold - depr }; })
    .sort((a, b) => a.left - b.left);

  const W = 520, H = 220, l = 56, r = 16, t = 16, b = 30, maxD = 90;
  const g = (day) => gross - day * cost - (c.price * d * day) / 30;
  const lo = Math.min(g(maxD), -1000);
  const X = (day) => l + (day / maxD) * (W - l - r);
  const Y = (v) => t + ((gross - v) / (gross - lo || 1)) * (H - t - b);
  const breakEven = gross / (cost + (c.price * d) / 30);

  return (
    <>
      <div>
        <h1>Holding cost: what waiting costs</h1>
        <p className="sub">Uses your dealership's own daily figure. $37/day is only a default: an estimate from a US dealer study (NCM Associates, cited by Wards).</p>
      </div>
      <div className="grid2e">
        <div className="card">
          <h2>Assumptions</h2>
          <div className="kpis">
            <NumberField label="Holding cost per car per day ($)" value={cost} onChange={setCost} step="1" />
            <NumberField label="Depreciation per 30 days (%)" value={dep} onChange={setDep} step="0.1" />
            <NumberField label="Expected front gross per car ($)" value={gross} onChange={setGross} step="100" />
          </div>
          <p className="note">Change a value; every table, chart and chatbot answer updates.</p>
        </div>
        <div className="card">
          <h2>{c.id}: front gross left over time</h2>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Front gross left by day">
            <line x1={l} x2={W - r} y1={Y(0)} y2={Y(0)} stroke="var(--ink)" />
            <text x={l - 6} y={Y(0) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">$0</text>
            <text x={l - 6} y={Y(gross) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">{usd(gross)}</text>
            {[0, 30, 60, 90].map((day) => <text key={day} x={X(day)} y={H - 10} textAnchor="middle" fontSize="11" fill="var(--muted)">day {day}</text>)}
            <path d={`M${X(0)} ${Y(g(0))}L${X(maxD)} ${Y(g(maxD))}`} stroke="var(--crit)" strokeWidth="2.2" fill="none" />
            <circle cx={X(c.stock)} cy={Y(g(c.stock))} r="6" fill="var(--crit)" stroke="var(--panel)" strokeWidth="2" />
            <text x={X(c.stock) + 8} y={Y(g(c.stock)) - 8} fontSize="12" fontWeight="600" fill="var(--crit)">today: {usd(g(c.stock))}</text>
            {breakEven < maxD && (
              <>
                <line x1={X(breakEven)} x2={X(breakEven)} y1={t} y2={H - b} stroke="var(--muted)" strokeDasharray="3 3" />
                <text x={X(breakEven) - 6} y={t + 12} textAnchor="end" fontSize="11" fill="var(--muted)">gross gone ~day {Math.round(breakEven)}</text>
              </>
            )}
          </svg>
        </div>
      </div>
      <div className="card scroll">
        <h2>Gross left by car (lowest first)</h2>
        <table>
          <thead><tr><th>Car</th><th>Status</th><th className="n">Days in stock</th><th className="n">Holding cost</th><th className="n">Depreciation</th><th className="n">Gross left</th></tr></thead>
          <tbody>
            {rows.map(({ x, hold, depr, left }) => (
              <tr key={x.id} className="go" onClick={() => navigate(`/vehicle/${x.id}`)}>
                <td><b>{x.id}</b> {x.name}</td>
                <td><StatusChip status={x.status} /></td>
                <td className="n">{x.stock}</td>
                <td className="n">{usd(hold)}</td>
                <td className="n">{usd(depr)}</td>
                <td className="n" style={{ color: left < 0 ? 'var(--crit)' : 'inherit', fontWeight: 600 }}>{usd(left)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
