// ---------------------------------------------------------------------------
// MOCK DATA – illustrative only. This is not real dealership data.
// Every screen and the chatbot read this data through src/api/mockApi.js,
// so the dashboard, vehicle pages and chatbot always show the same numbers.
// ---------------------------------------------------------------------------

export const AS_OF = '21 Nov 2026';

export const STORE = {
  name: 'Lakeside Auto',
  department: 'Used vehicles',
  user: 'Priya S.',
  role: 'Used-car manager',
};

// Default holding cost per car per day (USD). An estimate from a US dealer study
// (NCM Associates, cited by Wards). A real dealership should enter its own figure.
export const DEFAULT_HOLDING_COST = 37;

// Shape of the mock selling-time curve used in place of a trained model.
export const MOCK_CURVE_SHAPE = 2.2;

// dom    = days on market (since the car was ready for sale)
// recon  = days spent in reconditioning before that
// days in stock = dom + recon (computed in lib/model.js)
// med    = expected (median) days to sell for this car, from the mock model
// n      = number of comparable sold cars; comp = listing completeness (%)
export const RAW_VEHICLES = [
  {
    id: 'U2417', year: 2021, make: 'Honda', model: 'CR-V', trim: 'EX AWD', seg: 'Compact SUV',
    mi: 34210, price: 27450, dom: 58, med: 31, recon: 5, n: 64, conf: 'High', photos: 6, photoMedian: 28, comp: 72,
    reasons: [
      { k: 'Photos', t: 'Too few real photos', e: '6 photos, main image is a stock photo. Cohort median: 28 real photos.', s: '6 photos (stock main image) vs 28 for similar cars', d: 9, c: 'High' },
      { k: 'Price', t: 'Price now above comparables', e: 'Listed 7% above 64 comparables after their prices fell 4% in 3 weeks. Pricing stays with the manager.', s: 'About 7% above 64 comparable cars', d: 8, c: 'Medium', gap: 7 },
      { k: 'Leads', t: 'Slow lead follow-up', e: 'Median first response 4 h 12 min on 5 leads. Store median: 22 min.', s: 'First reply 4 h 12 min vs store median 22 min', d: 5, c: 'Medium', response: '4 h 12 min' },
    ],
  },
  {
    id: 'U2391', year: 2019, make: 'Ford', model: 'F-150', trim: 'XLT', seg: 'Pickup',
    mi: 61880, price: 33900, dom: 49, med: 24, recon: 6, n: 41, conf: 'High', photos: 31, photoMedian: 27, comp: 90,
    reasons: [
      { k: 'Market', t: 'Market shift in pickups', e: 'Local pickup cohort slowed from 24 to 33 median days in 30 days; supply up 18%.', s: 'Local pickup demand slowed; supply up 18%', d: 7, c: 'High' },
      { k: 'Price', t: 'Price above comparables', e: '5% above 41 comparables.', s: 'About 5% above 41 comparable cars', d: 5, c: 'Medium', gap: 5 },
    ],
  },
  {
    id: 'U2440', year: 2022, make: 'Toyota', model: 'Camry', trim: 'SE', seg: 'Midsize sedan',
    mi: 22105, price: 24600, dom: 42, med: 23, recon: 4, n: 88, conf: 'High', photos: 24, photoMedian: 26, comp: 58,
    reasons: [
      { k: 'Listing', t: 'Listing incomplete', e: '58% of required fields: no history report, 35-word description, features missing.', s: '58% complete: no history report, short description', d: 8, c: 'High' },
      { k: 'Photos', t: 'Stock main image', e: 'First photo is a stock image; shoppers see it in search results.', s: 'Main photo is a stock image', d: 4, c: 'Medium' },
    ],
  },
  {
    id: 'U2402', year: 2020, make: 'Chevrolet', model: 'Equinox', trim: 'LT', seg: 'Compact SUV',
    mi: 48300, price: 19250, dom: 52, med: 34, recon: 14, n: 57, conf: 'Medium', photos: 27, photoMedian: 28, comp: 88,
    reasons: [
      { k: 'Recon', t: 'Long reconditioning', e: '14 days to frontline vs store median 6; car missed its first demand window.', s: '14 days in recon vs store median 6', d: 6, c: 'High' },
      { k: 'Price', t: 'Price slightly above comparables', e: '3% above 57 comparables.', s: 'About 3% above 57 comparable cars', d: 3, c: 'Low', gap: 3 },
    ],
  },
  {
    id: 'U2455', year: 2023, make: 'Hyundai', model: 'Ioniq 5', trim: 'SEL', seg: 'Compact EV',
    mi: 12950, price: 31800, dom: 45, med: 30, recon: 4, n: 22, conf: 'Low', photos: 33, photoMedian: 30, comp: 92,
    reasons: [
      { k: 'Market', t: 'Used EV market slowed', e: 'Compact EV cohort median rose from 34 to 47 days this month. Few local comparables (22).', s: 'Used EV demand slowed; only 22 local comparables', d: 9, c: 'Medium' },
    ],
  },
  {
    id: 'U2433', year: 2019, make: 'BMW', model: 'X3', trim: 'xDrive30i', seg: 'Luxury SUV',
    mi: 52600, price: 26700, dom: 50, med: 33, recon: 7, n: 29, conf: 'Medium', photos: 36, photoMedian: 32, comp: 94,
    reasons: [
      { k: 'Ops', t: 'Not available for test drives', e: 'Off-site at body shop for 6 days after listing; 3 appointments rescheduled.', s: 'Off-site 6 days after listing; 3 test drives moved', d: 6, c: 'Medium' },
    ],
  },
  {
    id: 'U2448', year: 2020, make: 'Subaru', model: 'Outback', trim: 'Premium', seg: 'Midsize SUV',
    mi: 44100, price: 22800, dom: 37, med: 18, recon: 5, n: 46, conf: 'High', photos: 29, photoMedian: 27, comp: 86,
    reasons: [
      { k: 'Leads', t: 'Slow lead follow-up', e: 'First response 6 h 05 min on 9 leads. Store median: 22 min.', s: 'First reply 6 h 05 min vs store median 22 min', d: 8, c: 'High', response: '6 h 05 min' },
      { k: 'Funnel', t: 'Few leads become visits', e: '1 of 9 leads booked a visit (11%) vs cohort 31%.', s: '1 of 9 leads booked a visit vs 31% for similar cars', d: 5, c: 'Medium' },
    ],
  },
  {
    id: 'U2419', year: 2017, make: 'Honda', model: 'Civic', trim: 'EX', seg: 'Compact sedan',
    mi: 82400, price: 13450, dom: 39, med: 17, recon: 6, n: 73, conf: 'High', photos: 8, photoMedian: 26, comp: 80,
    reasons: [
      { k: 'Price', t: 'Price above comparables', e: '9% above 73 comparables; 3 cheaper Civics within 25 miles.', s: 'About 9% above 73 comparable cars', d: 9, c: 'High', gap: 9 },
      { k: 'Photos', t: 'Few photos', e: '8 photos vs cohort median 26.', s: '8 photos vs 26 for similar cars', d: 5, c: 'Medium' },
    ],
  },
  {
    id: 'U2437', year: 2020, make: 'Toyota', model: 'RAV4', trim: 'XLE', seg: 'Compact SUV',
    mi: 41000, price: 25300, dom: 36, med: 18, recon: 4, n: 69, conf: 'High', photos: 30, photoMedian: 28, comp: 52,
    reasons: [
      { k: 'Listing', t: 'Listing incomplete', e: '52% of fields: no history report, price missing on one marketplace feed.', s: '52% complete; price missing on one marketplace', d: 9, c: 'High' },
    ],
  },
  { id: 'U2460', year: 2021, make: 'Jeep', model: 'Wrangler', trim: 'Sport', seg: 'Off-road SUV', mi: 39400, price: 30950, dom: 18, med: 21, recon: 5, n: 34, conf: 'Medium', photos: 32, photoMedian: 30, comp: 91, reasons: [] },
  { id: 'U2463', year: 2018, make: 'Nissan', model: 'Rogue', trim: 'SV', seg: 'Compact SUV', mi: 71200, price: 14900, dom: 12, med: 19, recon: 3, n: 61, conf: 'High', photos: 25, photoMedian: 28, comp: 85, reasons: [] },
  { id: 'U2471', year: 2022, make: 'Kia', model: 'Sportage', trim: 'LX', seg: 'Compact SUV', mi: 19800, price: 23400, dom: 9, med: 18, recon: 4, n: 58, conf: 'High', photos: 28, photoMedian: 28, comp: 89, reasons: [] },
  { id: 'U2452', year: 2021, make: 'Tesla', model: 'Model 3', trim: 'LR', seg: 'Compact EV', mi: 28900, price: 26200, dom: 29, med: 30, recon: 3, n: 24, conf: 'Low', photos: 30, photoMedian: 30, comp: 93, reasons: [] },
  { id: 'U2466', year: 2022, make: 'Ford', model: 'Escape', trim: 'SE', seg: 'Compact SUV', mi: 25600, price: 21900, dom: 15, med: 24, recon: 5, n: 52, conf: 'High', photos: 27, photoMedian: 28, comp: 87, reasons: [] },
];

