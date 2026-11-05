// Every line exists in English and Arabic, and every item and reason the model can produce has words.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as I from '../i18n.js';
import * as E from '../econ.js';
import * as A from '../a11y.js';

test('every string has English and Arabic', () => {
  for (const [k, [en, ar]] of Object.entries(I.STR)) {
    assert.ok(en && ar, k);
    if (!k.startsWith('title')) assert.match(ar, /[؀-ۿ]/, `${k} Arabic is Arabic`);
  }
});
test('every item, reason and decision has words', () => {
  for (const x of [...E.WANTS, ...E.NEEDS]) assert.ok(I.STR['i_' + x.id], x.id);
  for (const r of ['noCash', 'paused', 'limit']) assert.ok(I.STR['why_' + r], r);
  for (const d of ['approved', 'conditions', 'declined']) assert.ok(I.STR['dec_' + d] && I.STR['why_' + d], d);
});
test('no real BNPL brand appears in the game text', () => {
  const all = JSON.stringify(I.STR).toLowerCase();
  for (const b of ['tabby', 'tamara', 'postpay', 'cashew', 'spotii', 'klarna', 'afterpay']) assert.ok(!all.includes(b), b);
});
test('language pick: ?lang, then saved, then the device', () => {
  assert.equal(I.pickLang('?lang=ar', 'en', 'en-US'), 'ar');
  assert.equal(I.pickLang('', 'ar', 'en-US'), 'ar');
  assert.equal(I.pickLang('', null, 'ar-AE'), 'ar');
  assert.equal(I.aed(1234.4, 'en'), 'AED 1,234');
});
test('settings: saved, then ?a11y on top; plain words keep the numbers', () => {
  const s = A.parseSettings('?a11y=calm,large', '{"mute":true}');
  assert.deepEqual([s.calm, s.large, s.mute, s.contrast], [true, true, true, false]);
  assert.equal(A.plain('A late fee of AED 50 on the instalment', { plain: true }), 'A charge for paying late of AED 50 on the payment');
});
