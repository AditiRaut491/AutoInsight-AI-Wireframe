// ---------------------------------------------------------------------------
// "Ask AutoInsight" – PROPOSED chatbot, UI concept.
//
// In this wireframe, questions are matched to intents with simple keyword rules,
// and every answer is built from the same mock API functions the dashboard uses.
// Nothing is invented: if the data is not available, the assistant says so.
//
// Planned version: a language model that can only call AutoInsight's approved,
// read-only backend APIs (inventory, vehicles, predictions, alerts, analytics),
// then writes the answer from what those APIs return. Changes to records
// (for example assigning an action) need a signed-in user and confirmation.
// ---------------------------------------------------------------------------
import {
  ENDPOINTS, getAgeingDistribution, getExplanation, getHoldingCosts, getInventorySummary, getPriorityQueue,
  getSegmentSummary, getVehicle, listMarketShifts, listPastRange, listSalesThisMonth, listVehicles, vehiclesWithFactor,
} from '../api/mockApi';
import { AS_OF, NEXT_STEP } from '../data/mockData';
import { cap, isPastRange, pct, usd } from './model';

export const SUGGESTIONS = [
  {
    group: 'Inventory',
    items: [
      'How many cars are currently available in the showroom?',
      'Which cars are currently in stock?',
      'Show me all vehicles that have been in inventory for more than 45 days.',
      'How many cars have been sold this month?',
      'How many vehicles are currently flagged as anomalies?',
    ],
  },
  {
    group: 'Vehicles',
    items: [
      'Which Honda CR-V is taking longer than expected to sell?',
      'Why is the Honda CR-V taking longer than expected to sell?',
      'What is the predicted selling-time range of vehicle U2417?',
      'Which vehicles have the highest holding cost?',
      'Show me the details of the oldest vehicle in inventory.',
    ],
  },
  {
    group: 'Analytics',
    items: [
      'What is the average number of days vehicles stay in inventory?',
      'Which vehicle segment has the most ageing inventory?',
      'What percentage of our inventory is past its expected selling-time range?',
      'Show me the inventory ageing distribution.',
    ],
  },
  {
    group: 'Recommendations',
    items: [
      'Which cars should I focus on today?',
      'What actions are recommended for the Honda CR-V?',
      'Which vehicles need better listing photos?',
      'Which vehicles are priced above comparable vehicles?',
      'Which vehicles have slow lead follow-up?',
    ],
  },
];

const MODEL_WORDS = [
  [/\bcr-?\s?v\b/, 'U2417'], [/\bf-?\s?150\b/, 'U2391'], [/\bcamry\b/, 'U2440'], [/\bequinox\b/, 'U2402'],
  [/\bioniq\b/, 'U2455'], [/\bx3\b/, 'U2433'], [/\boutback\b/, 'U2448'], [/\bcivic\b/, 'U2419'],
  [/\brav\s?4\b/, 'U2437'], [/\bwrangler\b/, 'U2460'], [/\brogue\b/, 'U2463'], [/\bsportage\b/, 'U2471'],
  [/\bmodel\s?3\b/, 'U2452'], [/\bescape\b/, 'U2466'],
];
const MAKES = ['honda', 'ford', 'toyota', 'chevrolet', 'chevy', 'hyundai', 'bmw', 'subaru', 'jeep', 'nissan', 'kia', 'tesla'];

const has = (q, re) => re.test(q);

function findVehicles(q) {
  const id = q.match(/\bu\s?-?(\d{4})\b/);
  if (id) {
    const v = getVehicle(`U${id[1]}`);
    return v ? { list: [v], explicit: true } : { missingId: `U${id[1]}` };
  }
  for (const [re, vid] of MODEL_WORDS) if (re.test(q)) return { list: [getVehicle(vid)], explicit: true };
  const make = MAKES.find((m) => new RegExp(`\\b${m}s?\\b`).test(q));
  if (make) {
    const name = make === 'chevy' ? 'chevrolet' : make;
    const list = listVehicles().filter((v) => v.make.toLowerCase() === name);
    return list.length ? { list, explicit: true, make: cap(name) } : { missingMake: cap(name) };
  }
  if (has(q, /\b(this|that|the same) (particular )?(car|vehicle|one)\b/) || has(q, /\bwhy is it\b|\bis it (flagged|late|slow)\b/)) return { contextual: true };
  return {};
}

