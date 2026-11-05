# Stacked: 2-minute gameplay video (script)

## Promise

For a Zoud GameLab judge, this video shows one sale season of Stacked being played in the submitted build: splits stacking on
future paydays, a payday that collapses, and the bank reading the report.

Shape: feature walkthrough (real gameplay, 16:9, 1600x1000 desktop Chrome on the MiniPC, recorded with `browse minipc rec`).
No face, no voice: burned-in captions carry the words, the game's own screens carry the rest. Every frame is the published
build at https://designmaster-solutions.github.io/stacked-zoud/ (the version is in the description).

## Beats

| # | Visual | On-screen action | Caption (burned in) | Starting state | Est. s | Core/cut |
|---|---|---|---|---|---:|---|
| 1 | Title screen | Blocks fall in the hero | Every "pay in 4" lands on a payday you have not lived yet. | `?seed=7&lang=en` fresh tab | 7 | core |
| 2 | Season, greedy player | `?autoplay=alwaysSplit&pace=1500`: offers split one after another, blocks drop onto P2 to P5 | Split whenever you can: only a quarter leaves today. | `?seed=7&lang=en&autoplay=alwaysSplit&pace=1500` | 14 | core |
| 3 | Same run | Columns pass the dashed money line, a percentage turns red | The other three quarters stack on your next paydays. | continues | 12 | core |
| 4 | Same run, payday | A missed instalment: red stripes, shake, late fee line | A column taller than your money misses: late fee, red report, no new splits. | continues | 14 | core |
| 5 | Same run, end | DECLINED stamp, summary | The bank reads the report. 86% of each payday was spent before it arrived. | continues to the end | 12 | core |
| 6 | Same seed, planner | `?autoplay=planner&pace=1100`: pays now when the wallet allows, splits a need with room | Same season, read the columns first. | `?seed=7&lang=en&autoplay=planner&pace=1100` | 22 | core |
| 7 | Same run, end | APPROVED stamp, summary | Approved: no late fees, needs met, more good days. | continues to the end | 10 | core |
| 8 | End screen, facts | Scroll to "What is true in the UAE" | Real UAE rules: fees capped at 30% of the price; plans on credit reports since July 2026. | end screen of beat 7 | 10 | core |
| 9 | Arabic edition | `?lang=ar` title and first offer | English and Arabic, right to left. | `?seed=7&lang=ar` | 7 | cuttable |
| 10 | Accessibility | `?a11y=large,contrast,calm` first offer | Large text, high contrast, calm mode with no timer. | `?seed=7&a11y=large,contrast,calm` | 7 | cuttable |
| 11 | Title card | Text over the board colour | Stacked · Zoud GameLab 2026 · play free in the browser | rendered card | 5 | core |

The percentage in beat 5 is read from the recorded run, never typed from memory; if the run shows another number the caption
changes to match it.

## Chapters

00:00 The idea · 00:07 Splitting everything · 00:40 The bank says no · 00:52 Reading the columns · 01:24 UAE rules · 01:34 Arabic and accessibility

## Cut plan

Beats 9 and 10 go first if the runtime passes 2:00.

## Runtime

Captions only, no narration: 7+14+12+14+12+22+10+10+7+7+5 = 120 s.

## Description (YouTube)

Stacked, a Zoud GameLab 2026 entry (theme: Make FinLit Fun). Sale season in Dubai: every "pay in 4" lands on a payday you have not lived yet. Real gameplay of the submitted build. Play free in the browser: https://designmastersolutions.itch.io/stacked