// Suggested next step for each type of contributing factor.
export const NEXT_STEP = {
  Photos: 'review and reshoot the photos',
  Price: 'compare price with similar cars (manager decides)',
  Leads: 'speed up the first reply to leads',
  Listing: 'complete the missing listing fields',
  Market: 'consider moving it to another store',
  Recon: 'log the recon delay for review',
  Ops: 'keep it on the lot for test drives',
  Funnel: 'review how leads are followed up',
};

export const FACTOR_NAMES = {
  Price: 'Price above comparables',
  Photos: 'Photos (count or stock image)',
  Listing: 'Incomplete listing',
  Leads: 'Slow lead follow-up',
  Market: 'Market shift',
  Recon: 'Long reconditioning',
  Ops: 'Not available to test drive',
  Funnel: 'Leads not becoming visits',
};

// col: 0 = Recommended, 1 = In progress, 2 = Done
export const SEED_ACTIONS = [
  { id: 1, car: 'U2417', a: 'Reshoot: 28+ real photos, replace stock main image', r: 'Too few real photos', o: 'Lot porter', due: 'Mon', col: 0 },
  { id: 2, car: 'U2417', a: 'Reassign 5 open leads; call back today', r: 'Slow lead follow-up', o: 'Sales manager', due: 'Today', col: 1 },
  { id: 3, car: 'U2417', a: 'Review price gap in pricing meeting (no price set here)', r: 'Price now above comparables', o: 'Used-car manager', due: 'Tue', col: 0 },
  { id: 4, car: 'U2440', a: 'Attach history report; complete features and description', r: 'Listing incomplete', o: 'Merchandiser', due: 'Today', col: 1 },
  { id: 5, car: 'U2448', a: 'Route leads to BDC to speed up first response', r: 'Slow lead follow-up', o: 'BDC lead', due: 'Today', col: 0 },
  { id: 6, car: 'U2437', a: 'Fix marketplace feed: price missing on one site', r: 'Listing incomplete', o: 'Merchandiser', due: 'Today', col: 2 },
  { id: 7, car: 'U2391', a: 'Hold: pickup market slowed; recheck in 7 days', r: 'Market shift in pickups', o: 'Used-car manager', due: 'Fri', col: 0 },
  { id: 8, car: 'U2419', a: 'Add photos; flag price gap for review', r: 'Price above comparables', o: 'Used-car manager', due: 'Mon', col: 0 },
  { id: 9, car: 'U2402', a: 'Log recon delay cause (parts wait) for process review', r: 'Long reconditioning', o: 'Service manager', due: 'Wed', col: 2 },
];

