import { useNavigate } from 'react-router-dom';
import { FUNNEL, NEXT_STEP } from '../data/mockData';
import { useAppState } from '../context/AppState.jsx';
import { useVehicle } from '../lib/useVehicle';
import { fmt, pct, usd } from '../lib/model';
import SellingCurve from '../components/SellingCurve.jsx';
import { Kpi, StatusChip } from '../components/ui.jsx';
import NotFound from './NotFound.jsx';

export default function Vehicle() {
  const car = useVehicle();
  const navigate = useNavigate();
  const { cost, actions } = useAppState();
  if (!car) return <NotFound what="vehicle" />;

  const acts = actions.filter((a) => a.car === car.id && a.col < 2);
  const funnel = FUNNEL[car.id];

  return (
    <>
      <div className="spread">
        <div>
          <div className="row"><h1>{car.name}</h1><StatusChip status={car.status} /></div>
          <p className="sub">Stock {car.id} · {fmt(car.mi)} mi · listed at {usd(car.price)} · {car.seg}</p>
        </div>
        <div className="row vehicle-buttons">
          <button className="btn" onClick={() => navigate(`/insights/${car.id}`)}>Why? Full explanation</button>
          <button className="btn" onClick={() => navigate(`/what-if/${car.id}`)}>What-if</button>
          <button className="btn pri" onClick={() => navigate('/actions')}>Assign actions</button>
        </div>
      </div>

      <div className="kpis kpis-vehicle">
        <Kpi label="Days on market" value={car.dom} detail="since frontline-ready" tone={car.dom > car.p90 ? 'crit' : undefined} />
        <Kpi label="Expected days to sell" value={car.med} detail={`80% range ${car.p10}–${car.p90} days`} />
        <Kpi label={`Chance still unsold at day ${car.dom}`} value={pct(car.s)} detail="alert below 10%" />
        <Kpi label="Cost so far" value={usd(car.stock * cost)} detail={`${car.stock} days in stock incl. ${car.recon} recon`} />
        <Kpi label="Confidence" value={car.conf} detail={`${car.n} comparables · data ${car.comp}% complete`} small />
      </div>

      <div className="card">
        <h2>Possible contributing factors</h2>
        {car.reasons.length ? (
          <div className="rgrid">
            {car.reasons.map((r, i) => (
              <div className="reason" key={r.k}>
                <div className="t"><span>{i + 1}. {r.t}</span><span className="days">+{r.d} days</span></div>
                <div className="e">{r.e}</div>
                <div className="nx">Next: {NEXT_STEP[r.k]}</div>
                <div className="row"><span className="tag">Confidence {r.c}</span><span className="tag">{r.k}</span></div>
              </div>
            ))}
          </div>
        ) : <p className="note">Within its expected range: no factors to show.</p>}
        <p className="note">Days = model attribution: an association, not a proven cause. Suggestions, not guarantees.</p>
      </div>

      <div className="grid2e">
        <div className="card">
          <h2>Selling curve: this car vs comparables</h2>
          <SellingCurve car={car} />
          <div className="legend">
            <span><i className="sw" style={{ background: 'var(--ink)', height: 3 }} />expected (model, similar cars)</span>
            <span><i className="sw" style={{ borderTop: '2px dashed var(--muted)', height: 0 }} />{car.n} sold comparables</span>
            <span><i className="sw" style={{ background: 'var(--band)' }} />expected 80% range</span>
          </div>
        </div>
        <div className="card">
          <h2>Recommended actions</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {acts.length ? acts.map((a) => (
              <div className="act" key={a.id}>
                <div className="t">{a.a}</div>
                <div className="note">Because: {a.r} · Owner: {a.o} · Due: {a.due}</div>
              </div>
            )) : <p className="note">No open actions for this car.</p>}
          </div>
          <p className="note">AutoInsight AI flags the price gap but never sets the price.</p>
        </div>
      </div>

      <div className="card">
        <h2>Where buyers drop off (vs cohort median)</h2>
        {funnel ? (
          <>
            <div className="fun" style={{ fontWeight: 600, color: 'var(--muted)' }}><span>Stage</span><span /><span className="n">This car</span><span className="n">Cohort</span></div>
            {funnel.map((f, i) => (
              <div className="fun" key={f[0]}>
                <span>{f[0]}</span>
                <div className={`bar ${i > 0 ? 'c' : ''}`}><i style={{ width: `${Math.min(100, f[3] * 100)}%` }} /></div>
                <span className="n">{f[1]}</span>
                <span className="n">{f[2]}</span>
              </div>
            ))}
            <p className="note">Mock funnel data. Weakest stages are compared with similar cars, not with a fixed target.</p>
          </>
        ) : <p className="note">Funnel data is not available for this car in the mock dataset.</p>}
      </div>
    </>
  );
}
