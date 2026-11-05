// The strategy table and the numbers in docs/CONCEPT.md must say what the money model does.
// If econ.js changes: update CONCEPT.md from E.table(500), then run docs/pdf.sh.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as E from '../econ.js';

const doc = readFileSync(process.env.CONCEPT_MD || new URL('../docs/CONCEPT.md', import.meta.url), 'utf8');
const ROWS = { 'Split whenever the app allows': 'alwaysSplit', 'Never split': 'neverSplit',
  'Split only needs you cannot pay now': 'splitNeedsOnly', 'Read the columns': 'planner' };
const fmt = n => Math.round(n).toLocaleString('en-US');

test('CONCEPT.md strategy table matches E.table(500)', () => {
  const t = E.table(500);
  for (const [label, k] of Object.entries(ROWS)) {
    const line = doc.split('\n').find(l => l.startsWith(`| ${label}`));
    assert.ok(line, `row "${label}"`);
    const r = t[k];
    assert.deepEqual(line.split('|').slice(2, -1).map(c => c.trim()),
      [`${r.approved}%`, `${r.declined}%`, fmt(r.fees), fmt(r.joy), fmt(r.cash), String(r.skippedNeeds), `${r.committed}%`], label);
  }
  assert.ok(doc.includes(`spends ${t.alwaysSplit.committed}% of each payday before it arrives and gets declined in ${t.alwaysSplit.declined}% of seasons`));
  assert.ok(doc.includes(`about ${t.neverSplit.skippedNeeds.toFixed(1)} needs a season`));
});
test('CONCEPT.md game values match econ.js', () => {
  assert.ok(doc.includes(`AED ${fmt(E.FREE)} arrives`));
  assert.ok(doc.includes(`${E.MONTHS * E.OFFERS_PER_MONTH} offers`));
  assert.ok(doc.includes(`costs ${Math.round(E.MAKE_DO * 100)}% of its price`));
  assert.ok(doc.includes(`the AED ${E.LATE_FEE} late fee`));
  assert.ok(doc.includes(`at 30% of the price`) && E.FEE_CAP === 0.30);
  assert.ok(doc.includes(`${E.WANTS.length} wants and ${E.NEEDS.length} needs`));
});