const vehicleStats = (v) => ({
  type: 'stats',
  items: [
    { label: 'Days on market', value: v.dom, tone: isPastRange(v) ? 'crit' : undefined },
    { label: 'Expected selling time', value: `${v.med} days` },
    { label: 'Expected range', value: `${v.p10}–${v.p90} days` },
    { label: 'Status', status: v.status },
  ],
});
const vehicleTitle = (v) => ({ type: 'title', text: `${v.id} – ${v.name}`, to: `/vehicle/${v.id}` });
const CAUTION = 'Possible factors are associations, not proven causes. Actions are suggestions, not guaranteed results.';

// ---------- answers ----------

function overview(cost) {
  const s = getInventorySummary(cost);
  return {
    blocks: [
      { type: 'text', text: `There are currently ${s.total} used vehicles in stock.` },
      {
        type: 'stats',
        items: [
          { label: 'Total vehicles', value: s.total },
          { label: 'Past expected range', value: s.pastRange, tone: 'crit' },
          { label: 'Within expected range', value: s.withinRange, tone: 'ok' },
          { label: 'Flagged as Critical', value: s.critical, tone: 'crit' },
        ],
      },
      { type: 'text', text: `Of the ${s.pastRange} cars past their range, ${s.critical} are Critical and ${s.alert} are on Alert. ${s.watch} more are on Watch: still within range, but close to the upper limit.` },
      { type: 'link', to: '/alerts', label: `Show the ${s.pastRange} cars past their range` },
    ],
    sources: [ENDPOINTS.summary],
  };
}

function stockList() {
  const list = [...listVehicles()].sort((a, b) => b.stock - a.stock);
  return {
    blocks: [
      { type: 'text', text: `${list.length} vehicles are in stock, longest in stock first:` },
      { type: 'table', columns: ['Car', 'Days in stock', 'Status'], rows: list.map((v) => [{ id: v.id, text: v.short }, v.stock, { status: v.status }]) },
    ],
    sources: [ENDPOINTS.vehicles],
  };
}

function olderThan(n) {
  const list = listVehicles().filter((v) => v.stock > n).sort((a, b) => b.stock - a.stock);
  if (!list.length) return { blocks: [{ type: 'text', text: `No vehicle has been in stock for more than ${n} days.` }], sources: [ENDPOINTS.vehicles] };
  const past = list.filter(isPastRange).length;
  return {
    blocks: [
      { type: 'text', text: `${list.length} vehicles have been in stock for more than ${n} days (days in stock include reconditioning).` },
      { type: 'table', columns: ['Car', 'Days in stock', 'Expected range*', 'Status'], rows: list.map((v) => [{ id: v.id, text: v.short }, v.stock, `${v.p10}–${v.p90}`, { status: v.status }]) },
      { type: 'note', text: `${past} of them are past their expected range; the others are old but still within it. *Range is in days on market, which starts once the car is ready for sale.` },
    ],
    sources: [ENDPOINTS.vehicles],
  };
}

