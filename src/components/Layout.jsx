import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AS_OF, STORE } from '../data/mockData';
import { listPastRange, listVehicles } from '../api/mockApi';
import { useAppState } from '../context/AppState.jsx';
import BrandMark from './BrandMark.jsx';

const NAV = [
  ['/dashboard', 'Dashboard'],
  ['/inventory', 'Inventory'],
  ['/alerts', 'Alerts'],
  ['/vehicle', 'Vehicle analysis'],
  ['/insights', 'Explainable insights'],
  ['/actions', 'Actions'],
  ['/holding-cost', 'Holding cost'],
  ['/what-if', 'What-if'],
  ['/reports', 'Reports'],
  ['/assistant', 'Ask AutoInsight'],
];

export default function Layout() {
  const { cost, lastCar } = useAppState();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [query, setQuery] = useState('');
  const [notFound, setNotFound] = useState(false);
  const flagged = listPastRange().length;

  const linkTarget = (to) => (['/vehicle', '/insights', '/what-if', '/holding-cost'].includes(to) ? `${to}/${lastCar}` : to);

  function onSearch(e) {
    e.preventDefault();
    const v = query.trim().toUpperCase();
    if (!v) return;
    const hit = listVehicles().find((c) => c.id === v || c.name.toUpperCase().includes(v));
    if (hit) {
      setNotFound(false);
      setQuery('');
      navigate(`/vehicle/${hit.id}`);
    } else {
      setNotFound(true);
    }
  }

  return (
    <div className="app">
      <aside className="side">
        <Link to="/dashboard" className="brand"><BrandMark />AutoInsight AI</Link>
        <div className="store">{STORE.name} · {STORE.department}<br />Demo store, {listVehicles().length} units</div>
        <nav className="nav" aria-label="Main">
          {NAV.map(([to, label]) => (
            <NavLink key={to} to={linkTarget(to)} className={({ isActive }) => (isActive || pathname.startsWith(`${to}/`) ? 'on' : '')}>
              {label}
              {to === '/alerts' && <span className="pill">{flagged}</span>}
              {to === '/assistant' && <span className="pill pill-soft">Proposed</span>}
            </NavLink>
          ))}
        </nav>
        <div className="foot">{STORE.user} · {STORE.role}<br /><Link to="/login">Sign out</Link></div>
      </aside>
      <div className="main">
        <div className="top">
          <form onSubmit={onSearch} className="search" role="search">
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setNotFound(false); }}
              placeholder="Search stock number or model, then press Enter"
              aria-label="Search inventory"
            />
            {notFound && <span className="note">No car matches “{query}”.</span>}
          </form>
          <span className="who">As of {AS_OF} · Holding cost ${cost}/day</span>
        </div>
        <div className="demo">Interactive wireframe with mock data. Numbers are illustrative; no live model or database is connected.</div>
        <main className="page">
          <Outlet />
        </main>
      </div>
      {!pathname.startsWith('/assistant') && (
        <Link to="/assistant" className="ask-fab" aria-label="Ask AutoInsight (proposed chatbot)">
          <span className="ask-dot" />Ask AutoInsight
        </Link>
      )}
    </div>
  );
}
