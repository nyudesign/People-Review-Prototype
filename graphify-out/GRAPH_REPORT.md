# Graph Report - People Review Re-engineering Prototype  (2026-10-28)

## Corpus Check
- 18 files · ~84,992 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 39 file(s) not represented in the graph (top: .woff2 28, .css 10, (none) 1)

## Summary
- 311 nodes · 628 edges · 18 communities (9 shown, 9 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7a133563`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Individual Goal/app.js
- Project Community Involvement/app.js
- Self Review/app.js
- HSSE Objective/app.js
- app.js
- Nominate 360/app.js
- behavior-survey.js
- dropdown.js
- Nominate 360/icons.js
- review.js
- Development Commitment/app.js
- Development Commitment/icons.js
- HSSE Objective/icons.js
- icons.js
- Individual Goal/icons.js
- Project Community Involvement/icons.js
- Self Review/icons.js

## God Nodes (most connected - your core abstractions)
1. `route()` - 13 edges
2. `icon()` - 13 edges
3. `icon()` - 12 edges
4. `renderPilih()` - 12 edges
5. `renderPilih()` - 12 edges
6. `render()` - 11 edges
7. `route()` - 11 edges
8. `renderRekap()` - 11 edges
9. `itemHTML()` - 10 edges
10. `renderProcess()` - 10 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (18 total, 9 thin omitted)

### Community 0 - "Individual Goal/app.js"
Cohesion: 0.07
Nodes (59): allProcs(), attachUpload(), avatarsHTML(), boardFilter, cardHTML(), closedPeriods, columns, completeAll() (+51 more)

### Community 1 - "Project Community Involvement/app.js"
Cohesion: 0.09
Nodes (51): actError(), actHTML(), allDone(), altSwitch(), answerConfirm(), backLink(), catalog, commitPicks() (+43 more)

### Community 2 - "Self Review/app.js"
Cohesion: 0.17
Nodes (18): allAnswered(), answerDialog(), answeredCount(), ask(), confirmBox(), esc(), icon(), isLast() (+10 more)

### Community 3 - "HSSE Objective/app.js"
Cohesion: 0.08
Nodes (60): actError(), actHTML(), allItems(), answerConfirm(), backLink(), blockedBy(), catalog, commitPicks() (+52 more)

### Community 4 - "app.js"
Cohesion: 0.11
Nodes (18): besTargets, contributory, emptyState(), evCard(), icon(), nominees, notifs, NTABS (+10 more)

### Community 5 - "Nominate 360/app.js"
Cohesion: 0.10
Nodes (40): allAnswered(), answerDialog(), answeredCount(), ask(), base(), BASE_COLS, baseCells(), CANDIDATES (+32 more)

### Community 7 - "dropdown.js"
Cohesion: 0.36
Nodes (8): close(), enhance(), lockScroll(), place(), scroller(), sync(), unlockScroll(), visibleBox()

### Community 10 - "review.js"
Cohesion: 0.33
Nodes (3): LOGIN, REVIEW, YEAR_END_TARGET

### Community 11 - "Development Commitment/app.js"
Cohesion: 0.50
Nodes (3): components, pct, realisasi

## Knowledge Gaps
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Should `Individual Goal/app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07168458781362007 - nodes in this community are weakly interconnected._
- **Should `Project Community Involvement/app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.0880503144654088 - nodes in this community are weakly interconnected._
- **Should `HSSE Objective/app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07589285714285714 - nodes in this community are weakly interconnected._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `Nominate 360/app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10404040404040404 - nodes in this community are weakly interconnected._