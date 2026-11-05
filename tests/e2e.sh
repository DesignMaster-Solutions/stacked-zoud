#!/bin/zsh
# End-to-end on a real device through the published build: one offer split (blocks land on 3 columns), a payday,
# Arabic RTL, then a whole season by ?autoplay (planner and always-split) to the bank's decision.
# Usage: tests/e2e.sh [device] [url]   e.g. tests/e2e.sh redmi
set -euo pipefail
D=${1:-livre}; U=${2:-https://designmaster-solutions.github.io/stacked-zoud/}
fail() { print -u2 "E2E FAIL: $*"; exit 1; }
browse $D open "${U}?seed=7&lang=en&a11y=calm&v=$RANDOM" >/dev/null
browse $D wait --text "STACKED" 20 >/dev/null || fail "title"
B=$(browse $D js 'return Math.round(document.querySelector("[data-act=start]").getBoundingClientRect().bottom - innerHeight)')
[[ $B -le 0 ]] || fail "Start the season is ${B}px below the fold"
W=$(browse $D js 'return document.querySelector(".title .actions").scrollWidth - document.querySelector(".title .actions").clientWidth')
[[ $W -le 0 ]] || fail "title action row overflows by ${W}px"
browse $D click --text "Start the season" >/dev/null
browse $D wait --text "Month 1 of 8" 10 >/dev/null || fail "month 1"
[[ $(browse $D js 'return document.querySelectorAll(".col").length') == 4 ]] || fail "four payday columns"
W=$(browse $D js 'return Math.max(...[...document.querySelectorAll(".actions")].map(a => a.scrollWidth - a.clientWidth))')
[[ $W -le 0 ]] || fail "offer buttons overflow by ${W}px"
C=$(browse $D js 'const c=[...document.querySelectorAll(".actions button")].map(b => { const r = b.getBoundingClientRect(); return r.top + r.height / 2; }); return Math.round(Math.max(...c) - Math.min(...c))')
[[ $C -le 8 ]] || fail "offer buttons stacked (centres ${C}px apart)"
browse $D click '[data-act=split]' >/dev/null
[[ $(browse $D js 'return [1,2,3].map(i => document.querySelectorAll(".col")[i-1].querySelectorAll(".blk:not(.ghost)").length).join()') == "1,1,1" ]] || fail "split did not land on the next three paydays"
browse $D click '[data-act=skip]' >/dev/null
browse $D click '[data-act=skip]' >/dev/null
browse $D wait --text "Payday 2" 10 >/dev/null || fail "payday"
[[ $(browse $D text .payday) == *"instalment paid"* ]] || fail "first instalment not paid on payday 2"
W=$(browse $D js 'return document.documentElement.scrollWidth - innerWidth')
[[ $W -le 0 ]] || fail "page wider than the screen by ${W}px"
browse $D open "${U}?seed=7&lang=en&a11y=large&v=$RANDOM" >/dev/null
browse $D wait --text "STACKED" 20 >/dev/null
[[ $(browse $D js 'return getComputedStyle(document.documentElement).fontSize') == 21px ]] || fail "Large text does not enlarge the page"
browse $D open "${U}?seed=7&lang=ar&v=$RANDOM" >/dev/null
browse $D wait --text "ابدأ الموسم" 20 >/dev/null || fail "arabic title"
[[ $(browse $D js 'return document.documentElement.dir') == rtl ]] || fail "rtl"
# Sales have a clock from month 2, bills never. A tap racing the card change must not act on the next offer (seed 12: month 2 = phone, car repair, sofa).
browse $D open "${U}?seed=12&lang=en&v=$RANDOM" >/dev/null
browse $D wait --text "STACKED" 20 >/dev/null
browse $D click --text "Start the season" >/dev/null
browse $D wait --text "Month 1 of 8" 10 >/dev/null || fail "month 1 (clock block)"
[[ $(browse $D js 'return document.querySelectorAll(".clock").length') == 0 ]] || fail "month 1 has a clock"
browse $D js 'const b = () => document.querySelector("[data-act=skip]"); b().click(); b().click(); return 1' >/dev/null
[[ $(browse $D text .tag) == *"Offer 2 of 3"* ]] || fail "a double tap took two offers: $(browse $D text .tag)"
sleep 0.5; browse $D click '[data-act=skip]' >/dev/null
sleep 0.5; browse $D click '[data-act=skip]' >/dev/null
browse $D wait --text "Payday 2" 10 >/dev/null || fail "payday 2 (clock block)"
sleep 0.5; browse $D click --text "Back to the sales" >/dev/null
browse $D wait --text "Month 2 of 8" 10 >/dev/null || fail "month 2 (clock block)"
[[ $(browse $D js 'return document.querySelectorAll(".clock").length') == 1 ]] || fail "a sale in month 2 has no clock"
browse $D js 'new MutationObserver((l, o) => { if (document.querySelector(".offer .why")?.textContent.includes("Time ran out")) { o.disconnect(); document.querySelector("[data-act=skip]").click(); } }).observe(document.getElementById("app"), { childList: true }); return 1' >/dev/null
browse $D wait --text "Time ran out" 20 >/dev/null || fail "the sale clock did not run out"
[[ $(browse $D text .tag) == *"Offer 2 of 3"* ]] || fail "a late tap acted on the next offer: $(browse $D text .tag)"
[[ $(browse $D js 'return document.querySelectorAll(".offer.need").length') == 1 ]] || fail "offer 2 of month 2 should be the car repair"
[[ $(browse $D js 'return document.querySelectorAll(".clock").length') == 0 ]] || fail "a bill has a clock"
for st in planner alwaysSplit; do
  browse $D open "${U}?seed=7&lang=en&autoplay=$st&fast&a11y=calm&v=$RANDOM" >/dev/null
  browse $D wait --text "the bank reads your credit report" 90 >/dev/null || fail "autoplay $st did not end: $(browse $D text | head -5)"
  X=$(node -e "import('$PWD/econ.js').then(E=>{const r=E.simulate('$st',7);console.log(r.fees+','+r.cash)})")
  G=$(browse $D js 'return [...document.querySelectorAll(".stats div")].filter(d => /Late fees|Left in the wallet/.test(d.textContent)).map(d => d.querySelector("b").textContent.replace(/\D/g,"")).join()')
  [[ $G == $X ]] || fail "$st on the device ($G) differs from econ.js in node ($X): same seed must give the same season"
  [[ $(browse $D text .facts) == *"30% of the price"* ]] || fail "$st: the end screen lost the UAE facts"
  print "$st: $(browse $D text .stamp) · fees,cash $G = node $X"
done
print "E2E OK on $D"
