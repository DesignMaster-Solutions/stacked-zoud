// node --test tests/ : the money model teaches true things about pay-in-4 plans.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../econ.js';

const offer = (aed, need = false, joy = 2) => ({ id: 'x', aed, need, joy });

test('split: a quarter today, the other three land on the next three paydays', () => {
  const s = E.newRun(1);
  s.cash = 1000;
  assert.equal(E.choose(s, offer(1000), 'split'), 'split');
  assert.equal(s.cash, 750);
  assert.deepEqual([1, 2, 3, 4].map(k => E.column(s, s.m + k)), [250, 250, 250, 0]);
  assert.equal(E.owed(s), 750);
});

test('the quarters always add up to the price', () => {
  const s = E.newRun(1);
  s.cash = 1000;
  E.choose(s, offer(1010), 'split');
  assert.equal(1000 - s.cash + E.owed(s), 1010);
});

test('payday pays the column; a column taller than the wallet misses, costs a fee and turns the plan red', () => {
  const s = E.newRun(1);
  s.cash = 4000;
  E.choose(s, offer(4000), 'split'); // 1000 on each of the next 3 paydays
  E.choose(s, offer(4000), 'split'); // the limit stops a third one later; this makes the column 2000 > FREE
  s.cash = 0; s.m = 2;
  const pd = E.payday(s);
  assert.equal(pd.paid.length, 1);
  assert.equal(pd.missed.length, 1);
  assert.equal(s.fees, E.LATE_FEE);
  assert.equal(E.red(s), true);
  assert.equal(E.blocked(s, offer(100), 'split'), 'paused', 'a red plan pauses new splits');
  assert.equal(E.column(s, 3), 2 * 1000 + 1000 + E.LATE_FEE, 'the missed instalment moves to the next payday with the fee');
});

test('pay now needs the whole price; split needs the first quarter; the app has a limit', () => {
  const s = E.newRun(1);
  s.cash = 300;
  assert.equal(E.blocked(s, offer(1000), 'now'), 'noCash');
  assert.equal(E.blocked(s, offer(1000), 'split'), null);
  assert.equal(E.blocked(s, offer(1300), 'split'), 'noCash');
  s.cash = 100000;
  assert.equal(E.blocked(s, offer(E.LIMIT * 2), 'split'), 'limit');
});

test('skipping a need is not free: it costs on the next payday and takes good days', () => {
  const s = E.newRun(1);
  const joy = s.joy;
  E.choose(s, offer(1000, true, 0), 'skip');
  assert.equal(s.joy, joy - E.NEED_PAIN);
  s.m = 2; const cash = s.cash;
  E.payday(s);
  assert.equal(s.cash, cash + E.FREE - 1000 * E.MAKE_DO);
});

test('same seed, same season: 3 offers a month and every need arrives once', () => {
  assert.deepEqual(E.season(7), E.season(7));
  const s = E.season(7);
  for (let m = 1; m <= E.MONTHS; m++) assert.equal(s.offers[m].length, E.OFFERS_PER_MONTH);
  const needs = Object.values(s.offers).flat().filter(o => o.need).map(o => o.id).sort();
  assert.deepEqual(needs, E.NEEDS.map(n => n.id).sort());
});

test('the bank reads the report: missed instalments and what is still owed', () => {
  const s = E.newRun(1);
  assert.equal(E.bankDecision(s), 'approved');
  s.missed = 1; assert.equal(E.bankDecision(s), 'conditions');
  s.missed = 2; assert.equal(E.bankDecision(s), 'declined');
});

