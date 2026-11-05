import test from 'node:test';
import assert from 'node:assert/strict';
import * as Art from '../art.js';
import * as E from '../econ.js';
test('every item in the model has its own pictogram', () => {
  for (const x of [...E.WANTS, ...E.NEEDS]) assert.ok(Art.IDS.includes(x.id), x.id);
  assert.equal(new Set(Art.IDS.map(id => Art.icon(id))).size, Art.IDS.length, 'no two items share a drawing');
});