function salesAnswer(q) {
  if (has(q, /last month|october|last year|this year|last week|yesterday|2025|previous/)) {
    return { blocks: [{ type: 'text', text: 'I only have sales records for this month (1–21 Nov 2026) in this demo dataset, so I can’t answer for other periods.' }], sources: [ENDPOINTS.sales] };
  }
  const sales = listSalesThisMonth();
  const avg = sales.reduce((a, s) => a + s.daysToSell, 0) / sales.length;
  return {
    blocks: [
      { type: 'text', text: `${sales.length} cars have been sold this month (1–21 Nov 2026).` },
      { type: 'stats', items: [{ label: 'Sold this month', value: sales.length }, { label: 'Average days to sell', value: Math.round(avg) }, { label: 'Fastest', value: `${Math.min(...sales.map((s) => s.daysToSell))} days` }, { label: 'Slowest', value: `${Math.max(...sales.map((s) => s.daysToSell))} days` }] },
      { type: 'table', columns: ['Car', 'Sold on', 'Days to sell'], rows: sales.map((s) => [s.name.replace(/^\d{4} /, ''), s.soldOn, s.daysToSell]) },
    ],
    sources: [ENDPOINTS.sales],
  };
}

function flaggedCount(cost) {
  const s = getInventorySummary(cost);
  const list = listPastRange();
  return {
    blocks: [
      { type: 'text', text: `${s.pastRange} vehicles are flagged: they are past the upper limit of their expected selling-time range (${s.critical} Critical, ${s.alert} Alert).` },
      { type: 'table', columns: ['Car', 'Days on market', 'Expected range', 'Status'], rows: list.map((v) => [{ id: v.id, text: v.short }, v.dom, `${v.p10}–${v.p90}`, { status: v.status }]) },
    ],
    sources: [ENDPOINTS.alerts],
  };
}

function shareAnswer(cost) {
  const s = getInventorySummary(cost);
  return {
    blocks: [
      { type: 'text', text: `${pct(s.sharePastRange)} of the inventory is past its expected selling-time range: ${s.pastRange} of ${s.total} vehicles.` },
      { type: 'stats', items: [{ label: 'Past range', value: pct(s.sharePastRange), tone: 'crit' }, { label: 'Within range', value: pct(1 - s.sharePastRange), tone: 'ok' }, { label: 'On Watch', value: s.watch }] },
      { type: 'note', text: 'Each car is compared with its own expected range, not a fixed 60-day rule.' },
    ],
    sources: [ENDPOINTS.summary],
  };
}

function averageAnswer(cost) {
  const s = getInventorySummary(cost);
  const sales = listSalesThisMonth();
  const avgSell = sales.reduce((a, x) => a + x.daysToSell, 0) / sales.length;
  return {
    blocks: [
      { type: 'text', text: `Cars currently in stock have been here ${Math.round(s.avgDaysInStock)} days on average. Cars sold this month took ${Math.round(avgSell)} days on average to sell.` },
      { type: 'stats', items: [{ label: 'Avg days in stock (current)', value: Math.round(s.avgDaysInStock) }, { label: 'Avg days on market (current)', value: Math.round(s.avgDaysOnMarket) }, { label: 'Avg days to sell (sold this month)', value: Math.round(avgSell) }] },
      { type: 'note', text: 'Days in stock counts unsold cars from arrival to today, so it is not the same as days to sell, which is only known once a car is sold.' },
    ],
    sources: [ENDPOINTS.summary, ENDPOINTS.sales],
  };
}

function segmentAnswer() {
  const segs = getSegmentSummary();
  const top = segs[0];
  return {
    blocks: [
      { type: 'text', text: `${top.seg}s have the most cars past their expected range: ${top.past} of ${top.units}. Several segments have only one car in stock, which is too few to call a trend.` },
      { type: 'table', columns: ['Segment', 'Units', 'Past range', 'Avg days in stock'], rows: segs.map((g) => [g.seg, g.units, g.past, Math.round(g.avgDays)]) },
    ],
    sources: [ENDPOINTS.segments],
  };
}

function holdingAnswer(cost) {
  const top = getHoldingCosts(cost).slice(0, 5);
  return {
    blocks: [
      { type: 'text', text: `Highest estimated holding cost so far, at $${cost} per car per day:` },
      { type: 'table', columns: ['Car', 'Days in stock', 'Cost so far', 'Status'], rows: top.map(({ v, cost: c }) => [{ id: v.id, text: v.short }, v.stock, usd(c), { status: v.status }]) },
      { type: 'note', text: `Estimate = days in stock × $${cost}/day. $37 is a US study default; change it on the Holding cost page.` },
    ],
    sources: [ENDPOINTS.holding],
  };
}

