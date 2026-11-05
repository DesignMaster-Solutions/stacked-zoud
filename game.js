// Stacked: the screens. The money lives in econ.js, the words in i18n.js, the settings in a11y.js.
import * as E from './econ.js?v=1';
import * as A from './a11y.js?v=1';
import * as I from './i18n.js?v=1';

const params = new URLSearchParams(location.search);
function load(k) { try { return localStorage.getItem(k); } catch { return null; } }
function save(k, v) { try { localStorage.setItem(k, v); } catch { /* storage blocked in some iframes: settings just do not persist */ } }

let S = A.parseSettings(location.search, load(A.STORAGE_KEY));
let lang = I.pickLang(location.search, load(I.STORAGE_KEY), navigator.language);
const app = document.getElementById('app');
const auto = params.has('autoplay') ? (E.STRATEGIES[params.get('autoplay')] ? params.get('autoplay') : 'planner') : null;
const fast = params.has('fast');

let run, phase, idx = 0, pd = null, dropped = null, paused = false, timer = null, left = 0;
const T = (k, v) => A.plain(I.t(k, lang, v), S, lang);
const money = x => I.aed(x, lang);
const item = id => T('i_' + id);
const moving = () => !S.calm && !matchMedia('(prefers-reduced-motion: reduce)').matches;
const offer = () => run.offers[run.m][idx];

// ---------- sound: tiny WebAudio blips, nothing downloaded ----------
let ac;
function blip(freqs, type = 'sine', dur = 0.12) {
  if (S.mute) return;
  try {
    ac = ac || new AudioContext();
    freqs.forEach((f, i) => {
      const o = ac.createOscillator(), g = ac.createGain(), t0 = ac.currentTime + i * dur * 0.8;
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0.12, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      o.connect(g).connect(ac.destination); o.start(t0); o.stop(t0 + dur);
    });
  } catch { /* no audio: the game still plays */ }
}
const SND = { drop: () => blip([520, 390, 260], 'triangle', 0.08), coin: () => blip([880, 1320], 'triangle'), tick: () => blip([440], 'square', 0.04),
  crash: () => blip([220, 150, 90], 'sawtooth', 0.22), good: () => blip([523, 659, 784], 'sine', 0.15), tap: () => blip([660], 'sine', 0.05) };

