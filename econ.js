// Stacked money model. No DOM: game.js and tests/econ.test.mjs share it.
// All money in AED. Every number here is a game rule (illustrative), not a statistic, unless README "Facts and sources" says so.
export const MONTHS = 8; // paydays in a run
export const OFFERS_PER_MONTH = 3;
export const FREE = 1800; // AED a month left after rent, transport and what you send home (the player's job in the game)
export const START_CASH = 800; // in the wallet on day one
export const SPLIT = 4; // pay in 4: one today, three on the next three paydays
export const LATE_FEE = 50; // game rule, per missed instalment (illustrative; see README for the UAE fee cap)
export const LIMIT = 7000; // the game's BNPL app lets you owe at most this much across open plans
export const MAKE_DO = 0.4; // skipping a need costs 40% of its price next payday (taxis instead of the car, eating out with no fridge)
export const NEED_PAIN = 4; // good days lost when a need is skipped (no car for a month is a bad month)
export const OFFER_SECONDS = 9; // the offer timer; calm mode turns it off

// Wants: price in AED and the good days they bring. Needs: they come back as a cost if skipped.
export const WANTS = [
  { id: 'sneakers', aed: 450, joy: 2 }, { id: 'concert', aed: 600, joy: 3 }, { id: 'headphones', aed: 900, joy: 2 },
  { id: 'watch', aed: 1500, joy: 2 }, { id: 'console', aed: 2000, joy: 4 }, { id: 'phone', aed: 3200, joy: 4 },
  { id: 'sofa', aed: 2800, joy: 3 }, { id: 'trip', aed: 2600, joy: 5 }, { id: 'perfume', aed: 380, joy: 1 },
  { id: 'jacket', aed: 700, joy: 2 }, { id: 'dinner', aed: 320, joy: 2 }, { id: 'tv', aed: 2400, joy: 3 },
];
export const NEEDS = [
  { id: 'car', aed: 1600, win: [2, 3] }, { id: 'fridge', aed: 1900, win: [4, 5] }, { id: 'school', aed: 2400, win: [6, 7] },
];
export const BANKS = ['car', 'lease']; // who reads the report at the end: a car loan or the lease renewal

