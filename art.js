// Item pictograms, drawn for Stacked (24x24, one stroke style). No DOM: game.js and tests/art.test.mjs share it.
const P = {
  eidoutfit: 'M9 3h6l4 4-2 2v12H7V9L5 7zM12 3v18M10 3l2 3 2-3',
  concert: 'M3 7h18v4a2 2 0 0 0 0 2v4H3v-4a2 2 0 0 0 0-4zM9 7v10',
  headphones: 'M4 15v-3a8 8 0 0 1 16 0v3M3 15h4v5H3zM17 15h4v5h-4z',
  watch: 'M8 2h8l1 4H7zM7 18h10l-1 4H8zM7 6h10v12H7zM12 9v3l2 2',
  console: 'M6 8h12a4 4 0 0 1 4 4v3a3 3 0 0 1-5 2l-2-2H9l-2 2a3 3 0 0 1-5-2v-3a4 4 0 0 1 4-4zM7 11v4M5 13h4M16 12h.01M18 14h.01',
  phone: 'M7 2h10v20H7zM11 18h2',
  majlis: 'M4 10V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M2 11h4v4h12v-4h4v7H2zM4 18v2M20 18v2',
  hatta: 'M2 20l7-11 4 6 3-4 6 9zM7 12l2 2 2-2',
  oud: 'M10 2h4v3h-4zM8 5h8v3H8zM6 8h12v13H6zM9 13h6',
  eidgifts: 'M3 9h18v4H3zM5 13h14v8H5zM12 9v12M12 9c-2-4-6-4-6-1s4 1 6 1M12 9c2-4 6-4 6-1s-4 1-6 1',
  iftar: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 4v6M22 4v16',
  tv: 'M2 5h20v13H2zM8 22h8M12 18v4',
  car: 'M3 13l2-6h14l2 6v5H3zM3 13h18M7 18v2M17 18v2M7 15.5h.01M17 15.5h.01',
  ac: 'M3 5h18v8H3zM6 10h12M7 16l-1 3M12 16v3M17 16l1 3',
  school: 'M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5M22 9v6',
};
export const IDS = Object.keys(P);
export function icon(id, cls = 'ic') {
  return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${P[id] || P.iftar}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
