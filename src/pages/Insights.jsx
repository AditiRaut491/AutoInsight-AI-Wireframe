import { FUNNEL_STAGES } from '../data/mockData';
import { useVehicle } from '../lib/useVehicle';
import { BarRow } from '../components/ui.jsx';
import NotFound from './NotFound.jsx';

const STORE_DRIVERS = [
  ['Price vs comparables', 100], ['Model, year, mileage', 86], ['Photo count and quality', 61],
  ['Local supply (market days)', 55], ['Lead response time', 44], ['Listing completeness', 38], ['Days in recon', 27],
];

export default function Insights() {
  const c = useVehicle();
  if (!c) return <NotFound what="vehicle" />;
  const total = c.reasons.reduce((a, r) => a + r.d, 0);
  const stages = FUNNEL_STAGES[c.id];

  return (
    <>
      <div>
        <h1>Why {c.id} might be slower than expected</h1>
        <p className="sub">{c.name} · comparable cars usually sell in {c.med} days ({c.p10}–{c.p90}). It is at day {c.dom} on market.</p>
      </div>
      <div className="grid2e">
        <div className="card">
          <h2>Possible contributing factors (model attribution, days)</h2>
          {c.reasons.length ? (
            <>
              <div className="scroll">
                <table>
                  <thead><tr><th>Factor</th><th>Evidence</th><th className="n">Adds</th><th>Confidence</th></tr></thead>
                  <tbody>
                    {c.reasons.map((r) => (
                      <tr key={r.k}>
                        <td><b>{r.t}</b></td>
                        <td className="note" style={{ fontSize: 13 }}>{r.e}</td>
                        <td className="n" style={{ color: 'var(--crit)' }}>+{r.d} d</td>
                        <td><span className="tag">{r.c}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 12 }}>
                {c.reasons.map((r) => <BarRow key={r.k} label={r.t} value={r.d} max={10} text={`+${r.d} d`} critical columns="190px minmax(0,1fr) 50px" />)}
              </div>
              <p className="note">Together these factors are associated with about {total} extra days compared with similar cars.</p>
            </>
          ) : <p className="note">This car is within its expected range; no contributing factors are shown.</p>}
          <p className="note">Method (planned): SHAP values from the selling-time model, plus listing and lead checks against {c.n} comparable cars.</p>
          <h2 style={{ marginTop: 14 }}>How to read this</h2>
          <p className="note" style={{ fontSize: 13 }}>
            Attributions show what the model associates with longer selling times. They are not proven causes.
            Confidence is {c.conf} because the range is {c.p90 - c.p10} days wide, there are {c.n} comparables and the listing data is {c.comp}% complete.
          </p>
        </div>
        <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          <div className="card">
            <h2>Funnel stage diagnosis</h2>
            {stages ? (
              <>
                <div className="stage">{stages.map((s) => <div key={s[0]} className={s[2] ? 'weak' : ''}>{s[0]}<b>{s[1]}</b></div>)}</div>
                <p className="note">Highlighted stages are below the cohort's 25th percentile (mock data).</p>
              </>
            ) : <p className="note">Funnel data is not available for this car in the mock dataset.</p>}
          </div>
          <div className="card">
            <h2>What drives days to sell across the store</h2>
            {STORE_DRIVERS.map((g) => <BarRow key={g[0]} label={g[0]} value={g[1]} max={100} columns="190px minmax(0,1fr)" />)}
            <p className="note">Relative mean |SHAP| (mock values for the wireframe).</p>
          </div>
        </div>
      </div>
    </>
  );
}
