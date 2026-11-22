import { useEffect, useState } from 'react';
import { useVehicle } from '../lib/useVehicle';
import { quantileDay } from '../lib/model';
import SellingCurve from '../components/SellingCurve.jsx';
import NotFound from './NotFound.jsx';

// Relative effect of first-reply time on the "Leads" factor (current value = 1).
const LEAD_LEVELS = { '15m': 0, '1h': 0.3, '4h': 1, '6h': 1.4, '8h': 1.8 };
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

const currentInputs = (c) => {
  const leads = c.reasons.find((r) => r.k === 'Leads');
  const price = c.reasons.find((r) => r.k === 'Price');
  return {
    ph: c.photos,
    cp: c.comp,
    lr: leads ? (leads.response.startsWith('6') ? '6h' : '4h') : '1h',
    pp: price ? price.gap : 0,
  };
};

/**
 * Mock what-if: start from what similar cars usually take (c.med), then add each
 * factor's attributed days, scaled by how much the input changes. Factors the
 * dealer cannot change here (market, recon, availability) stay as they are.
 */
function estimate(c, w) {
  const base = currentInputs(c);
  return c.reasons.reduce((days, r) => {
    let scale = 1;
    if (r.k === 'Photos' && c.photos < c.photoMedian) scale = clamp((c.photoMedian - w.ph) / (c.photoMedian - c.photos), 0, 1.5);
    if (r.k === 'Listing' && c.comp < 90) scale = clamp((90 - w.cp) / (90 - c.comp), 0, 1.5);
    if (r.k === 'Leads') scale = LEAD_LEVELS[w.lr] / LEAD_LEVELS[base.lr];
    if (r.k === 'Price') scale = clamp(w.pp / r.gap, -0.5, 2);
    return days + r.d * scale;
  }, c.med);
}

export default function WhatIf() {
  const c = useVehicle();
  const [w, setW] = useState(null);
  const carId = c?.id;
  // Reset the controls whenever a different car is opened.
  useEffect(() => { if (c) setW(currentInputs(c)); }, [carId]);
  if (!c) return <NotFound what="vehicle" />;
  if (!w) return null;

  const now = Math.round(estimate(c, currentInputs(c)));
  const changed = Math.round(estimate(c, w));
  const set = (k) => (e) => setW({ ...w, [k]: k === 'lr' ? e.target.value : parseFloat(e.target.value) });

  return (
    <>
      <div>
        <h1>What-if: {c.id}</h1>
        <p className="sub">{c.name}. Similar cars usually sell in {c.med} days. Move a control to see how this car’s estimate could change.</p>
      </div>
      <div className="grid2e">
        <div className="card">
          <h2>Inputs</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            <label className="f">Real photos: <b style={{ color: 'var(--ink)' }}>{w.ph}</b> <span>(similar cars: {c.photoMedian})</span><input type="range" min="0" max="40" value={w.ph} onChange={set('ph')} /></label>
            <label className="f">Listing completeness: <b style={{ color: 'var(--ink)' }}>{w.cp}%</b><input type="range" min="40" max="100" value={w.cp} onChange={set('cp')} /></label>
            <label className="f">Median first reply to leads
              <select value={w.lr} onChange={set('lr')}>{Object.keys(LEAD_LEVELS).map((k) => <option key={k}>{k}</option>)}</select>
            </label>
            <label className="f">Price vs comparables (sensitivity only): <b style={{ color: 'var(--ink)' }}>{w.pp > 0 ? '+' : ''}{w.pp}%</b><input type="range" min="-10" max="10" value={w.pp} onChange={set('pp')} /></label>
            <button className="btn" onClick={() => setW(currentInputs(c))}>Reset to today's inputs</button>
          </div>
        </div>
        <div className="card">
          <h2>Estimate (mock)</h2>
          <div className="kpis">
            <div><div className="note">Similar cars</div><div className="big">{c.med}</div></div>
            <div><div className="note">This car, today’s listing</div><div className="big" style={{ color: now > c.p90 ? 'var(--crit)' : undefined }}>{now}</div></div>
            <div><div className="note">With these changes</div><div className="big" style={{ color: 'var(--ok)' }}>{changed}</div></div>
          </div>
          <SellingCurve car={{ ...c, p10: quantileDay(0.9, c.med), p90: quantileDay(0.1, c.med) }} alt={changed} />
          <div className="legend">
            <span><i className="sw" style={{ background: 'var(--ink)', height: 3 }} />similar cars</span>
            <span><i className="sw" style={{ background: 'var(--ok)', height: 3 }} />this car with changes</span>
          </div>
          {!c.reasons.length && <p className="note">This car has no contributing factors, so the inputs don’t change its estimate.</p>}
          <p className="note">Mock formula: similar cars’ expectation plus each factor’s attributed days, scaled by the change. A working prototype would re-score the trained model. Associations, not guarantees; the tool never recommends a price.</p>
        </div>
      </div>
    </>
  );
}
