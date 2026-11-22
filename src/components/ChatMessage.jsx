import { Link } from 'react-router-dom';
import { MiniBars } from './Charts.jsx';
import { StatusChip } from './ui.jsx';
import BrandMark from './BrandMark.jsx';

function Cell({ value }) {
  if (value && typeof value === 'object' && value.status) return <StatusChip status={value.status} />;
  if (value && typeof value === 'object' && value.id) {
    return <Link to={`/vehicle/${value.id}`} className="cell-car"><b>{value.id}</b> <span>{value.text}</span></Link>;
  }
  return <>{value}</>;
}

function Block({ b, onAsk, onConfirm, resolved }) {
  switch (b.type) {
    case 'text':
      return <p className="msg-text">{b.text}</p>;
    case 'title':
      return <Link to={b.to} className="msg-title">{b.text}</Link>;
    case 'stats':
      return (
        <div className="msg-stats">
          {b.items.map((s) => (
            <div className="msg-stat" key={s.label}>
              <span className="l">{s.label}</span>
              {s.status ? <StatusChip status={s.status} /> : <b style={{ color: s.tone ? `var(--${s.tone})` : undefined }}>{s.value}</b>}
            </div>
          ))}
        </div>
      );
    case 'list':
      return <ul className="msg-list">{b.items.map((i) => <li key={i}>{i}</li>)}</ul>;
    case 'table':
      return (
        <div className="msg-table scroll">
          <table>
            <thead><tr>{b.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>{b.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}><Cell value={c} /></td>)}</tr>)}</tbody>
          </table>
        </div>
      );
    case 'factors':
      return (
        <div className="msg-sec">
          <div className="msg-sec-t">{b.title}</div>
          <ol className="msg-factors">
            {b.items.map((f) => (
              <li key={f.k} title={`${f.c} confidence`}><b>{f.t}</b><span>{f.s}</span></li>
            ))}
          </ol>
        </div>
      );
    case 'actions':
      return (
        <div className="msg-sec">
          {b.title && <div className="msg-sec-t green">{b.title}</div>}
          <ul className="msg-actions">{b.items.map((a) => <li key={a}>{a}</li>)}</ul>
        </div>
      );
    case 'chart':
      return <div className="msg-chart"><MiniBars data={b.data} /></div>;
    case 'note':
      return <p className="msg-note">{b.text}</p>;
    case 'link':
      return <Link to={b.to} className="msg-link">{b.label} →</Link>;
    case 'followup':
      return <button className="chip-q" onClick={() => onAsk(b.text)}>{b.text}</button>;
    case 'confirm':
      return (
        <div className="msg-confirm">
          <div className="msg-sec-t">Create action – needs confirmation</div>
          <div><b>{b.action.car}</b> · {b.action.a}</div>
          <div className="note">Because: {b.action.r} · Owner: {b.action.o} · Due: {b.action.due}</div>
          {resolved ? (
            <div className="note"><b>{resolved === 'confirmed' ? 'Confirmed' : 'Cancelled'}</b></div>
          ) : (
            <div className="row">
              <button className="btn pri" onClick={() => onConfirm(true, b.action)}>Confirm</button>
              <button className="btn" onClick={() => onConfirm(false, b.action)}>Cancel</button>
            </div>
          )}
        </div>
      );
    default:
      return null;
  }
}

export default function ChatMessage({ msg, onAsk, onConfirm }) {
  if (msg.role === 'user') return <div className="msg user"><div className="bubble">{msg.text}</div></div>;
  if (msg.pending) {
    return (
      <div className="msg bot">
        <BrandMark size={28} />
        <div className="bubble"><span className="typing">Checking inventory data<i>.</i><i>.</i><i>.</i></span></div>
      </div>
    );
  }
  return (
    <div className="msg bot">
      <BrandMark size={28} />
      <div className="bubble">
        {msg.blocks.map((b, i) => (
          <Block key={i} b={b} onAsk={onAsk} onConfirm={(ok, action) => onConfirm(msg.id, ok, action)} resolved={msg.resolved} />
        ))}
        {msg.sources?.length > 0 && <div className="msg-sources">Data: {msg.sources.join(' · ')}</div>}
      </div>
    </div>
  );
}
