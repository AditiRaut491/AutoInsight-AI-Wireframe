import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listVehicles } from '../api/mockApi';
import { useAppState } from '../context/AppState.jsx';
import { fmt, STATUS_ORDER, usd } from '../lib/model';
import { PageHeader, StatusChip } from '../components/ui.jsx';

const FILTERS = ['All', 'Critical', 'Alert', 'Watch', 'On track'];

export default function Inventory() {
  const { cost } = useAppState();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const all = listVehicles();
  const list = all
    .filter((c) => filter === 'All' || c.status === filter)
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || b.dom - a.dom);

  return (
    <>
      <PageHeader title="Used inventory" sub={`${all.length} units · expected days from the (mock) selling-time model · range = 80% interval`}>
        <div className="filters" role="group" aria-label="Filter by status">
          {FILTERS.map((f) => (
            <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)} aria-pressed={filter === f}>{f}</button>
          ))}
        </div>
      </PageHeader>
      <div className="card scroll">
        <table>
          <thead>
            <tr>
              <th>Stock</th><th>Vehicle</th><th>Segment</th><th className="n">Price</th><th className="n">Days on market</th>
              <th className="n">Days in stock</th><th className="n">Expected (range)</th><th>Status</th><th>Top factor</th>
              <th className="n">Cost so far</th><th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="go" onClick={() => navigate(`/vehicle/${c.id}`)}>
                <td><b>{c.id}</b></td>
                <td>{c.name}<br /><span className="note">{fmt(c.mi)} mi</span></td>
                <td>{c.seg}</td>
                <td className="n">{usd(c.price)}</td>
                <td className="n"><b>{c.dom}</b></td>
                <td className="n">{c.stock}</td>
                <td className="n">{c.med} ({c.p10}–{c.p90})</td>
                <td><StatusChip status={c.status} /></td>
                <td>{c.top}</td>
                <td className="n">{usd(c.stock * cost)}</td>
                <td><span className="tag">{c.conf} · n={c.n}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="note">No cars with this status.</p>}
      </div>
      <p className="note">Days on market counts from when the car was ready for sale. Days in stock also includes reconditioning.</p>
    </>
  );
}
