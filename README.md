# Stacked (working title)

**Every "pay in 4" lands on a payday you haven't lived yet.**

A one-thumb browser game for the [Zoud GameLab FinLit Jam](https://itch.io/jam/zoud-gamelab) (Global Game Jam + Zoud, UAE).
Third entry by Design Master Solutions, after *Snowball* (compound growth) and *Send Home* (remittances).

## The idea

It is sale season in Dubai. Offers keep arriving: sneakers, a phone, a concert, a sofa, and also the things you
need (a car repair, school fees, a fridge that died). Each offer has three buttons: **pay now**, **split in 4**, **skip**.

Splitting feels free: only a quarter leaves today. The other three quarters drop as blocks into the next paydays,
which sit on screen as columns. Each column is one month of money left after rent, transport and what you send home.
The player watches the future fill up. When a payday arrives and its column is taller than the money, an instalment
is missed: a late fee lands, the plan goes red on your credit report panel, and the next surprise has nowhere to fit.

The run ends when a bank looks at your report (car loan or lease renewal) and decides. The summary shows how much of
next month was already spent before it started, the fees, what you bought, and what you saved.

## Why this one is different

Among the 30 jam entries on 04/11/2026, the words "pay later" appear once each on the pages of 4 entries
(Rainy Day, Makola Mogul, Future Me, Rainy Day: The Budget Party Game), all of them broad money-life games; credit score
shows up as one stat among many in a few others (My DUNYA, RENT DUE, The Billionaire). None of the pages describes a game
built around **instalments stacking on future income**, which is the mechanic that makes buy-now-pay-later risky: each
plan is small, the stack is not. (Keyword scan of the 30 itch pages; re-check before the concept doc repeats it.)

## Rubric map (official weights 25/25/15/15/20 + 5 + 5)

| Criterion | How Stacked earns it |
|---|---|
| Prototype & Gameplay (25) | One screen, one thumb, 6 to 8 minute run. Falling 4-block pieces, visible future, offer timers, collapse feedback, a clear goal (reach the bank with a clean report and savings). |
| Financial Literacy Integration (25) | BNPL is credit; instalments compete with future income; missed instalments cost fees and show on the report; needs vs wants; share of next month already committed. |
| Educational Impact (15) | End-of-run report in plain words, plus the 3 or 4 questions to ask before splitting (sourced, not invented). |
| Creativity & Innovation (15) | The future as a physical stack you can see before you live it. |
| Development & Commercial Potential (20) | Financial-wellbeing module for banks, fintechs and employers; seasonal campaigns around sales periods; same engine for other credit products. |
| Localization bonus UAE (5) | AED, English + Arabic (RTL), UAE sale seasons and the UAE rules on BNPL and credit reports. |
| Inclusivity & Accessibility bonus (5) | Same package as Snowball: large text, high contrast, calm speed (no timers), simple words, sound off, pause. |

## Facts and sources

Every fact on screen, checked at the primary source on 4 November 2026 (quotes and article numbers in
[docs/FACTS.md](docs/FACTS.md)). Everything else on screen is a game rule and is labelled illustrative in the game.

| On screen | Primary source |
|---|---|
| Pay-later is short-term credit: 12 months or less, for specific goods or services, no interest, no collateral. | Central Bank of the UAE, [Finance Companies Regulation C 3/2023](https://rulebook.centralbank.ae/en/rulebook/finance-companies-regulation-0) (effective 29/9/2023), Art. 1 definition of Short-Term Credit; announced in the CBUAE [press release of 27 December 2023](https://centralbank.ae/media/izlhi5rb/cbuae-introduces-framework-for-the-regulation-of-short-term-credit-facilities_en.pdf) as the framework for "Buy-Now, Pay-Later". |
| All fees on one plan, late fees included, at most 30% of the price (the game enforces this per plan). | Same regulation, Art. 23.4: "must not exceed 30% of the original credit amount ... must not total more that 130%". |
| At most AED 20,000 or three months of verified net income, whichever is lower. | Same regulation, Art. 23.1. |
| Affordability check; providers must explain how late payment shows on the credit report. | Same regulation, Art. 23.2, 24.4 to 24.6. |
| "Before you split, ask": six questions. | Paraphrased from what Art. 24.4, 29.4, 29.6, 29.7 and 29.9 require providers to disclose. Not an official CBUAE checklist. |
| Since July 2026, pay-later plans appear on UAE credit reports; under the current model they do not change the credit score, but lenders can see them. | Etihad Credit Bureau, [press release of 27 July 2026](https://etihadbureau.ae/about/newsarticlesearchpage/newsarticles/2026/bnpllaunch) (Tabby and Tamara account information on credit reports from July 2026) and its [FAQ](https://etihadbureau.ae/Support/FAQs): "Under the current Credit Score model, BNPL reporting does not affect your Credit Score." |

Game rules (illustrative, not statistics): monthly money AED 1,800, prices, the AED 50 late fee (the regulation sets no
AED amount, only that late fees are "reasonable"), the in-game app limit, the make-do cost of skipping a need and the
bank's decision rule. BNPL apps, shops and banks in the game are **fictional**: no real brand is named, shown or rated
inside the game; the two providers above are named here only because the bureau's announcement names them.

## What the jam requires (all in the itch.io submission form)

1. Browser build on its own itch.io page, submitted to the jam.
2. Concept document in the official 6-section template, as PDF.
3. 2-minute video of real gameplay of the submitted build.
4. Game budget, as PDF.
5. AI disclosure in the form (which tools were used).

The jam closes on 15 November 2026, 23:59 AoE, with no edits after that.

## Play

**https://designmaster-solutions.github.io/stacked-zoud/** (browser, phone or desktop). Links for judges:
`?lang=ar` (Arabic, right to left), `?a11y=calm,large,contrast,plain,mute` (accessibility modes, no timer in calm),
`?autoplay=planner` or `?autoplay=alwaysSplit` (the game plays itself with that strategy), `?seed=7` (a fixed season).

## Status

First playable loop: offers, pay now / split in 4 / skip, the next four paydays as columns, late fees, credit report
panel, the bank's decision and the end summary. `npm test` runs the money model and the balance table
(500 seasons per strategy); `tests/e2e.sh <device>` plays the published build on a real device.

## License

MIT for code. Fonts and any third-party asset keep their own licences, credited in this file when added.
