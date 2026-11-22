import { getHistory } from '../api/mockApi';
import { TrendChart } from '../components/Charts.jsx';

export default function Reports() {
  const history = getHistory();
  return (
    <>
      <div>
        <h1>Reports</h1>
        <p className="sub">Monthly view for the general manager. Mock data; November is today's snapshot, so it matches the dashboard.</p>
      </div>
      <div className="grid2e">
        <div className="card"><h2>Share of units past their expected range (%)</h2><TrendChart data={history} dataKey="sharePastRange" color="#b4534a" domain={[20, 60]} suffix="%" /></div>
        <div className="card"><h2>Average days in stock</h2><TrendChart data={history} dataKey="avgDaysInStock" color="#1f2a44" domain={[30, 50]} /></div>
      </div>
      <div className="grid2e">
        <div className="card scroll">
          <h2>Model health (computed on hold-out data)</h2>
          <table>
            <thead><tr><th>Check</th><th>Value</th><th>Target</th></tr></thead>
            <tbody>
              <tr><td>Concordance index (C-index)</td><td>—</td><td>reported after training</td></tr>
              <tr><td>MAE on sold cars (days)</td><td>—</td><td>reported after training</td></tr>
              <tr><td>80% range coverage</td><td>—</td><td>close to 80%</td></tr>
              <tr><td>Alert precision (manager review)</td><td>—</td><td>reviewed each month</td></tr>
            </tbody>
          </table>
          <p className="note">No model results are shown because no model has been trained or tested yet.</p>
        </div>
        <div className="card">
          <h2>Export</h2>
          <p className="note" style={{ fontSize: 13 }}>Weekly ageing review: flagged cars, possible factors, actions and outcomes, grouped by owner.</p>
          <div className="row"><button className="btn" disabled title="Not part of the wireframe">Weekly review</button><button className="btn" disabled title="Not part of the wireframe">Acquisition lessons</button></div>
        </div>
      </div>
    </>
  );
}
