repo: valenlucrator/CaseDrop_V2
branch: main

## Last sync
date: 2026-08-16T14:40:00Z

## Blueprint
Current: `uploads/CaseDrop_Master_Blueprint_2026-08-16_v4.md` — consolidated, governing.
Archived: `uploads/archive/CaseDrop_Master_Blueprint_2026-08-14_v3.md` — superseded, retained for history.

v4 consolidates v3 plus its §27 revision into one document. Per Appendix B it governs
wherever an older blueprint or prototype note conflicts.

### Updated in this sync
- v3 archived, v4 installed as the working blueprint.
- Evidence field renamed `supports` -> `wouldHaveSupported` to match v4 §12.4 / §33.1.

### Earlier
- Prototype rebuilt around the AI panel: Jury screen and tab removed, ten-juror panel
  reveal replaces the ranked verdict, ghost-match copy on assigning counsel, Daily
  analysis screen with the deterministic evidence debrief, four-tab navigation,
  Sunday demoted to a Home card.
- Prototype originally built from v3 (§18–§25). Case content ("The Locked Office")
  supplied by the user in chat.
- UI re-skinned to match a sibling CaseDrop project: iOS device frame (ios-frame.jsx),
  20px cards, #4C8DF6/#63B37F/#D3A05B palette.

## Prototype coverage against v4
Implemented as UI: §22 Daily analysis, §22.1 evidence debrief, §22.3 word caps,
§22.4 tier split, §16 + §29.4 panel reveal, §26 visual system, §27 navigation,
§28 hub/flow, §29 interaction rules, §31 glossary, §32 groups surfaces.

Not implemented (no backend in the prototype): §8/§9 fairness-weighted assignment,
§13 ghost selection and seeding, §14.3 deterministic panel seed, §15 independent
scoring and stored scores, §19 balance analytics, §20 pre-ship validation,
§25 Ranked cap, §33 data models, §35 failure and retry behaviour.

## Screen map
| Screen | Source |
|---|---|
| ios-frame.jsx (device frame) | copied from sibling project 7f6db368-65e3-4e2a-a5d2-0df4430e60a5 |
| Panel Reveal, Daily Analysis | v4 §16, §22 |
| Home, Rank, Learn, Profile, Sunday, Case Prompt, Evidence, Decision, Argument, Submission Locked, Verdict (Daily), Group Detail, Glossary sheet, Side-Lock sheet | v4 §30 |
