import { MOCK_CURVE_SHAPE } from '../data/mockData';

// Mock selling-time model. In the real system these values would come from a
// survival model (for example XGBoost with a survival objective) trained on the
// dealer's sold and still-unsold cars. Here a simple curve stands in for it.
const K = MOCK_CURVE_SHAPE;
const LN2 = Math.log(2);

/** Chance the car is still unsold at day t, given its expected (median) days to sell. */
export const survival = (t, median) => Math.exp(-LN2 * Math.pow(t / median, K));

/** Day by which a share (1 - p) of similar cars have sold. p = 0.9 gives the lower limit, p = 0.1 the upper limit. */
export const quantileDay = (p, median) => median * Math.pow(-Math.log(p) / LN2, 1 / K);

export const STATUS_ORDER = { Critical: 0, Alert: 1, Watch: 2, 'On track': 3 };

/**
 * Status from the chance of still being unsold:
 *  below 5% Critical, below 10% Alert (both = past the upper limit of the 80% range),
 *  below 25% Watch (inside the range but close to its upper limit), otherwise On track.
 */
export function statusFor(s) {
  if (s < 0.05) return 'Critical';
  if (s < 0.1) return 'Alert';
  if (s < 0.25) return 'Watch';
  return 'On track';
}

export const isPastRange = (c) => c.status === 'Critical' || c.status === 'Alert';

export function enrichVehicle(raw) {
  const s = survival(raw.dom, raw.med);
  return {
    ...raw,
    name: `${raw.year} ${raw.make} ${raw.model} ${raw.trim}`,
    short: `${raw.make} ${raw.model}`,
    s,
    p10: Math.round(quantileDay(0.9, raw.med)),
    p90: Math.round(quantileDay(0.1, raw.med)),
    stock: raw.dom + raw.recon,
    status: statusFor(s),
    top: raw.reasons[0] ? raw.reasons[0].t : '—',
  };
}

export const fmt = (n) => n.toLocaleString('en-US');
export const usd = (n) => (n < 0 ? '-$' : '$') + fmt(Math.abs(Math.round(n)));
export const pct = (x) => `${Math.round(x * 100)}%`;
export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
