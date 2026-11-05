// docs/BUDGET.md adds up: lines, subtotal, contingency, total and the funding-level rows.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const doc = readFileSync(process.env.BUDGET_MD || new URL('../docs/BUDGET.md', import.meta.url), 'utf8');
const num = s => Number(s.replace(/[^\d.]/g, ''));
const lines = doc.split('\n').filter(l => /^\| \d \|/.test(l)).map(l => l.split('|').map(c => c.trim()));
const cost = Object.fromEntries(lines.map(c => [c[1], num(c[4])]));

test('each line is hours x rate, and the totals add up', () => {
  const rate = num(doc.match(/US\$ (\d+)\/hour/)[1]);
  for (const c of lines) assert.equal(num(c[4]), num(c[3]) * rate, `line ${c[1]}`);
  const sub = Object.values(cost).reduce((a, b) => a + b, 0);
  const hours = lines.reduce((a, c) => a + num(c[3]), 0);
  assert.ok(doc.includes(`**${hours}** | **${sub.toLocaleString('en-US')}**`), 'subtotal');
  assert.ok(doc.includes(`Contingency (10%) | | ${(sub / 10).toLocaleString('en-US')}`), 'contingency');
  assert.ok(doc.includes(`**Total** | | **${(sub * 1.1).toLocaleString('en-US')}**`), 'total');
});
test('funding levels: the lines named add up to the amount shown', () => {
  for (const row of doc.split('\n').filter(l => /^\| \$[\d,]+ \| Lines /.test(l))) {
    const ids = row.match(/Lines ([\d, and]+) =/)[1].match(/\d/g);
    const sum = ids.reduce((a, i) => a + cost[i], 0);
    assert.ok(row.includes(`= $${sum.toLocaleString('en-US')} + 10% contingency = $${Math.round(sum * 1.1).toLocaleString('en-US')}`), row);
  }
});
