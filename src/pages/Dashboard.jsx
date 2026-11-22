import { useNavigate } from 'react-router-dom';
import { getAgeingDistribution, getFactorCounts, getInventorySummary, getPriorityQueue, listVehicles } from '../api/mockApi';
import { useAppState } from '../context/AppState.jsx';
import { usd } from '../lib/model';
import { AgeingChart } from '../components/Charts.jsx';
import RangePlot from '../components/RangePlot.jsx';
import { BarRow, Kpi, PageHeader, RangeLegend, StatusChip } from '../components/ui.jsx';

export default function Dashboard() {
  const { cost } = useAppState();
  const navigate = useNavigate();
  const s = getInventorySummary(cost);
  const sorted = [...listVehicles()].sort((a, b) => b.dom / b.med - a.dom / a.med);
  const queue = getPriorityQueue(cost);
  const factors = getFactorCounts();
  const fmax = Math.max(...factors.map((f) => f.n));

  return (
    <>
      <PageHeader title={`${s.pastRange} cars are past their expected days to sell`} sub="Each car is compared with its own predicted range, not a fixed 60-day rule.">
        <button className="btn pri" onClick={() => navigate('/alerts')}>Review alerts</button>
      </PageHeader>

      <div className="kpis">
        <Kpi label="Used units in stock" value={s.total} detail="demo store" />
        <Kpi label="Average days in stock" value={Math.round(s.avgDaysInStock)} detail="includes recon" />
        <Kpi label="Past expected range" value={s.pastRange} detail={`${s.critical} Critical + ${s.alert} Alert`} tone="crit" />
        <Kpi label="Cost so far on flagged cars" value={usd(s.costSoFarFlagged)} detail={`at $${cost}/day`} />
        <Kpi label="Holding cost, all units" value={usd(s.holdingCostPerDay)} detail="per day" />
      </div>

      <div className="grid2">
        <div className="card">
          <div className="spread"><h2>Every car against its own expected range</h2><RangeLegend /></div>
          <RangePlot vehicles={sorted} />
          <p className="note">Click a car to open its analysis. Sorted by how far past its expectation it is.</p>
        </div>
        <div className="card">
          <h2>Priority queue: cost of waiting</h2>
          <table>
            <thead><tr><th>Car</th><th>Status</th><th className="n">Cost at risk</th></tr></thead>
            <tbody>
              {queue.map(({ v, risk }) => (
                <tr key={v.id} className="go" onClick={() => navigate(`/vehicle/${v.id}`)}>
                  <td style={{ whiteSpace: 'nowrap' }}><b>{v.id}</b> <span className="note">{v.short}</span></td>
                  <td><StatusChip status={v.status} /></td>
                  <td className="n">{usd(risk)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="note queue-note">Cost at risk = (1 − chance still unsold) × (days in stock + 14) × daily cost.</p>
        </div>
      </div>

      <div className="grid2e">
        <div className="card">
          <h2>Inventory ageing (days in stock)</h2>
          <AgeingChart data={getAgeingDistribution()} />
          <div className="legend">
            <span><i className="sw" style={{ background: 'var(--band)', border: '1px solid var(--bandline)' }} />within expected range</span>
            <span><i className="sw" style={{ background: 'var(--crit)' }} />past expected range</span>
          </div>
        </div>
        <div className="card">
          <h2>Possible factors behind slow cars</h2>
          {factors.map((f) => <BarRow key={f.k} label={f.label} value={f.n} max={fmax} text={f.n} columns="190px minmax(0,1fr) 30px" />)}
          <p className="note">Count of cars where each factor appears. Associations, not proven causes.</p>
        </div>
      </div>
    </>
  );
}
