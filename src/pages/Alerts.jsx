import { useNavigate } from 'react-router-dom';
import { listMarketShifts, listVehicles } from '../api/mockApi';
import { useAppState } from '../context/AppState.jsx';
import { pct } from '../lib/model';
import { PageHeader, StatusChip } from '../components/ui.jsx';

export default function Alerts() {
  const navigate = useNavigate();
  const { acknowledged, acknowledge } = useAppState();
  const cars = listVehicles();

  return (
    <>
      <PageHeader
        title="Alerts"
        sub="Critical and Alert = past the upper limit of the car's expected range (under 5% or 10% chance of still being unsold). Watch = still inside the range but close to its upper limit (under 25%)."
      />
      {['Critical', 'Alert', 'Watch'].map((g) => {
        const list = cars.filter((c) => c.status === g);
        return (
          <div className="card scroll" key={g}>
            <h2>{g} ({list.length})</h2>
            <table>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id}>
                    <td style={{ width: 110 }}><StatusChip status={c.status} /></td>
                    <td><b>{c.id}</b> {c.name}<br /><span className="note">Day {c.dom} vs expected {c.med} ({c.p10}–{c.p90}) · {c.top}</span></td>
                    <td className="n">{pct(c.s)} unsold</td>
                    <td className="n">
                      <button className="btn" onClick={() => navigate(`/vehicle/${c.id}`)}>View</button>{' '}
                      <button className="btn" onClick={() => acknowledge(c.id)} disabled={acknowledged[c.id]}>{acknowledged[c.id] ? 'Acknowledged' : 'Acknowledge'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
      <div className="card">
        <h2>Market shifts (cohort level)</h2>
        <table>
          <tbody>
            {listMarketShifts().map((m) => (
              <tr key={m.t}><td style={{ width: 110 }}><span className="tag">Market</span></td><td><b>{m.t}</b><br /><span className="note">{m.e}</span></td></tr>
            ))}
          </tbody>
        </table>
        <p className="note">When the whole cohort slows, the explanation says “the market moved” before blaming the car.</p>
      </div>
    </>
  );
}