function distributionAnswer() {
  const data = getAgeingDistribution();
  return {
    blocks: [
      { type: 'text', text: 'Inventory ageing by days in stock:' },
      { type: 'chart', data },
      { type: 'note', text: data.map((d) => `${d.bucket} days: ${d.cars} cars (${d.past} past range)`).join(' · ') },
    ],
    sources: [ENDPOINTS.ageing],
  };
}

function oldestAnswer(cost) {
  const v = [...listVehicles()].sort((a, b) => b.stock - a.stock)[0];
  return {
    blocks: [
      { type: 'text', text: `The oldest vehicle is ${v.id}, a ${v.name}, at ${v.stock} days in stock (${v.dom} on market + ${v.recon} in reconditioning).` },
      vehicleTitle(v),
      vehicleStats(v),
      { type: 'text', text: isPastRange(v) ? 'It is past its expected range.' : `It is the oldest car, but still within its expected range, so it is on ${v.status}. Its holding cost so far is about ${usd(v.stock * cost)}.` },
      ...(v.reasons.length ? [{ type: 'factors', title: 'Possible contributing factors', items: v.reasons }] : []),
    ],
    sources: [ENDPOINTS.vehicles, ENDPOINTS.explanation(v.id)],
    vehicleId: v.id,
  };
}

function priorityAnswer(cost) {
  const queue = getPriorityQueue(cost);
  return {
    blocks: [
      { type: 'text', text: `Start with these ${queue.length} cars. They are past their expected selling-time range, ranked by the cost of waiting:` },
      { type: 'table', columns: ['Car', 'Status', 'Top possible factor', 'Suggested next step'], rows: queue.map(({ v }) => [{ id: v.id, text: v.short }, { status: v.status }, v.reasons[0]?.t || '—', cap(NEXT_STEP[v.reasons[0]?.k] || 'review')]) },
      { type: 'note', text: CAUTION },
    ],
    sources: [ENDPOINTS.priority, ENDPOINTS.alerts],
  };
}

function factorList(kind, intro) {
  const list = vehiclesWithFactor(kind).sort((a, b) => b.r.d - a.r.d);
  if (!list.length) return { blocks: [{ type: 'text', text: 'No cars currently show this factor.' }], sources: [ENDPOINTS.vehicles] };
  return {
    blocks: [
      { type: 'text', text: intro(list.length) },
      { type: 'table', columns: ['Car', 'Evidence', 'Status'], rows: list.map(({ v, r }) => [{ id: v.id, text: v.short }, r.s, { status: v.status }]) },
      { type: 'note', text: `Suggested next step: ${NEXT_STEP[kind]}. ${kind === 'Price' ? 'AutoInsight AI shows the gap; the manager decides the price.' : ''}` },
    ],
    sources: [ENDPOINTS.vehicles, 'GET /api/vehicles/{id}/explanation'],
  };
}

function pastRangeList() {
  const list = listPastRange();
  return {
    blocks: [
      { type: 'text', text: `${list.length} cars are past their expected selling-time range:` },
      { type: 'table', columns: ['Car', 'Days on market', 'Expected range', 'Status'], rows: list.map((v) => [{ id: v.id, text: v.short }, v.dom, `${v.p10}–${v.p90}`, { status: v.status }]) },
    ],
    sources: [ENDPOINTS.alerts],
  };
}

function marketAnswer() {
  return {
    blocks: [
      { type: 'text', text: 'Two cohort-level market shifts are flagged this month:' },
      { type: 'list', items: listMarketShifts().map((m) => `${m.t}: ${m.e}`) },
      { type: 'note', text: 'When a whole cohort slows, AutoInsight AI reports a market shift before blaming the individual car.' },
    ],
    sources: ['GET /api/analytics/market-shifts'],
  };
}

