repo: valenlucrator/CaseDrop_V2
branch: claude/push-code-github-ficy97

## Last sync
date: 2026-08-16T16:10:00Z

## Read order for a new session
1. This file.
2. uploads/CaseDrop_Master_Blueprint_2026-08-16_v4.2.md — governing product spec.
3. docs/scoring-contract.md — implementation contract for Ranked scoring (v1.1).
4. db/001_scoring_core.sql + db/tests/001_invariants.sql — schema and proof the
   invariants reject illegal states.
5. server/src/scoring/*.ts + server/test/scoring.test.ts — the scoring core.

## Stack decisions (not yet written into the blueprint — treat as settled)
- Backend: TypeScript, Node 22, Fastify (Fastify not yet scaffolded).
- Client: Swift / SwiftUI (not started).
- DB: PostgreSQL 16.
- Evaluation model: gated on calibration — benchmark GPT-5 nano / GPT-5.4 nano /
  GPT-5.6 Luna against a 200-300 matchup human-ranked set (docs/scoring-contract.md §8).
- Build order for Phase 2: the scorer (server/src/scoring/scorer.ts) is shared by
  both the production request path and the calibration harness, so the eval
  measures exactly the code that ships. This was a deliberate choice over two
  separate implementations.

## Blueprint status
Current: uploads/CaseDrop_Master_Blueprint_2026-08-16_v4.2.md — governing.
Archived (superseded, do not treat as spec):
  uploads/archive/CaseDrop_Master_Blueprint_2026-08-14_v3.md

v4.2 changelog (on top of v4.1):
- §13.5 splits PlayerRating from GhostStrengthRating. A ghost's strength evolves
  on its own record; the author's personal rating is never touched by their
  archived submissions being faced.
- §15.4 draws are worth 0.5 (expected-score arithmetic).
- §33.4 ScoringVersion has a status lifecycle: draft -> calibrating ->
  backfilling -> active -> retired. Lazy migration is prohibited.

v4.1 changelog (on top of v4, the consolidated v3 rewrite):
- §14.3 panel disclosure rule rewritten. Old text ("panel mapping not exposed to
  players") contradicted §16, which names jurors on the reveal screen. New rule:
  undisclosed before submission, revealed as part of the verdict.
- §15.4 defines juror call / panel tally / score margin, with an epsilon
  abstention band instead of a random tiebreak.
- §24.1 / §34 separate customer pricing (CaseDrop Plus, $7.99/mo, $49.99/yr)
  from inference configuration (model choice, cost formula). These were
  conflated in early drafts and must stay separate sections.
- §20 splits balance validation into pre-Ranked (assessment, possible offline)
  and live (measurement, only possible after real participation).
- Appendix C is a non-normative decision log. Superseded comparison tables
  (e.g. old Claude-model cost table) live there, not in normative sections.

## Contract status
docs/scoring-contract.md v1.1 — approved to build against. Weight vectors and
evaluation model remain gated on calibration (§8); everything else is locked.

v1.1 fixed a real bug from v1.0: epsilon (juror-scale, 0..20) was compared
directly against the aggregate margin (panel-scale, 0..200). Fix is
aggregate_epsilon = epsilon * panelSize. Demonstrated failure case and the fix
are both in server/test/scoring.test.ts, test name containing "THE v1.0 BUG".

## What's built (server/src/scoring/)
- rubric.ts       — 5 locked dimensions, 12 calibration weight vectors,
                     integer-only score arithmetic (jurorScore, aggregate).
- panel.ts        — deterministicPanel(). Sorted roster, counter-mode SHA-256
                     PRNG (not stdlib RNG, not a named algorithm — must be
                     reproducible across a future Swift/Python reimplementation),
                     rejection sampling (not modulo, to avoid bias toward
                     early-sorting jurors).
- verdict.ts       — computeVerdict() with the fixed epsilon bands. Draw = 0.5.
                      displayMeanMargin() is explicitly display-only, never persisted.
- prompt.ts        — cache-boundary split (contract §1) with an assertion
                      helper; anti-farming dimension definitions carried
                      verbatim (contract §2).
- schema.ts        — strict JSON schema for the panel response. Model returns
                      dimension scores + rationale only; jurorScore and
                      aggregateScore are always host-computed.
- scorer.ts         — scoreArgument(), the shared entry point. ModelClient is
                      injected (no network in tests). ContractViolation carries
                      a retryable flag.

server/test/scoring.test.ts — 48 tests, all passing. `npx tsc --noEmit` clean.

## Database (db/)
001_scoring_core.sql — scoring_versions, juror_definitions, case_panels,
ranked_submissions, ranked_submission_scores, juror_dimension_scores,
ghost_strength, assert_comparable(). Invariants (INV-1 through INV-7 from the
contract) are enforced as database constraints — partial unique indexes,
foreign keys, triggers — not application-level convention.

db/tests/001_invariants.sql — 22 assertions proving illegal states are
rejected: cross-scoring-version comparison, cross-case-version comparison,
wrong-panel-seat writes, malformed weight vectors, word-cap violations, etc.
db/run_tests.sh applies the schema to a scratch DB and runs them.
Verified against real PostgreSQL 16 in this session, not just written.

## Prototype (CaseDrop.dc.html)
Rebuilt around the AI panel: Jury screen/tab removed, ten-juror sequential
panel reveal replaces the ranked verdict, ghost-match copy on assigning
counsel, Daily analysis screen with the deterministic evidence debrief,
four-tab nav (Home/Rank/Learn/Profile), Sunday demoted to a Home card.
Evidence field is `wouldHaveSupported` per blueprint §12.4/§33.1.

This is UI only. Ranked in the prototype is Math.random() side assignment, a
static fake ghost, and a hardcoded 6-4 result — none of it is wired to the
scoring core above. That wiring is exactly what "next" covers below.

## Next (Phase 2, in order — see docs/scoring-contract.md §8 and blueprint §36)
Not yet built, in priority order:
1. OpenAI ModelClient adapter (implements the ModelClient interface in
   scorer.ts against the real API) — the next concrete step.
2. Calibration harness: run the shared scorer against GPT-5 nano / GPT-5.4 nano
   / GPT-5.6 Luna over a 200-300 matchup human-ranked set, using the metrics
   list in docs/scoring-contract.md §8 (human-winner agreement, DEFEND/CHALLENGE
   agreement, score correlation, abstention rate, draw rate, false-blowout
   rate, rationale quality, latency, cost/match). This resolves the model and
   weight-vector TBDs.
3. Persist-submission-before-inference write path (RankedSubmission), per
   contract §5 — a scoring failure must never lose a player's writing.
4. Retry -> scoring_pending -> queue for scoring failures (contract §5).
5. Fastify HTTP layer wiring the above into endpoints; wire the prototype's
   Ranked flow to call it instead of Math.random().
6. Real ghost selection (blueprint §13.2): opposite side, same case, compatible
   bundle, rating band, anti-repeat.
7. Fairness-weighted side assignment (blueprint §8-§9), replacing Math.random().
8. GhostStrengthRating update formula (blueprint §13.5) — K-factor is TBD.

Explicitly deferred until the above is real: matchmaking polish, Groups
backend, Sunday event flow, richer Learn history, analytics (blueprint §19-§21).

## Open decisions still gated (see blueprint §37.2 for the full TBD list)
- Final evaluation model and juror weight vectors — calibration-gated, see above.
- GhostStrengthRating K-factor.
- Re-score policy specifics when a scoring version retires (lifecycle mechanism
  is decided; the operational trigger/cadence is not).
- Side-Lock Ticket allowance and regeneration schedule.
- Free-tier Ranked daily cap (economics support almost any value at GPT-5 nano
  pricing — see Appendix C.1 in the blueprint — so this is a UX/monetization
  call, not a cost constraint).
