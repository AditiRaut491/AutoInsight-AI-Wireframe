import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { answer, SUGGESTIONS, WELCOME } from '../lib/assistant';
import { useAppState } from '../context/AppState.jsx';
import ChatMessage from '../components/ChatMessage.jsx';
import BrandMark from '../components/BrandMark.jsx';

let nextId = 1;
const REPLY_DELAY_MS = 450;

export default function Assistant() {
  const { chat, setChat, cost, addAction, lastCar } = useAppState();
  const [input, setInput] = useState('');
  const [params, setParams] = useSearchParams();
  const listRef = useRef(null);
  const asked = useRef(false);

  const lastVehicleId = [...chat].reverse().find((m) => m.vehicleId)?.vehicleId || lastCar;

  function ask(text) {
    const question = text.trim();
    if (!question) return;
    const pendingId = nextId++;
    setChat((c) => [...c, { id: nextId++, role: 'user', text: question }, { id: pendingId, role: 'bot', pending: true }]);
    setInput('');
    const reply = answer(question, { cost, lastVehicleId });
    setTimeout(() => {
      setChat((c) => c.map((m) => (m.id === pendingId ? { id: pendingId, role: 'bot', ...reply } : m)));
    }, REPLY_DELAY_MS);
  }

  function onConfirm(msgId, ok, action) {
    setChat((c) => [
      ...c.map((m) => (m.id === msgId ? { ...m, resolved: ok ? 'confirmed' : 'cancelled' } : m)),
      {
        id: nextId++,
        role: 'bot',
        blocks: ok
          ? [{ type: 'text', text: `Done. “${action.a}” for ${action.car} is now on the Actions board, owned by ${action.o}.` }, { type: 'note', text: 'Prototype only: the change disappears when you reload the page.' }, { type: 'link', to: '/actions', label: 'Open the Actions board' }]
          : [{ type: 'text', text: 'Cancelled. Nothing was changed.' }],
        sources: ok ? ['POST /api/actions'] : [],
      },
    ]);
    if (ok) addAction(action);
  }

  // Questions can be passed in the URL, e.g. #/assistant?ask=Which%20cars%20should%20I%20focus%20on%20today%3F
  useEffect(() => {
    const q = params.get('ask');
    if (q && !asked.current) {
      asked.current = true;
      if (params.get('fresh')) setChat([]);
      ask(q);
      setParams({}, { replace: true });
    }
    // Runs once on first load only.
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat]);

  const messages = chat.length ? chat : [{ id: 0, role: 'bot', ...WELCOME }];

  return (
    <>
      <div className="spread">
        <div>
          <div className="row"><h1>Ask AutoInsight</h1><span className="badge-proposed">Proposed feature – Interactive chatbot UI concept</span></div>
          <p className="sub">Ask about stock, late cars, possible reasons and next steps. Answers come from the same data as the dashboard.</p>
        </div>
        <button className="btn" onClick={() => setChat([])}>New chat</button>
      </div>

      <div className="chat-wrap">
        <section className="chat card" aria-label="Chat with AutoInsight">
          <header className="chat-head">
            <BrandMark size={30} />
            <div>
              <b>AutoInsight Assistant</b>
              <span className="note">Inventory, predictions, alerts · mock data</span>
            </div>
            <span className="badge-proposed small">Proposed</span>
          </header>
          <div className="chat-list" ref={listRef} aria-live="polite">
            {messages.map((m) => <ChatMessage key={m.id} msg={m} onAsk={ask} onConfirm={onConfirm} />)}
          </div>
          <form className="composer" onSubmit={(e) => { e.preventDefault(); ask(input); }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about inventory, a car, or what to do next…" aria-label="Your question" />
            <button className="btn pri" type="submit" disabled={!input.trim()}>Send</button>
          </form>
        </section>

        <aside className="chat-side">
          <div className="card">
            <h2>Try asking</h2>
            {SUGGESTIONS.map((g) => (
              <div key={g.group} className="sugg-group">
                <div className="sugg-t">{g.group}</div>
                {g.items.map((s) => <button key={s} className="chip-q" onClick={() => ask(s)}>{s}</button>)}
              </div>
            ))}
          </div>
          <div className="card">
            <h2>How answers are grounded</h2>
            <ul className="msg-list note" style={{ fontSize: 13 }}>
              <li>Every answer is built from the same API data as the dashboard; the “Data” line shows which.</li>
              <li>If the data isn’t available, the assistant says so instead of guessing.</li>
              <li>Changing a record, such as assigning an action, needs sign-in and confirmation.</li>
              <li>In this prototype, simple rules match the question. The planned version would use a language model that can only call AutoInsight’s approved APIs.</li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
