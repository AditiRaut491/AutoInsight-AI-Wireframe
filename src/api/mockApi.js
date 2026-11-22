// ---------------------------------------------------------------------------
// Mock API layer.
// In the proposed system these functions are REST endpoints served by the
// Python backend (FastAPI) on top of PostgreSQL and the ML services.
// Here they read local mock data, but every screen and the chatbot still go
// through them, so all views share one source of truth.
// ---------------------------------------------------------------------------
import {
  RAW_VEHICLES, SALES_THIS_MONTH, MARKET_SHIFTS, NEXT_STEP, FACTOR_NAMES,
  HISTORY_MONTHS, HISTORY_SHARE_PAST_RANGE, HISTORY_AVG_DAYS_IN_STOCK,
} from '../data/mockData';
import { enrichVehicle, isPastRange, STATUS_ORDER } from '../lib/model';

const VEHICLES = RAW_VEHICLES.map(enrichVehicle);

export const ENDPOINTS = {
  summary: 'GET /api/inventory/summary',
  vehicles: 'GET /api/vehicles',
  vehicle: (id) => `GET /api/vehicles/${id}`,
  explanation: (id) => `GET /api/vehicles/${id}/explanation`,
  alerts: 'GET /api/alerts',
  priority: 'GET /api/alerts/priority',
  ageing: 'GET /api/analytics/ageing',
  segments: 'GET /api/analytics/segments',
  holding: 'GET /api/analytics/holding-cost',
  sales: 'GET /api/sales?period=this-month',
  actions: 'GET /api/actions',
  createAction: 'POST /api/actions',
};

/** GET /api/vehicles */
export const listVehicles = () => VEHICLES;

/** GET /api/vehicles/{id} */
export const getVehicle = (id) => VEHICLES.find((v) => v.id === String(id).toUpperCase());

/** GET /api/vehicles/{id}/explanation – possible contributing factors with a suggested next step */
export const getExplanation = (id) => {
  const v = getVehicle(id);
  if (!v) return null;
  return {
    vehicle: v,
    factors: v.reasons.map((r) => ({ ...r, next: NEXT_STEP[r.k] })),
  };
};

/** GET /api/alerts – cars past the upper limit of their expected range */
export const listPastRange = () =>
  VEHICLES.filter(isPastRange).sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || b.dom / b.med - a.dom / a.med);

/** GET /api/inventory/summary */
export function getInventorySummary(costPerDay) {
  const past = VEHICLES.filter(isPastRange);
  const count = (s) => VEHICLES.filter((v) => v.status === s).length;
  return {
    total: VEHICLES.length,
    pastRange: past.length,
    withinRange: VEHICLES.length - past.length,
    critical: count('Critical'),
    alert: count('Alert'),
    watch: count('Watch'),
    onTrack: count('On track'),
    sharePastRange: past.length / VEHICLES.length,
    avgDaysInStock: VEHICLES.reduce((a, v) => a + v.stock, 0) / VEHICLES.length,
    avgDaysOnMarket: VEHICLES.reduce((a, v) => a + v.dom, 0) / VEHICLES.length,
    costSoFarFlagged: past.reduce((a, v) => a + v.stock * costPerDay, 0),
    holdingCostPerDay: VEHICLES.length * costPerDay,
  };
}

/** GET /api/alerts/priority – flagged cars ranked by a simple cost-of-waiting score */
export const getPriorityQueue = (costPerDay) =>
  listPastRange()
    .map((v) => ({ v, risk: (1 - v.s) * (v.stock + 14) * costPerDay }))
    .sort((a, b) => b.risk - a.risk);

/** GET /api/analytics/ageing – cars by days in stock */
export function getAgeingDistribution() {
  const buckets = [
    { label: '0–15', min: 0, max: 15 },
    { label: '16–30', min: 16, max: 30 },
    { label: '31–45', min: 31, max: 45 },
    { label: '46–60', min: 46, max: 60 },
    { label: '61+', min: 61, max: Infinity },
  ];
  return buckets.map((b) => {
    const cars = VEHICLES.filter((v) => v.stock >= b.min && v.stock <= b.max);
    return { bucket: b.label, cars: cars.length, past: cars.filter(isPastRange).length, ids: cars.map((c) => c.id) };
  });
}

/** GET /api/analytics/segments */
export function getSegmentSummary() {
  const map = {};
  VEHICLES.forEach((v) => {
    map[v.seg] = map[v.seg] || { seg: v.seg, units: 0, past: 0, days: 0 };
    map[v.seg].units += 1;
    map[v.seg].past += isPastRange(v) ? 1 : 0;
    map[v.seg].days += v.stock;
  });
  return Object.values(map)
    .map((s) => ({ ...s, avgDays: s.days / s.units }))
    .sort((a, b) => b.past - a.past || b.units - a.units || b.avgDays - a.avgDays);
}

/** GET /api/analytics/factors – how often each factor appears among slow cars */
export function getFactorCounts() {
  const rc = {};
  VEHICLES.forEach((v) => v.reasons.forEach((r) => { rc[r.k] = (rc[r.k] || 0) + 1; }));
  return Object.entries(rc)
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => ({ k, label: FACTOR_NAMES[k], n }));
}

/** Cars that have a given factor type (Photos, Price, Leads, Listing, ...) */
export const vehiclesWithFactor = (k) =>
  VEHICLES.filter((v) => v.reasons.some((r) => r.k === k)).map((v) => ({ v, r: v.reasons.find((r) => r.k === k) }));

/** GET /api/analytics/holding-cost – cost so far per car */
export const getHoldingCosts = (costPerDay) =>
  VEHICLES.map((v) => ({ v, cost: v.stock * costPerDay })).sort((a, b) => b.cost - a.cost);

/** GET /api/sales?period=this-month */
export const listSalesThisMonth = () => SALES_THIS_MONTH;

export const listMarketShifts = () => MARKET_SHIFTS;

/** GET /api/reports/history – month-end values; November is today's snapshot */
export function getHistory() {
  const s = getInventorySummary(0);
  return HISTORY_MONTHS.map((m, i) => ({
    month: m,
    sharePastRange: i < HISTORY_SHARE_PAST_RANGE.length ? HISTORY_SHARE_PAST_RANGE[i] : Math.round(s.sharePastRange * 100),
    avgDaysInStock: i < HISTORY_AVG_DAYS_IN_STOCK.length ? HISTORY_AVG_DAYS_IN_STOCK[i] : Math.round(s.avgDaysInStock),
  }));
}
