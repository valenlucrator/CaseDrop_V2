repo: valenlucrator/CaseDrop_V2
branch: main

## Last sync
date: 2026-08-16T15:20:00Z

## Blueprint
Current: `uploads/CaseDrop_Master_Blueprint_2026-08-16_v4.1.md` — consolidated, governing.
Archived: `uploads/archive/CaseDrop_Master_Blueprint_2026-08-14_v3.md` — superseded.

v4.1 corrects four items found in spec review:
- §14.3 disclosure rule — panel is undisclosed before submission, revealed as part of the verdict.
  The old "mapping is not exposed to players" claim contradicted §16, which names jurors on screen.
- §15.4 juror call / panel tally / score margin — defines score→vote, with an epsilon abstention
  band instead of a random tiebreak.
- §24.1 / §34 — customer pricing separated from inference configuration. These were conflated.
- §20 — validation split into pre-Ranked (assessment) and live (measurement) phases.

Appendix C is a non-normative decision log; superseded comparison tables live there, not in
normative sections.

## Specs
`docs/scoring-contract.md` — Ranked scoring contract v1.0-draft. Request/response schema, rubric
dimensions and juror weight vectors, score arithmetic, validation, retry, verdict computation,
scoring-version rules. **Proposal — requires sign-off before any real ghost score is persisted.**

## Prototype coverage against v4.1
Implemented as UI: §16 + §29.4 panel reveal, §22 Daily analysis, §22.1 evidence debrief,
§22.3 word caps, §22.4 tier split, §26 visual system, §27 navigation, §28 hub/flow,
§29 interaction rules, §31 glossary, §32 groups surfaces.

Not implemented — the whole of Phase 2 is UI-only. Ranked is currently `Math.random()` side
assignment, a fake ghost, and a static 6–4 result. Missing: §8/§9 fairness-weighted assignment,
§13 ghost selection and seeding, §14.3 deterministic panel seed, §15 independent scoring,
§19 analytics, §20 validation, §25 Ranked cap, §33 data models, §35 failure behaviour.

Next milestone is one real Ranked match end to end, not more screens.

## Screen map
| Screen | Source |
|---|---|
| ios-frame.jsx (device frame) | copied from sibling project 7f6db368-65e3-4e2a-a5d2-0df4430e60a5 |
| Panel Reveal, Daily Analysis | v4.1 §16, §22 |
| Home, Rank, Learn, Profile, Sunday, Case Prompt, Evidence, Decision, Argument, Submission Locked, Verdict (Daily), Group Detail, Glossary sheet, Side-Lock sheet | v4.1 §30 |