// ---------- vehicle-specific ----------

function explainVehicle(v) {
  const ex = getExplanation(v.id);
  if (!isPastRange(v)) {
    return {
      blocks: [
        vehicleTitle(v),
        vehicleStats(v),
        { type: 'text', text: `${v.id} is not flagged. At day ${v.dom} it is still within its expected range of ${v.p10}–${v.p90} days${v.status === 'Watch' ? ', but close to the upper limit, so it is on Watch' : ''}.` },
        ...(ex.factors.length ? [{ type: 'factors', title: 'Factors to keep an eye on', items: ex.factors }] : []),
      ],
      sources: [ENDPOINTS.vehicle(v.id), ENDPOINTS.explanation(v.id)],
      vehicleId: v.id,
    };
  }
  return {
    blocks: [
      vehicleTitle(v),
      vehicleStats(v),
      { type: 'factors', title: 'Possible contributing factors', items: ex.factors },
      { type: 'actions', title: 'Recommended actions', items: ex.factors.map((f) => cap(f.next)) },
      { type: 'note', text: CAUTION },
    ],
    sources: [ENDPOINTS.vehicle(v.id), ENDPOINTS.explanation(v.id)],
    vehicleId: v.id,
  };
}

function rangeVehicle(v) {
  return {
    blocks: [
      { type: 'text', text: `${v.id} (${v.name}) is expected to sell in about ${v.med} days, with an 80% range of ${v.p10}–${v.p90} days on market. It is at day ${v.dom}${v.dom > v.p90 ? `, ${v.dom - v.p90} days past the upper limit` : ''}.` },
      vehicleStats(v),
      { type: 'note', text: `Based on ${v.n} comparable cars (same segment, model, price band, location, age and mileage). Confidence: ${v.conf}.` },
    ],
    sources: [ENDPOINTS.vehicle(v.id)],
    vehicleId: v.id,
  };
}

function actionsVehicle(v) {
  const ex = getExplanation(v.id);
  if (!ex.factors.length) return { blocks: [{ type: 'text', text: `${v.id} is within its expected range, so no actions are recommended right now.` }], sources: [ENDPOINTS.explanation(v.id)], vehicleId: v.id };
  return {
    blocks: [
      { type: 'text', text: `Recommended actions for ${v.id} (${v.name}), one for each possible contributing factor:` },
      { type: 'actions', items: ex.factors.map((f) => `${cap(f.next)}, because: ${f.t.toLowerCase()}`) },
      { type: 'note', text: CAUTION },
      { type: 'link', to: '/actions', label: 'Open the Actions board' },
    ],
    sources: [ENDPOINTS.explanation(v.id), ENDPOINTS.actions],
    vehicleId: v.id,
  };
}

function detailsVehicle(v, cost) {
  return {
    blocks: [
      vehicleTitle(v),
      { type: 'text', text: `${v.seg} · ${v.mi.toLocaleString('en-US')} mi · listed at ${usd(v.price)} · ${v.stock} days in stock · holding cost so far about ${usd(v.stock * cost)}.` },
      vehicleStats(v),
      ...(v.reasons.length ? [{ type: 'factors', title: 'Possible contributing factors', items: v.reasons }] : []),
    ],
    sources: [ENDPOINTS.vehicle(v.id)],
    vehicleId: v.id,
  };
}

function whichVehicle(list, make) {
  const late = list.filter(isPastRange);
  const label = make ? `${make} vehicles` : 'matching vehicles';
  return {
    blocks: [
      { type: 'text', text: late.length ? `${late.length === 1 ? `${late[0].id}, the ${late[0].name}, is` : `${late.length} ${label} are`} taking longer than expected.` : `None of the ${label} is past its expected range.` },
      { type: 'table', columns: ['Car', 'Days on market', 'Expected range', 'Status'], rows: list.map((v) => [{ id: v.id, text: v.name.replace(/^\d{4} /, '') }, v.dom, `${v.p10}–${v.p90}`, { status: v.status }]) },
      ...(late.length === 1 ? [{ type: 'followup', text: `Why is ${late[0].id} taking longer than expected?` }] : []),
    ],
    sources: [ENDPOINTS.vehicles],
    vehicleId: late.length === 1 ? late[0].id : list.length === 1 ? list[0].id : undefined,
  };
}

