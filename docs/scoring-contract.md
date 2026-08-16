# CaseDrop Ranked Scoring Contract

**Version:** 1.0-draft
**Status:** Proposal — requires sign-off before any real ghost score is persisted
**Governed by:** `uploads/CaseDrop_Master_Blueprint_2026-08-16_v4.1.md` §14, §15, §17, §33, §34

This is an **implementation specification**, not product philosophy. Where it conflicts with the
blueprint, the blueprint governs.

It exists because nothing downstream can be built safely without it. A ghost score persisted under
an undefined contract is a permanently unusable row.

---

## 0. Invariants

These are database-level constraints. They are enforced by the data layer, not by convention.

> **INV-1.** A live score may only be compared against a ghost score generated under the same
> `scoringVersionId`.

> **INV-2.** A juror score is only meaningful for the `(caseId, caseVersion, scoringVersionId)`
> triple it was generated under. Any of the three changing invalidates the score.

> **INV-3.** The panel for a case is `deterministicPanel(caseId, scoringVersionId)` and is identical
> for every argument scored under that pair — live and ghost alike.

> **INV-4.** No juror prompt may contain community percentages, ratings, rank, subscription status,
> side popularity, opponent identity, group membership, or any authored indication of a correct
> outcome (§14.4, §17).

A comparison violating INV-1 must raise, not warn. A scoring row that cannot name its
`scoringVersionId` is invalid and must not be written.

---

## 1. Shape of the call

**One request per argument, returning all ten jurors.** Not ten requests.

```
score(argument, case, panel, scoringVersion) -> JurorScore[10]
```

Independent scoring (§15.2) means the request contains **one** argument. The opposing argument is
never in the prompt. This satisfies INV-4's opponent-identity clause structurally rather than by
instruction.

### Prompt layout — cache boundary is load-bearing

```
┌─ CACHED PREFIX ──────────────────────────────┐
│  rubric definition                            │  stable per scoringVersionId
│  juror lens definitions (the 10 on panel)     │  stable per (caseId, scoringVersionId)
│  case prompt                                  │  stable per caseVersion
│  jurisdiction rule                            │  stable per caseVersion
│  full evidence set for the case               │  stable per caseVersion
├─ UNCACHED TAIL ──────────────────────────────┤
│  side being argued                            │  varies
│  evidence IDs this advocate opened            │  varies
│  the argument text                            │  varies
└───────────────────────────────────────────────┘
```

Anything above the boundary that varies per match silently destroys caching and bills at full input
rate. Assert the boundary in tests (§34.4).

---

## 2. Rubric

Five dimensions, scored **0–20 integer** each. The dimensions are fixed; the *weights* differ per
juror lens. One rubric, many readings — this is what makes a 6–4 split legible rather than arbitrary.

| # | Dimension | Key | Scores |
|---|---|---|---|
| 1 | Evidence grounding | `grounding` | Are claims tied to evidence the advocate actually opened? |
| 2 | Rule connection | `rule` | Is evidence connected to the governing rule, not just recited? |
| 3 | Coherence | `coherence` | Does the argument hold together as a structure? |
| 4 | Calibration | `calibration` | Does it avoid overstating what the evidence proves? |
| 5 | Ambiguity handling | `ambiguity` | Does it engage the weak side of its own case? |

Every dimension is an **advocacy** measure. None asks whether the position is correct (§17).

### Juror weight vectors

Integers summing to 100.

| Juror | grounding | rule | coherence | calibration | ambiguity |
|---|---:|---:|---:|---:|---:|
| Formalist | 15 | 40 | 20 | 15 | 10 |
| Pragmatist | 20 | 15 | 25 | 15 | 25 |
| Skeptic | 30 | 15 | 15 | 35 | 5 |
| Equitable | 15 | 15 | 25 | 15 | 30 |
| Evidence-first | 45 | 20 | 15 | 15 | 5 |
| Institutionalist | 20 | 35 | 20 | 15 | 10 |
| Plain-reader | 15 | 15 | 45 | 10 | 15 |
| Contrarian | 20 | 15 | 15 | 20 | 30 |