function applySettings() {
  document.body.className = A.KEYS.filter(k => S[k]).join(' ');
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

// One hue per item, so a plan reads as the same colour in every column and on the report.
const HUES = { sneakers: 12, concert: 330, headphones: 280, watch: 200, console: 250, phone: 190, sofa: 30, trip: 160, perfume: 300,
  jacket: 45, dinner: 0, tv: 220, car: 100, fridge: 175, school: 60 };
const hue = id => HUES[id] ?? 0;

// ---------- the future board: one column per coming payday, the money line on top ----------
const SCALE = 120 / E.FREE; // px per AED, so the money line sits at 120 px
function board() {
  const o = phase === 'offer' ? offer() : null;
  const ghost = o && !E.blocked(run, o, 'split') ? E.quarter(o.aed) : 0;
  const cols = [1, 2, 3, 4].map(k => {
    const m = run.m + k;
    const blocks = [];
    for (const p of run.plans) for (const d of p.due) if (d.m === m && !d.paid) blocks.push({ id: p.id, aed: d.aed, red: p.red, fresh: dropped === p });
    const total = blocks.reduce((a, b) => a + b.aed, 0);
    const over = total > E.FREE;
    const html = blocks.map((b, i) => `<i class="blk${b.red ? ' late' : ''}${b.fresh && moving() ? ' drop' : ''}" style="--h:${Math.max(10, b.aed * SCALE)}px;--hue:${hue(b.id)};--d:${k * 90 + i * 20}ms" title="${item(b.id)} ${money(b.aed)}"><span>${money(b.aed)}</span></i>`).join('')
      + (ghost && k <= 3 ? `<i class="blk ghost" style="--h:${ghost * SCALE}px;--hue:${hue(o.id)}"><span>+${money(ghost)}</span></i>` : '');
    const pct = Math.round(100 * total / E.FREE);
    return `<div class="col${over ? ' over' : ''}" data-m="${m}"><div class="stack">${html}<b class="line" style="bottom:${E.FREE * SCALE}px"></b></div>
      <div class="foot"><b>${m <= E.MONTHS ? T('pay', { n: m }) : T('pay', { n: m }) + '*'}</b><span>${pct}%</span></div></div>`;
  }).join('');
  return `<section class="board" aria-label="${T('future')}"><h2>${T('future')} <small class="muted">${T('yourMoney', { x: money(E.FREE) })}</small></h2>
    <div class="cols">${cols}</div>${ghost ? `<p class="muted small">${T('ghost')}</p>` : ''}</section>`;
}

function hud() {
  return `<header class="hud"><span>${T('month', { n: Math.min(run.m, E.MONTHS) })}</span><span>${T('wallet')} <b data-k="cash">${money(run.cash)}</b></span>
    <span>${T('owed')} <b class="${E.red(run) ? 'minus' : ''}">${money(E.owed(run))}</b></span><span>${T('goodDays')} <b>${run.joy}</b></span>
    <button class="link" data-act="pause">${T('pause')}</button></header>`;
}

function report() {
  const rows = run.plans.map(p => {
    const left = p.due.filter(d => !d.paid).reduce((a, d) => a + d.aed, 0);
    const st = left === 0 ? 'closed' : p.red ? 'late' : 'onTime';
    return `<li class="${st}" style="--hue:${hue(p.id)}"><i></i>${item(p.id)} <span>${T(st)}${left ? ' · ' + money(left) : ''}</span></li>`;
  }).join('');
  return `<aside class="report${E.red(run) ? ' red' : ''}"><h2>${T('report')}</h2>${rows ? `<ul>${rows}</ul>` : `<p class="muted small">${T('reportEmpty')}</p>`}</aside>`;
}

// ---------- the offer card ----------
function offerCard() {
  const o = offer();
  const q = E.quarter(o.aed);
  const why = a => { const b = E.blocked(run, o, a); return b ? T('why_' + b) : ''; };
  const timed = !S.calm && !auto;
  return `<section class="offer${o.need ? ' need' : ''}" style="--hue:${hue(o.id)}" data-id="${o.id}">
    <div class="tag">${o.need ? T('need') : T('want')} · ${T('offerOf', { i: idx + 1 })}</div>
    <div class="name">${item(o.id)}</div><div class="price">${money(o.aed)}</div>
    ${o.need ? `<p class="small">${T('skipNeed', { x: money(Math.round(o.aed * E.MAKE_DO)) })}</p>` : ''}
    ${timed ? `<div class="clock"><i style="width:100%"></i></div>` : ''}
    <div class="actions">
      <button class="primary" data-act="now" ${why('now') ? 'disabled' : ''} title="${why('now')}">${T('payNow', { x: money(o.aed) })}</button>
      <button class="primary alt" data-act="split" ${why('split') ? 'disabled' : ''} title="${why('split')}">${T('split', { x: money(q) })}</button>
      <button class="link" data-act="skip">${T('skip')}</button>
    </div>
    <p class="small why">${[why('now'), why('split')].filter(Boolean).join(' · ')}</p></section>`;
}

function paydayCard() {
  const lines = [`<div><span>${T('income')}</span><span class="plus">+${money(E.FREE)}</span></div>`]
    .concat(pd.makeDo ? [`<div><span>${T('makeDo')}</span><span class="minus">-${money(pd.makeDo)}</span></div>`] : [])
    .concat(pd.paid.map(p => `<div class="ok"><span>${T('paidInst', { item: item(p.id) })}</span><span>-${money(p.aed)}</span></div>`))
    .concat(pd.missed.map(p => `<div class="bad"><span>${T('missedInst', { item: item(p.id), fee: money(E.LATE_FEE) })}</span><span>${money(p.aed)}</span></div>`));
  return `<section class="payday${pd.missed.length ? ' crash' : ''}"><h2>${T('paydayTitle', { n: run.m })}</h2>
    <div class="ledger">${lines.join('')}</div><p class="verdict">${pd.missed.length ? T('collapse') : T('clean')}</p>
    <div class="actions"><button class="primary" data-act="cont">${T('nextOffer')}</button></div></section>`;
}

// ---------- screens ----------
const chips = () => A.KEYS.map(k => `<button class="chip" data-a11y="${k}" aria-pressed="${S[k]}">${T('a11y_' + k)}</button>`).join('');
function title() {
  phase = 'title';
  app.innerHTML = `<div class="hero" aria-hidden="true">${heroArt()}</div><h1>${T('title')}</h1><p class="tagline">${T('tagline')}</p>
    <div class="panel"><p>${T('how1')}</p><p>${T('how2')}</p><p>${T('how3')}</p><p>${T('how4')}</p></div>
    <div class="row"><button class="chip" data-lang="en" aria-pressed="${lang === 'en'}">English</button><button class="chip" data-lang="ar" aria-pressed="${lang === 'ar'}">العربية</button></div>
    <p class="muted">${T('settings')}</p><div class="row">${chips()}</div>
    <div class="actions"><button class="primary" data-act="start">${T('start')}</button></div><p class="muted small">${T('illustrative')}</p>`;
}
// Four falling blocks over three paydays: the idea in one picture.
function heroArt() {
  const b = (x, y, h, c, d) => `<rect class="hb" style="--d:${d}ms" x="${x}" y="${y}" width="56" height="${h}" rx="6" fill="hsl(${c} 70% 58%)"/>`;
  return `<svg viewBox="0 0 320 150" role="img"><line x1="10" y1="62" x2="310" y2="62" stroke="#f2b134" stroke-dasharray="6 5" stroke-width="2"/>
    ${b(40, 110, 30, 12, 0)}${b(110, 80, 60, 330, 120)}${b(110, 110, 30, 12, 200)}${b(180, 40, 100, 200, 300)}${b(250, 110, 30, 12, 400)}
    <line x1="10" y1="141" x2="310" y2="141" stroke="#9fb3bf" stroke-width="2"/></svg>`;
}

function play() {
  stopTimer();
  if (phase === 'end') return endScreen();
  app.innerHTML = `${hud()}<div class="layout"><div class="main">${board()}${phase === 'offer' ? offerCard() : paydayCard()}</div>${report()}</div>`;
  dropped = null;
  if (phase === 'offer') startTimer();
  if (phase === 'payday' && pd.missed.length) { SND.crash(); if (moving()) app.querySelector('.board')?.classList.add('shake'); }
  if (auto) setTimeout(autoStep, fast ? 120 : 900);
}

function startTimer() {
  if (S.calm || auto || paused) return;
  left = E.OFFER_SECONDS * 10;
  timer = setInterval(() => {
    if (paused) return;
    left--;
    const bar = app.querySelector('.clock i');
    if (bar) { bar.style.width = `${100 * left / (E.OFFER_SECONDS * 10)}%`; bar.parentElement.classList.toggle('low', left < 30); }
    if (left % 10 === 0 && left < 30 && left > 0) SND.tick();
    if (left <= 0) act('skip');
  }, 100);
}
function stopTimer() { clearInterval(timer); timer = null; }

function act(a) {
  stopTimer();
  const o = offer();
  const done = E.choose(run, o, a);
  if (done === 'split') { dropped = run.plans[run.plans.length - 1]; SND.drop(); }
  else if (done === 'now') SND.coin(); else SND.tap();
  idx++;
  if (idx >= run.offers[run.m].length) {
    if (run.m >= E.MONTHS) { phase = 'end'; return play(); }
    run.m++; pd = E.payday(run); phase = 'payday'; idx = 0;
  }
  play();
}

function endScreen() {
  const s = E.summary(run);
  const pct = x => `${Math.round(100 * x)}%`;
  const rows = [['sumCommitted', pct(s.committedAvg)], ['sumNext', pct(s.nextMonth)], ['sumFees', money(s.fees)], ['sumOwed', money(s.owed)],
    ['sumBought', s.bought], ['sumSkipped', s.skippedNeeds], ['sumCash', money(s.cash)], ['sumJoy', s.joy]];
  app.innerHTML = `<section class="end ${s.decision}"><p>${T('bankReads', { bank: T(run.bank === 'car' ? 'bankCar' : 'bankLease') })}</p>
    <div class="stamp" data-decision="${s.decision}">${T('dec_' + s.decision)}</div><p>${T('why_' + s.decision)}</p>
    <div class="stats">${rows.map(([k, v]) => `<div><span>${T(k)}</span><b>${v}</b></div>`).join('')}</div>
    ${report()}<div class="actions"><button class="primary" data-act="again">${T('again')}</button></div><p class="muted small">${T('illustrative')}</p></section>`;
  if (s.decision === 'approved') SND.good(); else SND.crash();
}

function start(seed) {
  run = E.newRun(seed);
  E.payday(run); // month 1: the money for the month arrives, nothing is booked yet
  phase = 'offer'; idx = 0; play();
}

// ?autoplay: the chosen strategy presses the real buttons, so the video and the e2e test go through the same screens.
function autoStep() {
  if (paused) return setTimeout(autoStep, 300);
  if (phase === 'offer') {
    const a = E.STRATEGIES[auto](run, offer());
    app.querySelector(`[data-act=${a}]:not([disabled])`)?.click() || app.querySelector('[data-act=skip]').click();
  } else if (phase === 'payday') app.querySelector('[data-act=cont]').click();
}

app.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  if (b.dataset.a11y) { S = A.toggle(S, b.dataset.a11y); save(A.STORAGE_KEY, JSON.stringify(S)); applySettings(); return title(); }
  if (b.dataset.lang) { lang = b.dataset.lang; save(I.STORAGE_KEY, lang); applySettings(); return title(); }
  const a = b.dataset.act;
  if (a === 'start') start(Number(params.get('seed')) || Math.floor(Math.random() * 1e9));
  if (['now', 'split', 'skip'].includes(a)) act(a);
  if (a === 'cont') { phase = 'offer'; play(); }
  if (a === 'again') title();
  if (a === 'pause') togglePause();
});
function togglePause() {
  paused = !paused;
  document.querySelector('.overlay')?.remove();
  if (paused) document.body.insertAdjacentHTML('beforeend', `<div class="overlay" role="dialog" aria-modal="true"><div class="panel"><h2>${T('paused')}</h2><button class="primary" id="resume">${T('resume')}</button></div></div>`);
  document.getElementById('resume')?.addEventListener('click', togglePause);
}
document.addEventListener('keydown', e => { if (e.key === 'Escape' && phase !== 'title') togglePause(); });

applySettings();
if (auto) start(Number(params.get('seed')) || 7); else title();
