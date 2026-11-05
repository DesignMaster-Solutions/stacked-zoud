// Accessibility settings for Stacked (same pattern as our Snowball entry). No DOM: game.js and tests share it.
export const KEYS = ['large', 'contrast', 'calm', 'plain', 'mute'];
export const STORAGE_KEY = 'stacked.a11y';

// Saved settings first, then ?a11y=large,calm on top (a judge or teacher can link a mode).
export function parseSettings(search, stored) {
  const s = Object.fromEntries(KEYS.map(k => [k, false]));
  try { for (const k of KEYS) if (JSON.parse(stored || '{}')[k] === true) s[k] = true; } catch { /* broken storage = defaults */ }
  const q = new URLSearchParams(search).get('a11y');
  if (q !== null) for (const k of q.split(',')) if (KEYS.includes(k)) s[k] = true;
  return s;
}
export function toggle(s, key) { return { ...s, [key]: !s[key] }; }

// Plain words: money words swapped for everyday ones; the numbers stay the same.
const PLAIN = {
  en: [
    ['instalments', 'payments'], ['instalment', 'payment'], ['late fee', 'charge for paying late'],
    ['credit report', 'record banks read'], ['committed', 'already promised'],
  ],
  ar: [
    ['الأقساط', 'الدفعات'], ['القسط', 'الدفعة'], ['رسوم التأخير', 'مبلغ إضافي لأنك تأخرت'], ['التقرير الائتماني', 'السجل الذي تقرأه البنوك'],
  ],
};
export function plain(text, s, lang = 'en') {
  if (!s.plain) return text;
  let t = text;
  for (const [from, to] of PLAIN[lang] || []) t = t.split(from).join(to);
  return t;
}
