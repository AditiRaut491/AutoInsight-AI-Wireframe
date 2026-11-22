import { createContext, useContext, useMemo, useState } from 'react';
import { DEFAULT_HOLDING_COST, SEED_ACTIONS } from '../data/mockData';

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [cost, setCost] = useState(DEFAULT_HOLDING_COST); // holding cost per car per day (USD)
  const [dep, setDep] = useState(1.5); // depreciation per 30 days (%)
  const [gross, setGross] = useState(2000); // expected front gross per car (USD)
  const [acknowledged, setAcknowledged] = useState({});
  const [actions, setActions] = useState(SEED_ACTIONS);
  const [lastCar, setLastCar] = useState('U2417');
  const [chat, setChat] = useState([]); // chatbot conversation, kept while you move between pages

  const value = useMemo(() => ({
    cost, setCost, dep, setDep, gross, setGross,
    acknowledged,
    acknowledge: (id) => setAcknowledged((a) => ({ ...a, [id]: true })),
    actions,
    advanceAction: (id) => setActions((list) => list.map((a) => (a.id === id ? { ...a, col: Math.min(2, a.col + 1) } : a))),
    addAction: (action) => setActions((list) => [...list, { ...action, id: Math.max(0, ...list.map((a) => a.id)) + 1, col: 0 }]),
    lastCar, setLastCar,
    chat, setChat,
  }), [cost, dep, gross, acknowledged, actions, lastCar, chat]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider');
  return ctx;
}