// Cars sold so far this month (1–21 Nov 2026). Days to sell = arrival to sale.
export const SALES_THIS_MONTH = [
  { id: 'U2390', name: '2020 Honda Accord Sport', seg: 'Midsize sedan', daysToSell: 22, soldOn: '3 Nov' },
  { id: 'U2398', name: '2019 Toyota Corolla LE', seg: 'Compact sedan', daysToSell: 14, soldOn: '4 Nov' },
  { id: 'U2401', name: '2021 Mazda CX-5 Touring', seg: 'Compact SUV', daysToSell: 26, soldOn: '6 Nov' },
  { id: 'U2405', name: '2018 Ford Explorer XLT', seg: 'Midsize SUV', daysToSell: 41, soldOn: '8 Nov' },
  { id: 'U2409', name: '2020 Hyundai Tucson SEL', seg: 'Compact SUV', daysToSell: 19, soldOn: '10 Nov' },
  { id: 'U2412', name: '2022 Nissan Altima SV', seg: 'Midsize sedan', daysToSell: 17, soldOn: '12 Nov' },
  { id: 'U2415', name: '2019 Chevrolet Silverado LT', seg: 'Pickup', daysToSell: 35, soldOn: '15 Nov' },
  { id: 'U2421', name: '2021 Kia Seltos S', seg: 'Compact SUV', daysToSell: 21, soldOn: '18 Nov' },
  { id: 'U2426', name: '2020 Volkswagen Tiguan SE', seg: 'Compact SUV', daysToSell: 30, soldOn: '20 Nov' },
];

export const MARKET_SHIFTS = [
  { t: 'Pickup cohort slowed', e: 'Median days to sell 24 → 33 in 30 days; local supply +18%. Affects U2391.' },
  { t: 'Used compact EVs slowed', e: 'Median 34 → 47 days this month. Affects U2455, U2452.' },
];

// Month-end history for the Reports page. The last value (Nov) is computed from today's stock.
export const HISTORY_MONTHS = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
export const HISTORY_SHARE_PAST_RANGE = [36, 39, 35, 41, 46];
export const HISTORY_AVG_DAYS_IN_STOCK = [44, 43, 41, 42, 42];

// Buyer funnel (mock). Only U2417 has funnel data in this demo; other cars show "not available".
export const FUNNEL = {
  U2417: [
    ['Search impressions / day', 210, 240, 210 / 240],
    ['Detail-page views / day', 9, 21, 9 / 21],
    ['View-to-lead rate', '1.1%', '2.4%', 1.1 / 2.4],
    ['First lead response', '4 h 12 m', '22 m', 22 / 252],
    ['Leads to visits', '1 of 5', '31%', 20 / 31],
  ],
};
export const FUNNEL_STAGES = {
  U2417: [['Seen', '210/day', false], ['Viewed', '9/day', true], ['Contacted', '5 leads', false], ['Visited', '1', true], ['Sold', '—', false]],
};
