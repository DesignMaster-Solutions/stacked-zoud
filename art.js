// Item pictograms, drawn for Stacked (24x24, one stroke style). No DOM: game.js and tests/art.test.mjs share it.
const P = {
  sneakers: 'M2 16h20v3H2zM3 16c0-4 1-7 3-8l3 3 3-1 2 3 6 1c1 0 2 1 2 2',
  concert: 'M3 7h18v4a2 2 0 0 0 0 2v4H3v-4a2 2 0 0 0 0-4zM9 7v10',
  headphones: 'M4 15v-3a8 8 0 0 1 16 0v3M3 15h4v5H3zM17 15h4v5h-4z',
  watch: 'M8 2h8l1 4H7zM7 18h10l-1 4H8zM7 6h10v12H7zM12 9v3l2 2',
  console: 'M6 8h12a4 4 0 0 1 4 4v3a3 3 0 0 1-5 2l-2-2H9l-2 2a3 3 0 0 1-5-2v-3a4 4 0 0 1 4-4zM7 11v4M5 13h4M16 12h.01M18 14h.01',
  phone: 'M7 2h10v20H7zM11 18h2',
  sofa: 'M4 10V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M2 11h4v4h12v-4h4v7H2zM4 18v2M20 18v2',
  trip: 'M2 16l20-8-4 10-5-3-3 4v-5zM13 15l9-7',
  perfume: 'M10 2h4v3h-4zM8 5h8v3H8zM6 8h12v13H6zM9 13h6',
  jacket: 'M8 3l4 3 4-3 5 4-2 4-2-1v11H7V10l-2 1-2-4zM12 6v15',
  dinner: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 4v6M22 4v16',
  tv: 'M2 5h20v13H2zM8 22h8M12 18v4',
  car: 'M3 13l2-6h14l2 6v5H3zM3 13h18M7 18v2M17 18v2M7 15.5h.01M17 15.5h.01',
  fridge: 'M6 2h12v20H6zM6 9h12M9 5v2M9 12v4',
  school: 'M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5M22 9v6',
};
export const IDS = Object.keys(P);
export function icon(id, cls = 'ic') {
  return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${P[id] || P.dinner}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