function confirmAction(q, v) {
  const kind = has(q, /photo|picture|image/) ? 'Photos' : has(q, /lead|follow|call/) ? 'Leads' : has(q, /listing|description|history/) ? 'Listing' : has(q, /price/) ? 'Price' : has(q, /move|transfer/) ? 'Market' : null;
  const ownerMatch = q.match(/\bto (?:the )?([a-z][a-z ]{2,30})$/);
  const owner = ownerMatch ? cap(ownerMatch[1].trim()) : 'Used-car manager';
  const reason = kind ? v.reasons.find((r) => r.k === kind) : v.reasons[0];
  const action = { car: v.id, a: cap(kind ? NEXT_STEP[kind] : 'review this car'), r: reason ? reason.t : 'Manager request', o: owner, due: 'This week' };
  return {
    blocks: [
      { type: 'text', text: 'This would change a vehicle record, so it needs a signed-in user with permission and your confirmation.' },
      { type: 'confirm', action },
    ],
    sources: [ENDPOINTS.createAction],
    vehicleId: v.id,
  };
}

const help = () => ({
  blocks: [
    { type: 'text', text: 'I answer questions using the same inventory data, predictions and alerts as the dashboard. For example:' },
    { type: 'list', items: ['How many cars are in stock, and how many are past their range', 'Why a specific car is taking longer than expected', 'Which cars to review first, and what to do next', 'Ageing, holding cost, segments and sales this month'] },
  ],
  sources: [],
});

const fallback = () => ({
  blocks: [
    { type: 'text', text: 'I can’t answer that from the inventory data I have access to. I can help with stock, specific vehicles, late cars and their possible factors, recommended actions, ageing, holding cost and sales this month.' },
    { type: 'followup', text: 'Which cars should I focus on today?' },
  ],
  sources: [],
});

// ---------- router ----------

/**
 * Answer a question. `context.lastVehicleId` lets follow-ups like
 * "why is this car flagged?" refer to the car discussed last.
 */