// The balance table the concept doc quotes (500 seasons per strategy). If a rule changes, update docs/CONCEPT.md with it.
test('balance: no pure strategy wins; reading the future does', () => {
  const t = E.table(500);
  assert.ok(t.alwaysSplit.declined >= 80, `always split is declined most seasons (${t.alwaysSplit.declined}%)`);
  assert.ok(t.alwaysSplit.fees > 200, 'always split pays real fees');
  assert.ok(t.alwaysSplit.committed >= 60, 'always split: most of each payday is spent before it arrives');
  assert.ok(t.neverSplit.approved >= 95 && t.neverSplit.skippedNeeds >= 1, 'never splitting is safe but leaves needs unmet');
  assert.ok(t.planner.approved >= 80 && t.planner.fees === 0 && t.planner.skippedNeeds < 0.2, 'the planner keeps a clean report and meets needs');
  assert.ok(t.planner.joy > t.neverSplit.joy && t.planner.joy > t.alwaysSplit.joy, 'and has the most good days of the three');
  assert.deepEqual(t, JSON.parse(JSON.stringify(TABLE)), 'the table quoted in docs/CONCEPT.md changed');
});
const TABLE = {"alwaysSplit":{"approved":0,"declined":98,"fees":360,"joy":20,"cash":340,"skippedNeeds":1.96,"committed":90},"neverSplit":{"approved":100,"declined":0,"fees":0,"joy":20,"cash":838,"skippedNeeds":1.58,"committed":0},"splitNeedsOnly":{"approved":100,"declined":0,"fees":0,"joy":23,"cash":1350,"skippedNeeds":0,"committed":9},"planner":{"approved":86,"declined":0,"fees":0,"joy":23,"cash":993,"skippedNeeds":0.07,"committed":37}};

test('UAE rule: total fees on one plan never pass 30% of the price (CBUAE C 3/2023, Art. 23.4)', () => {
  const s = E.newRun(1);
  s.cash = 1000;
  E.choose(s, offer(400), 'split'); // 100 a payday; a 30% cap = AED 120 in fees at most
  s.cash = 0; s.makeDo = 0;
  for (s.m = 2; s.m <= 12; s.m++) { s.cash = -E.FREE; E.payday(s); } // the month never has enough money
  assert.equal(s.fees, 120);
  assert.equal(E.owed(s), 300 + 120);
});

test('catch up: paying the late instalment now clears the pause, but the report keeps the miss', () => {
  const s = E.newRun(1);
  s.cash = 4000;
  E.choose(s, offer(4000), 'split'); E.choose(s, offer(4000), 'split');
  s.cash = 0; s.m = 2; E.payday(s); // one instalment missed
  assert.equal(E.red(s), true);
  const late = E.lateDue(s);
  assert.equal(late, 1000 + E.LATE_FEE);
  s.cash = late - 1;
  assert.equal(E.catchUp(s), false, 'not enough in the wallet');
  s.cash = late;
  assert.equal(E.catchUp(s), true);
  assert.equal(s.cash, 0);
  assert.equal(E.red(s), false);
  assert.equal(E.blocked(s, offer(100), 'split'), 'noCash');
  assert.equal(s.missed, 1, 'the bank still sees the missed instalment');
});
test('sales have a clock from month 2; bills never do, so a need cannot be lost by reading it', () => {
  const want = { id: 'tv', need: false, aed: 2400 }, need = { id: 'ac', need: true, aed: 1900 };
  assert.equal(E.hasClock({ m: 1 }, want), false);
  assert.equal(E.hasClock({ m: 2 }, want), true);
  assert.equal(E.hasClock({ m: 2 }, need), false);
  assert.ok(E.OFFER_SECONDS >= 12, 'time to read the offer and three columns');
});

test('payday flags the instalment that pays a plan off, and only that one', () => {
  const s = E.newRun(1);
  s.cash = 1000;
  E.choose(s, offer(400), 'split');
  const flags = [];
  for (s.m = 2; s.m <= 4; s.m++) flags.push(E.payday(s).paid.map(p => !!p.done));
  assert.deepEqual(flags, [[false], [false], [true]]);
});

test('column level: calm under 75% of the money line, amber up to it, over above it', () => {
  assert.equal(E.level(0), 'ok');
  assert.equal(E.level(0.75 * E.FREE), 'ok');
  assert.equal(E.level(0.75 * E.FREE + 1), 'warn');
  assert.equal(E.level(E.FREE), 'warn');
  assert.equal(E.level(E.FREE + 1), 'over');
});
