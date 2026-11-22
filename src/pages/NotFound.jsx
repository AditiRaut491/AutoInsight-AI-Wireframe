import { Link } from 'react-router-dom';

export default function NotFound({ what = 'page' }) {
  return (
    <div className="card" style={{ maxWidth: 520 }}>
      <h2>We couldn't find that {what}.</h2>
      <p className="note" style={{ fontSize: 13 }}>It may not exist in the mock data. Go back to the <Link to="/dashboard">dashboard</Link> or the <Link to="/inventory">inventory list</Link>.</p>
    </div>
  );
}