export function answer(question, { cost, lastVehicleId } = {}) {
  const q = question.toLowerCase().replace(/[’`]/g, "'").replace(/[?!.]+$/g, '').trim();
  if (!q) return fallback();

  const found = findVehicles(q);
  if (found.missingId) return { blocks: [{ type: 'text', text: `I can’t find vehicle ${found.missingId} in current stock. It may have been sold, or the stock number may be wrong.` }], sources: [ENDPOINTS.vehicle(found.missingId)] };
  if (found.missingMake) return { blocks: [{ type: 'text', text: `There are no ${found.missingMake} vehicles in stock right now.` }], sources: [ENDPOINTS.vehicles] };
  let vehicles = found.list;
  let assumed = false;
  if (!vehicles && found.contextual && lastVehicleId) { vehicles = [getVehicle(lastVehicleId)]; assumed = true; }

  // Pricing: explain the boundary instead of suggesting a price.
  if (has(q, /what price|price should|new price|optimal price|best price|set (the )?price|reprice|how much should/)) {
    const v = vehicles?.[0];
    const gap = v?.reasons.find((r) => r.k === 'Price');
    return {
      blocks: [{ type: 'text', text: `AutoInsight AI doesn’t set prices; that decision stays with the manager.${gap ? ` ${v.id} is listed about ${gap.gap}% above ${v.n} comparable cars, which is one possible contributing factor.` : ''}` }],
      sources: v ? [ENDPOINTS.explanation(v.id)] : [],
      vehicleId: v?.id,
    };
  }

  // Requests that would change data need confirmation.
  if (has(q, /^(please )?(assign|create|add|mark|update|change|edit|delete|remove|move)\b/)) {
    if (!vehicles || vehicles.length !== 1) return { blocks: [{ type: 'text', text: 'Which car should this action be for? Please include the stock number, for example U2417.' }], sources: [] };
    return confirmAction(q, vehicles[0]);
  }

  if (vehicles && vehicles.length) {
    const prefix = assumed ? [{ type: 'note', text: `Assuming you mean ${vehicles[0].id}, the car we just discussed.` }] : [];
    const wrap = (r) => ({ ...r, blocks: [...prefix, ...r.blocks] });
    if (vehicles.length > 1 || has(q, /^which\b/)) return wrap(whichVehicle(vehicles, found.make));
    const v = vehicles[0];
    if (has(q, /\b(action|actions|recommend|recommended|what should|next step|do next|what to do)\b/)) return wrap(actionsVehicle(v));
    if (has(q, /\bwhy\b|flag|reason|slow|taking longer|late|factor|stuck|not selling/)) return wrap(explainVehicle(v));
    if (has(q, /range|predict|expected|how long|when will/)) return wrap(rangeVehicle(v));
    return wrap(detailsVehicle(v, cost));
  }

  if (has(q, /\bsold\b|\bsales\b|\bsell this month\b/)) return salesAnswer(q);
  if (has(q, /how many/) && has(q, /anomal|flag|past|late|critical|alert|overdue|beyond/)) return flaggedCount(cost);
  if (has(q, /percent|percentage|%|share|proportion|fraction/)) return shareAnswer(cost);
  const days = q.match(/(?:more than|over|older than|above|longer than|greater than|at least|>)\s*(\d{1,3})\s*days?/);
  if (days) return olderThan(parseInt(days[1], 10));
  if (has(q, /how many/) && has(q, /car|vehicle|unit|stock|showroom|inventory|lot/)) return overview(cost);
  if (has(q, /oldest|longest in (stock|inventory)|been here the longest/)) return oldestAnswer(cost);
  if (has(q, /average|mean|typical/) && has(q, /day|stay|inventory|stock|sell/)) return averageAnswer(cost);
  if (has(q, /segment|category|body type|type of (car|vehicle)/)) return segmentAnswer();
  if (has(q, /holding cost|cost.*(highest|most)|(highest|most).*cost|expensive to hold|costing/)) return holdingAnswer(cost);
  if (has(q, /distribution|ageing|aging|age profile|age breakdown|bucket/)) return distributionAnswer();
  if (has(q, /focus|review first|priorit|attention|urgent|first|most important|start with/)) return priorityAnswer(cost);
  if (has(q, /photo|picture|image/)) return factorList('Photos', (n) => `${n} vehicles show a photo problem (too few photos or a stock main image):`);
  if (has(q, /price|priced|pricing|comparable|overpriced|expensive/)) return factorList('Price', (n) => `${n} vehicles are priced above comparable vehicles:`);
  if (has(q, /lead|follow.?up|response|reply|respond/)) return factorList('Leads', (n) => `${n} vehicles have slow lead follow-up:`);
  if (has(q, /listing|incomplete|description|history report/)) return factorList('Listing', (n) => `${n} vehicles have incomplete listings:`);
  if (has(q, /market|cohort/)) return marketAnswer();
  if (has(q, /past|beyond|flag|anomal|alert|late|overdue|slow/)) return pastRangeList();
  if (has(q, /(which|list|show|what)\b.*\b(car|cars|vehicle|vehicles|units|stock|inventory)/) || has(q, /in stock|available|showroom/)) return stockList();
  if (has(q, /^(hi|hello|hey|help|what can you do)/)) return help();
  return fallback();
}

export const WELCOME = {
  blocks: [
    { type: 'text', text: `Hi Priya. Ask me about today’s used inventory (data as of ${AS_OF}). I use the same data, predictions and alerts as the dashboard, and I’ll tell you when something isn’t available.` },
  ],
  sources: [],
};
