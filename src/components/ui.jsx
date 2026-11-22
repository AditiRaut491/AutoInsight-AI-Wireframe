// Small shared UI pieces.
import { pct } from '../lib/model';

export function StatusChip({ status }) {
  return <span className={`chip c-${status.replace(' ', '')}`}>{status}</span>;
}

export function Kpi({ label, value, detail, tone, small }) {
  return (
    <div className="card kpi">
      <div className="l">{label}</div>
      <div className="v" style={{ color: tone ? `var(--${tone})` : undefined, fontSize: small ? 20 : undefined }}>{value}</div>
      {detail && <div className="d">{detail}</div>}
    </div>
  );
}

export function PageHeader({ title, sub, children }) {
  return (
    <div className="spread">
      <div>
        {typeof title === 'string' ? <h1>{title}</h1> : title}
        {sub && <p className="sub">{sub}</p>}
      </div>
      {children && <div className="row">{children}</div>}
    </div>
  );
}

/** Horizontal bar row: label, bar, value. */
export function BarRow({ label, value, max, text, critical, columns = '170px minmax(0,1fr) 40px' }) {
  return (
    <div className="fun" style={{ gridTemplateColumns: columns }}>
      <span>{label}</span>
      <div className={`bar ${critical ? 'c' : ''}`}><i style={{ width: `${Math.min(100, (value / max) * 100)}%` }} /></div>
      {text !== undefined && <span className="n">{text}</span>}
    </div>
  );
}

export function RangeLegend() {
  return (
    <div className="legend">
      <span><i className="sw" style={{ background: 'var(--band)', border: '1px solid var(--bandline)' }} />expected 80% range</span>
      <span><i className="sw" style={{ background: 'var(--ink)', width: 3 }} />median</span>
      <span><i className="sw" style={{ background: 'var(--crit)', borderRadius: '50%', width: 10 }} />today</span>
    </div>
  );
}

export const unsold = (s) => `${pct(s)} still unsold`;
