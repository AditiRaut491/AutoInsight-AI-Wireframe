import { Link } from 'react-router-dom';
import { getVehicle } from '../api/mockApi';
import { useAppState } from '../context/AppState.jsx';
import { PageHeader } from '../components/ui.jsx';

const COLUMNS = ['Recommended', 'In progress', 'Done'];

export default function Actions() {
  const { actions, advanceAction } = useAppState();
  return (
    <>
      <PageHeader title="Actions" sub="Every action is tied to a possible factor and an owner, and its outcome is tracked." />
      <div className="kan">
        {COLUMNS.map((h, i) => {
          const list = actions.filter((a) => a.col === i);
          return (
            <div className="col" key={h}>
              <h3>{h} ({list.length})</h3>
              {list.map((a) => (
                <div className="act" key={a.id}>
                  <div className="t">{a.a}</div>
                  <div className="note"><Link to={`/vehicle/${a.car}`}><b>{a.car}</b></Link> · {getVehicle(a.car)?.name}</div>
                  <div className="note">Because: {a.r}</div>
                  <div className="row">
                    <span className="tag">{a.o}</span><span className="tag">Due {a.due}</span>
                    {i < 2 && <button className="btn" onClick={() => advanceAction(a.id)}>{i === 0 ? 'Start' : 'Mark done'}</button>}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <div className="card scroll">
        <h2>Did it work? (filled as outcomes arrive)</h2>
        <table>
          <thead><tr><th>Action type</th><th className="n">Done</th><th className="n">Sold within new expectation</th><th>Read</th></tr></thead>
          <tbody>
            <tr><td>Photo reshoot</td><td className="n">3</td><td className="n">—</td><td className="note">Needs 30+ completed actions before showing a rate</td></tr>
            <tr><td>Lead reassignment</td><td className="n">2</td><td className="n">—</td><td className="note">Compared with matched cars without the action</td></tr>
            <tr><td>Listing completion</td><td className="n">4</td><td className="n">—</td><td className="note">Observational, not a controlled test</td></tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
