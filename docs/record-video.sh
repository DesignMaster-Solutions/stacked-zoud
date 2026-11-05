#!/bin/zsh
# Records the gameplay segments of docs/VIDEO.md on the MiniPC Chrome (browse minipc rec), one file per segment.
V=${0:A:h}/video; mkdir -p $V; U=https://designmaster-solutions.github.io/stacked-zoud/; W=1152; H=648
seg() { # seg <name> <seconds-cap> <url> <wait-text> [hold-seconds] [js-after]
  browse minipc open "about:blank" >/dev/null
  (browse minipc rec $V/$1.mp4 --s $2 --w $W --h $H --fps 30 > $V/$1.log 2>&1 &)
  sleep 2; browse minipc open "$3&v=$RANDOM" >/dev/null
  browse minipc wait --text "$4" 200 >/dev/null || print "WAIT FAIL $1"
  [[ -n "$6" ]] && browse minipc js "$6" >/dev/null
  sleep ${5:-3}; touch $V/$1.mp4.stop
  until grep -q frames $V/$1.log; do sleep 1; done; print "$1: $(cat $V/$1.log)"
}
until curl -s "${U}?x=$RANDOM" | grep -q "game.js?v=13"; do sleep 5; done
seg s1-title 20 "${U}?seed=7&lang=en" "STACKED" 7
seg s2-greedy 120 "${U}?seed=7&lang=en&autoplay=alwaysSplit&pace=1100" "the bank reads your credit report" 7
seg s3-planner 120 "${U}?seed=7&lang=en&autoplay=planner&pace=950" "the bank reads your credit report" 6
seg s4-facts 30 "${U}?seed=7&lang=en&autoplay=planner&fast" "What is true in the UAE" 9 'document.querySelector(".facts").scrollIntoView({behavior:"smooth"}); return 1'
seg s5-arabic 30 "${U}?seed=7&lang=ar&autoplay=planner&pace=1800" "العرض 2 من 3" 1
seg s6-a11y 30 "${U}?seed=7&lang=en&a11y=large,contrast,calm&autoplay=planner&pace=1800" "Offer 2 of 3" 1
print RECORD-DONE