export function rng(seed) { // mulberry32: same seed, same season
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Fisher-Yates with our rng: the same seed gives the same order in every JS engine (sort with a random comparator does not).
function shuffle(a, r) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const jitter = (r, aed) => Math.round(aed * (0.9 + 0.2 * r()) / 10) * 10;

// The season: offers[m] = the offers of month m (1..MONTHS). One need lands in its window, the rest are wants.
export function season(seed) {
  const r = rng(seed);
  const offers = {};
  const needAt = NEEDS.map(n => ({ ...n, m: n.win[0] + Math.floor(r() * (n.win[1] - n.win[0] + 1)) }));
  let bag = [];
  for (let m = 1; m <= MONTHS; m++) {
    offers[m] = [];
    for (const n of needAt.filter(x => x.m === m)) offers[m].push({ id: n.id, need: true, aed: jitter(r, n.aed), joy: 0 });
    while (offers[m].length < OFFERS_PER_MONTH) {
      if (!bag.length) bag = shuffle([...WANTS], r);
      const w = bag.pop();
      offers[m].push({ id: w.id, need: false, aed: jitter(r, w.aed), joy: w.joy });
    }
    shuffle(offers[m], r);
  }
  return { seed, offers, bank: BANKS[Math.floor(r() * BANKS.length)] };
}

export function newRun(seed) {
  return { ...season(seed), m: 1, cash: START_CASH, plans: [], makeDo: 0, fees: 0, joy: 0, bought: [], skippedNeeds: [],
    missed: 0, committed: [], log: [] };
}

// What is already booked on payday m (the height of that column).
export function column(s, m) {
  return s.plans.reduce((t, p) => t + p.due.filter(d => d.m === m && !d.paid).reduce((a, d) => a + d.aed, 0), 0);
}
export const owed = s => s.plans.reduce((t, p) => t + p.due.filter(d => !d.paid).reduce((a, d) => a + d.aed, 0), 0);
export const red = s => s.plans.some(p => p.red && p.due.some(d => !d.paid));
export const quarter = aed => Math.ceil(aed / SPLIT);

// Can the player do this with this offer right now? Returns null when yes, else the reason (a string key for i18n).
export function blocked(s, o, act) {
  if (act === 'now' && s.cash < o.aed) return 'noCash';
  if (act === 'split') {
    if (red(s)) return 'paused';
    if (s.cash < quarter(o.aed)) return 'noCash';
    if (owed(s) + o.aed - quarter(o.aed) > LIMIT) return 'limit';
  }
  return null;
}

export function choose(s, o, act) {
  if (blocked(s, o, act)) act = 'skip';
  if (act === 'now') { s.cash -= o.aed; take(s, o); }
  if (act === 'split') {
    const q = quarter(o.aed), last = o.aed - 3 * q;
    s.cash -= q;
    s.plans.push({ id: o.id, aed: o.aed, red: false, due: [1, 2, 3].map(k => ({ m: s.m + k, aed: k === 3 ? last : q, paid: false })) });
    take(s, o);
  }
  if (act === 'skip' && o.need) { s.joy -= NEED_PAIN; s.makeDo += Math.round(o.aed * MAKE_DO); s.skippedNeeds.push(o.id); }
  s.log.push({ m: s.m, id: o.id, act });
  return act;
}
function take(s, o) { s.joy += o.joy; s.bought.push(o.id); }

// Payday m: the month's money arrives, make-do costs go first, then each instalment due, oldest plan first.
// An instalment the wallet cannot cover is missed: a late fee is added and it moves to the next payday; the plan turns red.
export function payday(s) {
  s.committed.push(column(s, s.m) / FREE);
  s.cash += FREE;
  const makeDo = Math.min(s.cash, s.makeDo);
  s.cash -= makeDo; s.makeDo -= makeDo;
  const paid = [], missed = [];
  for (const p of s.plans) {
    for (const d of p.due.filter(x => x.m === s.m && !x.paid)) {
      if (s.cash >= d.aed) { s.cash -= d.aed; d.paid = true; paid.push({ id: p.id, aed: d.aed }); continue; }
      d.m += 1; d.aed += LATE_FEE; s.fees += LATE_FEE; s.missed++; p.red = true; missed.push({ id: p.id, aed: d.aed });
    }
    if (p.due.every(d => d.paid)) p.red = false; // a plan paid off clears from the panel
  }
  return { makeDo, paid, missed };
}

// The bank reads the report after the last month: missed instalments and what is still owed against the monthly money.
export function bankDecision(s) {
  const o = owed(s);
  if (s.missed >= 2 || o > 2 * FREE) return 'declined';
  if (s.missed === 1 || o > FREE) return 'conditions';
  return 'approved';
}

export function summary(s) {
  const avg = s.committed.reduce((a, b) => a + b, 0) / s.committed.length;
  return { decision: bankDecision(s), owed: owed(s), fees: s.fees, missed: s.missed, joy: s.joy, cash: s.cash,
    bought: s.bought.length, skippedNeeds: s.skippedNeeds.length, committedAvg: avg, committedMax: Math.max(...s.committed),
    nextMonth: column(s, s.m + 1) / FREE };
}

// Strategies for the balance tests and ?autoplay. Each looks at the wallet and the columns the player can see.
export const STRATEGIES = {
  alwaysSplit: (s, o) => (!blocked(s, o, 'split') ? 'split' : !blocked(s, o, 'now') ? 'now' : 'skip'),
  neverSplit: (s, o) => (!blocked(s, o, 'now') ? 'now' : 'skip'),
  splitNeedsOnly: (s, o) => (o.need ? (!blocked(s, o, 'now') ? 'now' : 'split') : (s.cash - o.aed >= 600 ? 'now' : 'skip')),
  // read the future: split only if the next three columns stay under half the monthly money
  planner: (s, o) => {
    const q = quarter(o.aed), fits = [1, 2, 3].every(k => column(s, s.m + k) + q <= FREE / 2);
    if (o.need) return !blocked(s, o, 'now') && (s.cash - o.aed >= 300 || !fits) ? 'now' : 'split';
    if (s.cash - o.aed >= 500) return 'now';
    return fits && o.joy >= 3 ? 'split' : 'skip';
  },
};

export function play(seed, decide) {
  const s = newRun(seed);
  for (s.m = 1; s.m <= MONTHS; s.m++) {
    payday(s);
    for (const o of s.offers[s.m]) choose(s, o, decide(s, o));
  }
  s.m = MONTHS;
  return s;
}
export function simulate(strategy, seed) {
  const decide = typeof strategy === 'function' ? strategy : STRATEGIES[strategy];
  return summary(play(seed, decide));
}
// Many seasons per strategy: the table the concept doc quotes (tests/econ.test.mjs locks it).
export function table(n = 500) {
  const out = {};
  for (const k of Object.keys(STRATEGIES)) {
    const runs = Array.from({ length: n }, (_, i) => simulate(k, i + 1));
    const pct = f => Math.round(100 * runs.filter(f).length / n);
    const mean = f => Math.round(runs.reduce((a, r) => a + f(r), 0) / n);
    out[k] = { approved: pct(r => r.decision === 'approved'), declined: pct(r => r.decision === 'declined'),
      fees: mean(r => r.fees), joy: mean(r => r.joy), cash: mean(r => r.cash), skippedNeeds: mean(r => r.skippedNeeds * 100) / 100,
      committed: mean(r => r.committedAvg * 100) };
  }
  return out;
}