> **Proposal, not decided.** These vectors are a starting point. §37.2 lists the final rubric and
> weights as TBD. The contract is valid under any weight set; only the numbers change.

### Score arithmetic

```
jurorScore = round( Σ(weight_d × dimension_d) / 100 )     -> integer 0..20
aggregateScore = Σ jurorScore  over the 10 panel jurors    -> integer 0..200
```

Integers throughout. No floats are stored or compared — float comparison would make INV-1's
determinism promise unenforceable in practice.

`round()` is half-up, applied once, at the end.

---

## 3. Response schema

Strict JSON. Structured output enforced at the API level, not parsed hopefully.

```json
{
  "scoringVersionId": "sv_2026_08_16_a",
  "caseId": "case_locked_office",
  "caseVersion": "1.0",
  "submissionId": "sub_01J8XK...",
  "jurors": [
    {
      "jurorId": "formalist",
      "dimensions": {
        "grounding": 14,
        "rule": 17,
        "coherence": 15,
        "calibration": 12,
        "ambiguity": 9
      },
      "rationale": "The revocation carried a timestamp and the argument cited it directly."
    }
  ]
}
```

### Field rules

| Field | Rule |
|---|---|
| `jurors` | Exactly 10 entries. Order must match `deterministicPanel()` output order. |
| `jurorId` | Must be in the panel for this `(caseId, scoringVersionId)`. No substitutions. |
| `dimensions` | All five keys present, each integer `0..20`. Missing or out-of-range = invalid. |
| `rationale` | 1 sentence, ≤ 180 characters. Addressed to the advocate. |
| `jurorScore` | **Not returned by the model.** Computed host-side from dimensions × weights. |
| `aggregateScore` | **Not returned by the model.** Computed host-side. |

**The model returns dimension scores and prose only.** Every derived number is computed by us. A
model that returns its own aggregate is not trusted to have computed it consistently, and a
host-side computation is reproducible from stored dimensions forever.

### Determinism settings

```
temperature: 0
top_p:       1
seed:        hash(submissionId + scoringVersionId)   where the provider supports it
```

Determinism is best-effort at the provider level (§14.6). Because dimension scores are stored, a
verdict remains **auditable** even where it is not bit-reproducible — the stored dimensions, not the
call, are the record.

---

## 4. Validation

Reject before persisting. A rejected response is retried (§5), never repaired.

| Check | On failure |
|---|---|
| Parses as JSON matching schema | retry |
| Exactly 10 jurors | retry |
| Juror IDs match the panel exactly, no dupes | retry |
| All 5 dimensions present per juror | retry |
| Every dimension integer in `0..20` | retry |
| Rationale non-empty, ≤ 180 chars | truncate at word boundary, accept |
| Rationale contains no side-advocacy language | flag for review, accept |
| `scoringVersionId` matches the request | **hard fail, alert** — never retry |

The last row is a code bug, not a model failure. Retrying it would persist a comparability
violation.

---

## 5. Retry and failure

Per blueprint §35 — a failure must never destroy a submitted argument.

```
attempt 1  ──fail──> attempt 2 (backoff 1s)
           ──fail──> attempt 3 (backoff 4s)
           ──fail──> mark submission scoring_pending
                     return player to a "verdict pending" state
                     background worker retries with capped backoff
                     notify when scored
```

Invariants during failure:

1. The submission row is written **before** the scoring call. Scoring failure never loses writing.
2. Opened-evidence state is persisted with the submission.
3. The player is never asked to rewrite.
4. `scoring_pending` is a **failure mode**, not the normal path. Alert if its rate exceeds a
   threshold.

Log on every path: failures, timeouts, malformed outputs, scoring-version mismatches, cache misses,
re-score events.

---

## 6. Verdict computation

Host-side, from two stored score sets. No inference involved.

```python
def verdict(live: list[int], ghost: list[int], epsilon: int) -> Verdict:
    # live[i], ghost[i] are jurorScore for panel juror i — same panel, INV-3
    calls = []
    for l, g in zip(live, ghost):
        if   l - g >  epsilon: calls.append("LIVE")
        elif g - l >  epsilon: calls.append("GHOST")
        else:                  calls.append("ABSTAIN")

    live_calls  = calls.count("LIVE")
    ghost_calls = calls.count("GHOST")
    margin      = sum(live) - sum(ghost)          # signed, 0..±200

    if   live_calls > ghost_calls: outcome = "LIVE"
    elif ghost_calls > live_calls: outcome = "GHOST"
    elif abs(margin) > epsilon:    outcome = "LIVE" if margin > 0 else "GHOST"
    else:                          outcome = "DRAW"

    return Verdict(outcome, calls, live_calls, ghost_calls,
                   calls.count("ABSTAIN"), margin)
```

Implements §15.4. Ties abstain rather than coin-flip, because a coin-flip would break INV-3's
determinism guarantee at the last step.

`epsilon` is a **tunable** recorded in the scoring version. Proposed default: **1** on the 0–20
juror scale.

**The reveal must show tally and margin together** (§15.4). `10–0 +2.1` and `10–0 +24.8` are
different results and the UI must not render them identically.

### Note: `epsilon` and margin overlap more than expected

Tested against the razor-thin-sweep scenario, the abstention band already prevents the misleading
display. Ten jurors separating the arguments by one point each does **not** render as `10–0`:

```
razor-thin sweep (13 vs 12 on every juror)   ->  0–0, 10 abstain, +10 margin
decisive sweep   (18 vs  8 on every juror)   ->  10–0,  0 abstain, +100 margin
```

`epsilon` does most of the work the margin display was introduced to do — a near-tie surfaces as
mass abstention rather than a fake landslide. Margin remains useful as secondary information (two
matches can both be `8–2` with very different separations), but it is no longer the primary guard
against a lying tally.

Consequence for the reveal UI: **abstentions must be rendered**, not hidden. A panel that abstains
ten times is telling the player something specific — the arguments were indistinguishable — and
collapsing that into a bare tally throws away the signal.

---

## 7. Scoring version

```ts
type ScoringVersion = {
  id: string;                       // "sv_2026_08_16_a"
  rubricVersion: string;            // dimensions + weight vectors
  modelId: string;                  // "gpt-5-nano"
  providerId: string;               // "openai"
  jurorRosterVersion: string;       // the ~24-juror roster
  casePanelSeedRuleVersion: string; // deterministicPanel() algorithm
  epsilon: number;                  // juror-call abstention band
  createdAt: string;
};
```

**Any field changing mints a new `id`.** Including `modelId` — that is §34.3, and it is the reason
this object exists.

On a new version: existing ghost scores are not deleted, they become **ineligible for comparison**
under the new version. Re-scoring policy is TBD (§37.2). Until decided, the safe default is that a
ghost without a score under the current version is not selectable.

---

## 8. Open decisions

Blocking before production:

1. **Final weight vectors** — §2 is a proposal.
2. **`epsilon`** — proposed 1; needs calibration against real score distributions.
3. **Draw rating movement** — §15.4 defines draws; the rating formula does not yet handle them.
4. **Re-score policy on version change** — §7.
5. **Model quality calibration** — 200–300 matchups with human rankings, measuring agreement
   (Appendix C.1). This gates the GPT-5 nano choice itself, not just the contract.

Non-blocking but needed early:

6. Rationale quality bar — how is "flag for review" in §4 adjudicated?
7. Whether the ~24-juror roster is authored before or alongside the first Ranked case.
