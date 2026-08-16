# CaseDrop - Master Product Blueprint

**Version:** 2026-08-16 v4  
**Status:** Consolidated working product blueprint  
**Supersedes:** `CaseDrop_Master_Blueprint_2026-08-14_v3.md`  
**Primary design principle:** CaseDrop should test judgment in solo play and advocacy in competitive play without turning legal ambiguity into a hidden “correct answer” quiz.

---

# 1. Product Thesis

CaseDrop is a fast, social legal-reasoning game built around ambiguous cases.

The core fantasy is not:

> Can I guess the author's intended answer?

It is:

> **Can I form a defensible judgment, and can I make the strongest case from the evidence available to me?**

The product has two major loops and one small event layer:

1. **Daily - Judgment**  
   What do you actually think?
2. **Ranked - Advocacy**  
   Can you argue the side you were assigned?
3. **Sunday - Weekly event**  
   A periodic special mode surfaced from Home only while live.

The product should create two different kinds of curiosity:

```text
DAILY
“I’m in the 38%. Why did other people see it differently?”

RANKED
“I was assigned the harder-feeling side. Can I still win the argument?”
```

CaseDrop must never collapse those two questions into a single hidden answer key.

---

# 2. Core Product Principle

CaseDrop should never feel like:

> **Guess what the author thinks.**

Daily should feel like:

> **What do I think, and how do other people see this?**

Ranked should feel like:

> **Give me a side and a limited case file. I’ll make the case.**

The ideal case can simultaneously be:

```text
60 / 40 in human belief
```

and:

```text
50 / 50 in competitive viability
```

That is not a contradiction. It is the foundation of the game.

---

# 3. Product Modes

## 3.1 Daily - Judgment

**Question:** *What do YOU think?*

Daily measures the player's own judgment.

The player is not assigned a side. The player reads the case, chooses what evidence to inspect, reaches a conclusion, and explains that conclusion in their own words.

Recommended flow:

1. Receive the Daily case.
2. Read the case prompt and jurisdiction rule.
3. Inspect five available evidence items.
4. Open exactly two.
5. Make the key decision.
6. Select the decision, then **LOCK** it.
7. Write a justification, capped at **150 words**.
8. Submit.
9. See the human community split.
10. See why both sides were defensible.
11. Receive a deterministic evidence debrief.
12. Receive the available analysis layer for the user's tier.
13. Continue into Learn / Review if desired.

Daily is a **human belief signal**.

It should produce moments like:

> **DEFEND - YOU ARE IN THE 38%**

followed by:

> **Why were both sides defensible?**

Daily does not use the AI panel to decide whether the player's conclusion was right.

---

## 3.2 Ranked - Advocacy

**Question:** *Can you make the case?*

Ranked does not ask what the player personally believes.

The player receives one of two assigned positions:

- **DEFEND**
- **CHALLENGE**

The instruction is:

> **This is your side. Make the strongest case you can.**

Ranked measures advocacy under constraints:

- assigned position,
- limited evidence,
- short writing space,
- a compatible opposing argument,
- an AI scoring panel that evaluates advocacy rather than truth.

Ranked keeps the **60-word argument cap**. Compression is part of the competitive skill.

Ranked is the repeatable, high-frequency loop of CaseDrop.

---

## 3.3 Sunday - Weekly Event Layer

Sunday remains a product mode, but it is **not** a permanent bottom-navigation destination.

Rules:

- Sunday appears as a Home card only while the event is live.
- The Home card should feel temporary and event-like.
- Amber may be used as the semantic accent for Sunday.
- Sunday must not occupy one quarter or one fifth of permanent navigation for a mode that is inactive most of the week.

The exact Sunday rules and reward structure remain outside the scope of this blueprint unless separately specified.

---

# 4. Session Design - Remove Dead Air

CaseDrop should be usable for three minutes or for a much longer session.

The previous architecture had too much waiting:

- one Daily case could be completed quickly,
- Ranked depended on another live player,
- verdicts depended on a human jury queue,
- the Jury surface required users to perform unpaid judging work.

The v4 architecture removes those dependencies.

A healthy session can now look like:

```text
DAILY
3–5 min
↓
COMMUNITY VERDICT
↓
EVIDENCE DEBRIEF + ANALYSIS
1–3 min
↓
RANKED
3–5 min
↓
AI PANEL REVEAL
↓
PLAY AGAIN
↓
RANKED
↓
...
```

The key product requirement is:

> **At any ordinary moment, a player should be able to start an activity with an immediate path to payoff.**

Ranked with ghost matching is the primary “kill time” loop.

Learn is the primary reflective / revisit loop.

Daily remains the once-per-cadence social judgment anchor.

---

# 5. Case Philosophy and Ranked Eligibility

Cases should support intelligent disagreement.

A strong CaseDrop case should contain enough ambiguity that a reasonable person can defend either side without pretending facts do not exist.

For authoring, a useful initial natural-opinion target is:

```text
approximately 40/60 to 60/40
```

A looser early testing band may be:

```text
35/65 to 65/35
```

This target applies to **human belief**, not necessarily to competitive performance.

A case may poll:

```text
Community belief:
DEFEND     61%
CHALLENGE  39%
```

while producing:

```text
Ranked competitive outcomes:
DEFEND     49.8%
CHALLENGE  50.2%
```

That is healthy.

A case that tests at something like 89/11 may still be useful for:

- Daily,
- Learn,
- Sunday,
- special challenges,

but should normally not enter serious Ranked rotation unless competitive viability is independently demonstrated.

---

# 6. Ranked Match Structure

Ranked no longer waits for a second live player.

The live player is matched against a compatible **stored argument**, called a ghost.

```text
RANKED

LIVE PLAYER
    │
    │ fairness-weighted side assignment
    ↓
DEFEND or CHALLENGE
    │
    │ same base case
    │ compatible evidence pairing
    ↓
5 evidence options
    │
open exactly 2
    │
write ≤ 60 words
    │
FILED
    │
    ├───────────────┐
    │               │
LIVE ARGUMENT   STORED GHOST ARGUMENT
    │               │
    └───────┬───────┘
            ↓
      AI SCORING PANEL
            ↓
    SEQUENTIAL REVEAL
            ↓
       WIN / LOSS
            ↓
        RATING UPDATE
            ↓
        PLAY AGAIN
```

Recommended Ranked loop:

1. Player enters Ranked.
2. Optional Side-Lock Ticket is resolved before the case reveal.
3. Fairness-weighted side assignment determines the live player's side unless locked.
4. A case is selected.
5. A compatible ghost argument is selected from the opposite side.
6. **ASSIGNING COUNSEL...** reveal plays.
7. The live player receives five evidence options.
8. The live player opens exactly two.
9. The live player writes up to **60 words**.
10. Submission locks.
11. The live submission is evaluated under the current scoring version.
12. The ghost's compatible stored score is loaded or computed if needed.
13. The ten-juror result is presented one juror at a time.
14. The match result resolves within the session under normal operation.
15. Rating updates are applied.
16. **Play Again** is immediately available.

There is no human jury queue and no normal requirement to wait hours or days for a verdict.

---

# 7. Ranked Fairness - Four Separate Problems

Ranked fairness must be treated as separate systems rather than one vague concept.

## 7.1 Position Balance

Question:

> Can both assigned positions be reasonably defended?

This is primarily an authoring and pre-ship validation problem.

---

## 7.2 Evidence Opportunity Balance

Question:

> Does each side receive strategically comparable opportunities, even when the evidence is different?

The governing requirement is:

```text
Evidence A ≠ Evidence B
```

but:

```text
Argumentative opportunity A ≈ Argumentative opportunity B
```

---

## 7.3 Assignment Fairness

Question:

> Has this player repeatedly been assigned the same side?

Pure 50/50 randomness can create technically fair but psychologically terrible streaks.

CaseDrop therefore uses fairness-weighted randomness.

---

## 7.4 Evaluation Fairness

Question:

> Does the scoring system reward advocacy rather than the popularity of a conclusion?

This is the reason Ranked uses a rubric-driven AI panel rather than a human jury.

Human community opinion remains valuable in Daily, but it should not be the mechanism that decides Ranked rating.

---

# 8. Fairness-Weighted Side Assignment

## 8.1 Base Rule

Every player begins at:

```text
DEFEND     50%
CHALLENGE  50%
```

If the player receives the same side repeatedly, the next game's weighting moves **5 percentage points toward the opposite side** for each consecutive assignment.

Example: repeated DEFEND assignments.

| Current streak | Next DEFEND weight | Next CHALLENGE weight |
|---|---:|---:|
| none | 50% | 50% |
| D | 45% | 55% |
| D D | 40% | 60% |
| D D D | 35% | 65% |
| D D D D | 30% | 70% |
| D D D D D+ | 25% | 75% |

The rule is symmetrical for repeated CHALLENGE assignments.

---

## 8.2 Reset Rule

The moment the streak breaks, the correction resets.

Example:

```text
D D D
```

Next-match weighting:

```text
DEFEND     35%
CHALLENGE  65%
```

If the player receives CHALLENGE:

```text
D D D C
```

then the old DEFEND correction has succeeded.

The following normal match begins again at:

```text
DEFEND     50%
CHALLENGE  50%
```

The newly received side begins a fresh streak count for future corrections.

---

## 8.3 Probability Cap

The correction never becomes a guarantee.

Recommended v1 cap:

```text
75% / 25%
```

This preserves uncertainty.

---

## 8.4 Player-Facing Presentation

Do not expose the hidden percentages.

Do not say:

> You currently have a 65% chance of CHALLENGE.

Player-facing language remains:

> **Sides are assigned automatically.**

The assignment reveal can remain dramatic:

```text
ASSIGNING COUNSEL...

CHALLENGE
```

---

# 9. Side Assignment Data Model

```ts
type Side = "defend" | "challenge";

type SideAssignmentState = {
  lastSide: Side | null;
  consecutiveSideCount: number;
};
```

Conceptual weighting:

```ts
function oppositeSideWeight(streak: number) {
  return Math.min(50 + streak * 5, 75);
}
```

After assignment:

```ts
if (assignedSide === previousSide) {
  consecutiveSideCount += 1;
} else {
  lastSide = assignedSide;
  consecutiveSideCount = 1;
  // The previous correction is fully resolved.
}
```

The old two-live-player configuration conflict no longer exists in v4.

The live player's side is assigned first. Ghost selection follows that assignment.

---

# 10. Side-Lock Tickets

Some players will strongly prefer one form of advocacy.

Example:

> **I want to play CHALLENGE tonight.**

CaseDrop may monetize that preference without selling competitive strength.

## 10.1 Product Concept

Subscribers receive a limited number of **Side-Lock Tickets**.

A ticket allows:

> **Lock DEFEND for your next Ranked match**

or:

> **Lock CHALLENGE for your next Ranked match**

The final allowance and regeneration schedule remain **TBD**.

A limited allowance is preferred over permanent unlimited side selection.

---

## 10.2 What a Ticket Changes

A ticket changes:

```text
role preference
```

It does not change:

```text
rating formula
rating gain/loss
opponent quality target
evidence quality
case difficulty
argument length
AI panel treatment
scoring rubric
```

The subscriber buys **agency**, not competitive power.

---

## 10.3 Timing

A ticket must be used **before the case is revealed**.

```text
RANKED
↓
optional SIDE-LOCK
↓
choose DEFEND / CHALLENGE
↓
case selection
↓
ghost selection
↓
case reveal
```

This prevents a player from seeing a case and purchasing whichever side appears easier for that specific fact pattern.

---

## 10.4 Ghost Matching Makes Locks Trivial to Satisfy

There is no longer a two-player lock conflict.

If the live player locks CHALLENGE, the system selects a compatible DEFEND ghost.

If the live player locks DEFEND, the system selects a compatible CHALLENGE ghost.

The old rule about two same-side ticket holders being incompatible is deleted.

---

## 10.5 Interaction With Fairness Streak

A ticket assignment counts as a real side assignment.

Example:

```text
D D D
```

The player uses a CHALLENGE ticket:

```text
D D D C(ticket)
```

The previous DEFEND streak is broken.

The following normal match starts from 50/50.

---

# 11. Why Side-Lock Tickets Are Not Pay-to-Win

Side locks are acceptable only while both positions remain competitively viable.

CaseDrop must distinguish:

```text
position popularity
```

from:

```text
competitive side performance
```

For example:

```text
Human Daily belief:
DEFEND     61%
CHALLENGE  39%
```

may be healthy if Ranked produces approximately:

```text
Competitive outcomes:
DEFEND     49.6%
CHALLENGE  50.4%
```

If one side begins winning materially more often under the scoring system, Side-Lock availability for that side must be suspended until the affected cases or scoring behavior are rebalanced.

Side-Lock Tickets must never become a way to purchase access to a statistically dominant role.

---

# 12. Evidence System

## 12.1 Same Universe, Mixed Bundles

Do not give each side five obviously side-supporting cards.

That would turn evidence selection into:

> I am DEFEND, so I choose one of the defense clues.

Instead, build a larger evidence universe for the case and distribute mixed pre-authored subsets.

Example complete case:

```text
E1 E2 E3 E4 E5 E6 E7 E8 E9 E10
```

Possible DEFEND-side bundle:

```text
E1 E2 E4 E7 E9
```

Possible CHALLENGE-side bundle:

```text
E2 E3 E5 E8 E10
```

Each bundle may contain:

- helpful information,
- harmful information,
- ambiguous information,
- incomplete information.

The player opens exactly two.

The intended feeling is:

> **Which information do I investigate?**

not:

> Which weapon do I choose?

The design should preserve the post-case reaction:

> **Damn, I should have opened that one.**

---

## 12.2 Evidence Functions

Possible authoring functions include:

| Function | Purpose |
|---|---|
| Core support | strongest fact for a position |
| Intent | supports or undermines state of mind |
| Authority / rule | supports permission, prohibition, duty, revocation, etc. |
| Credibility / context | attacks an interpretation or source |
| Wild card | indirect, ambiguous, or unusually powerful fact |

These functions help authors reason about bundle balance without pretending two different facts have identical numerical strength.

---

## 12.3 Pre-Author Bundles

Do not sample five evidence items blindly at random for Ranked.

Author explicit bundles:

```text
DEFEND

A1 = [E1, E2, E5, E7, E9]
A2 = [E1, E3, E4, E8, E10]
A3 = [...]
```

```text
CHALLENGE

B1 = [E2, E3, E6, E8, E10]
B2 = [...]
B3 = [...]
```

Pre-pair combinations believed to be competitively fair:

```text
A1 ↔ B2
A2 ↔ B3
A3 ↔ B1
```

Live performance data later validates or invalidates those assumptions.

---

## 12.4 Daily Evidence Metadata

Each evidence item should also support deterministic post-case analysis:

```ts
type Evidence = {
  id: string;
  // existing fields...
  wouldHaveSupported: string[]; // decision option keys / issue keys
};
```

This field powers the Daily evidence debrief without requiring an inference call.

---

# 13. Ghost Matching

## 13.1 Definition

A ghost is a stored Ranked argument created by a previous player who:

- played the same base case,
- took the opposite side,
- had a compatible evidence bundle,
- completed a valid Ranked submission.

The ghost is not an AI-generated opponent by default.

The value of the system is that real player writing becomes reusable competitive content.

---

## 13.2 Selection Requirements

Ghost selection should consider:

- opposite assigned side,
- same case,
- compatible evidence pairing,
- appropriate competitive/rating band where practical,
- scoring-version compatibility,
- anti-repeat rules so the same ghost is not shown excessively to the same live player.

The system should not choose a ghost because of group membership, friendship, or social relationship.

---

## 13.3 Cold Start

Every Ranked-eligible case requires authored seed arguments on both sides before launch.

Seed arguments:

- are labelled internally,
- guarantee immediate ghost supply,
- carry no player rating,
- are replaced in practical frequency as real player submissions accumulate.

---

## 13.4 Compounding Content Library

Every valid Ranked submission can become future matchable content.

The library therefore compounds with usage:

```text
more play
→ more arguments
→ more opponent variety
→ less repetition
→ stronger Ranked loop
```

---

## 13.5 Rating Interaction

The current product direction is that rated player ghosts may participate in rating movement when their stored argument is judged again.

This requires implementation safeguards against repeated farming, overexposure, or one static submission generating disproportionate rating movement.

The exact ghost-rating reuse guard remains **TBD before production launch**.

At minimum, the system must record:

- ghost submission ID,
- owner player ID,
- number of rated appearances,
- unique opponents faced,
- rating delta history attributable to the ghost,
- scoring version used.

Seeded authored ghosts never gain rating.

---

# 14. AI Jury Panel

Ranked is resolved by a rubric-driven AI panel rather than human jurors.

The purpose is not to determine which legal conclusion is objectively correct.

The purpose is:

> **Evaluate how well each advocate made the case from the evidence available to them.**

---

## 14.1 Why the Human Jury Is Removed

A human jury has three product problems.

### Belief bias

Untrained voters naturally tend to choose the conclusion they already believe.

On a 60/40 case, this can systematically advantage the majority-belief side even when the minority-side argument is stronger.

That undermines Ranked fairness and can make Side-Lock Tickets pay-to-win.

### Throughput dependency

Human verdicts require a sufficient jury population.

A new product cannot assume that supply.

### Dead waiting

Human verdict collection turns the most important competitive payoff into an asynchronous wait.

CaseDrop's repeatable mode should not normally tell players to come back hours later to learn whether they won.

Therefore:

```text
DAILY
human aggregate
→ what people believe

RANKED
AI scoring panel
→ how well you argued
```

---

## 14.2 Juror Lenses

Jurors are defined by how they read arguments and rules, not by novelty personalities.

Core lenses include:

| Juror | Reads for |
|---|---|
| Formalist | what the rule actually says |
| Pragmatist | what outcome works in practice |
| Skeptic | assertions unsupported by evidence |
| Equitable | fairness to the person in front of them |
| Evidence-first | only what the advocate actually cited |
| Institutionalist | deference to process and authority |
| Plain-reader | intelligent layperson reading |
| Contrarian | pressure-tests the intuitive side |

The shipped roster should contain approximately **24 jurors**, spanning these and adjacent legal-reading positions.

A Ranked evaluation uses **10 jurors**.

A result like 6–4 becomes meaningful feedback:

> you persuaded the formalists and evidence-first jurors but lost the pragmatists.

That feedback is delivered inside the competitive reveal rather than as a separate classroom rubric.

---

## 14.3 Deterministic Panel Construction

The panel must be reproducible.

The v4 rule is:

> **The 10-juror set for a case is deterministically selected from the larger roster using the case ID and scoring-version ID.**

Conceptually:

```text
panelSeed = hash(caseId + scoringVersionId)
```

This resolves the conflict between “rotating juror variety” and “the same input should always receive the same evaluation.”

Consequences:

- different cases can use different 10-juror subsets,
- changing the rubric creates a new scoring version and therefore may create a new panel,
- the same case under the same scoring version uses the same panel,
- stored ghost scores remain reusable and auditable,
- players cannot rely on one universal panel across every case.

The exact juror-to-case mapping is not exposed to players.

---

## 14.4 Panel Inputs

Jurors may receive:

- case prompt,
- applicable rule statement,
- the evidence available to the scored advocate,
- the evidence the advocate actually opened,
- the argument,
- the scoring rubric,
- the juror lens.

Jurors must not receive:

- community percentages,
- player rating,
- rank,
- subscription status,
- side popularity,
- opponent identity,
- group membership,
- any hidden “correct answer.”

---

## 14.5 Panel Independence

Each juror evaluates independently.

No juror sees another juror's output.

There is no model-to-model deliberation phase.

This prevents one early output from anchoring the rest of the panel.

---

## 14.6 Determinism

For a fixed:

- case version,
- scoring version,
- evidence state,
- argument text,
- juror identity,

output should be deterministic to the practical extent supported by the selected inference stack.

Use temperature 0 or the equivalent deterministic configuration.

Verdicts must be auditable.

---

# 15. Recommended Scoring Architecture - Independent Scoring

Two scoring architectures are possible.

## 15.1 Head-to-Head

The panel receives both arguments and chooses a winner.

This is intuitive but introduces:

- argument-order bias,
- repeated inference cost for ghosts,
- less stable comparability across matches.

If head-to-head is ever used, argument order must be balanced so half the jurors receive A first and half receive B first.

---

## 15.2 Independent Scoring - Recommended

Each argument is scored in isolation against the same case-specific rubric and panel.

```text
LIVE ARGUMENT
→ juror score vector
→ aggregate score

GHOST ARGUMENT
→ stored juror score vector
→ stored aggregate score

compare
→ verdict
```

Independent scoring is preferred because:

- the ghost's score can be computed once and reused,
- ordering bias is structurally removed,
- scores are comparable across matches under the same scoring version,
- auditing is easier,
- inference cost is lower over time.

---

## 15.3 Stored Score Record

A Ranked submission should store at least:

```ts
type RankedSubmissionScore = {
  submissionId: string;
  caseId: string;
  caseVersion: string;
  scoringVersionId: string;
  side: "defend" | "challenge";
  jurorScores: JurorScore[];
  aggregateScore: number;
  scoredAt: string;
};
```

A stored score is invalid if the case or scoring version changes in a way that changes the rubric.

Re-scoring policy after major version changes remains an operational implementation decision.

---

# 16. Ranked Verdict Reveal

The Ranked verdict is not dumped as a static block.

It reveals sequentially.

Example:

```text
FORMALIST
YOU
1–0

PRAGMATIST
OPPONENT
1–1

SKEPTIC
YOU
2–1

...
```

Each juror provides one short rationale.

The tally builds as the reveal progresses.

This screen should be treated as one of the highest-value moments in the product because it provides:

- competitive suspense,
- immediate payoff,
- free advocacy feedback,
- perceived depth from multiple legal lenses,
- a natural way to cover inference latency.

Rules:

- full-screen,
- no bottom navigation,
- no community percentage inside the Ranked judgment context,
- no indication that one side is legally “correct,”
- rating movement appears only after the competitive result is resolved.

---

# 17. Ranked Evaluation Neutrality Rule

This is a governing constraint.

> **The panel evaluates advocacy. It does not resolve the underlying case as an objective truth.**

A juror may evaluate:

- whether a claim is supported,
- whether opened evidence was used effectively,
- whether reasoning connects evidence to the rule,
- whether the argument is coherent,
- whether the advocate handles ambiguity,
- whether the argument overstates what the evidence proves.

A juror must not evaluate:

- which side the author intended,
- which conclusion is more popular,
- which side the model personally prefers,
- whether the player picked the “correct answer.”

If the panel systematically rewards one side because of the side itself, the case or scoring configuration is not Ranked-safe.

---

# 18. Case Reuse

Case reuse is a feature.

A player may encounter a case in Daily and conclude:

> Do not prosecute.

Later, Ranked may assign:

> **CHALLENGE / PROSECUTE**

The player must now attack their own earlier reasoning.

Replayability survives because:

- assigned side can change,
- evidence bundle can change,
- opened evidence can change,
- ghost opponent changes,
- scoring feedback changes with argument quality,
- the player may understand the case differently over time.

A strong advocate should understand both sides.

One authored case can therefore support multiple experiences without requiring a completely separate content library for every match.

---

# 19. Balance Analytics

Once enough usage exists, CaseDrop should combine authoring judgment, offline validation, and live performance data.

Track separate layers.

## 19.1 Human Community Position

```text
P(DEFEND)
P(CHALLENGE)
```

This answers:

> What do people believe?

This is primarily a Daily/community signal.

---

## 19.2 Competitive Side Performance

```text
W(DEFEND)
W(CHALLENGE)
```

This answers:

> Does one assigned side systematically outperform the other under the scoring system?

This is the governing metric for Side-Lock fairness.

---

## 19.3 Evidence Bundle Performance

```text
W(A1)
W(A2)
W(B1)
W(B2)
...
```

This identifies bundle advantages.

---

## 19.4 Individual Evidence Performance

Track signals such as:

```text
Players opening E4:
54.2% match win rate

Players opening E7:
49.1% match win rate
```

These figures are correlation signals, not automatic proof of causation.

---

## 19.5 Ghost Performance

Track:

- ghost appearance count,
- ghost win/loss rate,
- owner rating band,
- evidence pairing,
- scoring version,
- repeat-opponent frequency,
- age of submission.

This is necessary to detect overpowered or over-served stored arguments.

---

# 20. Pre-Ship Ranked Validation

Before a case enters serious Ranked rotation:

1. Author strong submissions for both sides.
2. Run them through the current scoring system.
3. Test multiple evidence pairings.
4. Confirm neither side systematically receives a scoring advantage.
5. Confirm no one evidence bundle dominates.
6. Confirm the panel critiques advocacy rather than conclusion popularity.
7. Confirm the case's natural human split remains within a reasonable ambiguity band for the intended mode.

If one side wins materially more often under offline validation:

- revise the case,
- revise evidence,
- revise bundle pairings,
- revise rubric language,
- or remove the case from Ranked.

Live data still remains necessary for bundle and evidence monitoring after launch.

---

# 21. Ranked Eligibility and Balance Intervention

A case should be reviewed, suspended, or removed from serious Ranked rotation when data suggests:

- one assigned side has a persistent large performance advantage,
- one evidence bundle substantially outperforms paired bundles,
- a particular evidence item dominates outcomes,
- the natural opinion split becomes too extreme for meaningful advocacy,
- the scoring panel appears to reward conclusion preference rather than argument quality,
- Side-Lock usage concentrates on a statistically dominant side,
- a scoring-version change materially invalidates old ghost scores.

Ranked balance focuses on **competitive opportunity**, not forcing public opinion to become 50/50.

---

# 22. Daily Post-Case Analysis

Daily gains a dedicated post-verdict analysis experience.

The sequence is:

```text
LOCK DECISION
↓
WRITE ≤ 150 WORDS
↓
SUBMIT
↓
COMMUNITY VERDICT
↓
WHY BOTH SIDES WERE DEFENSIBLE
↓
EVIDENCE DEBRIEF
↓
AI ANALYSIS, IF AVAILABLE
↓
LEARN / REVIEW
```

---

## 22.1 Deterministic Evidence Debrief - Ships First

This ships before model-generated coaching.

The player opened two evidence items and left three unopened.

The system already knows what each item was authored to support through:

```text
Evidence.wouldHaveSupported
```

The debrief can therefore show:

- evidence opened,
- evidence unopened,
- what each unopened item could have supported,
- where an unopened item matched a claim the player tried to make.

This layer:

- requires no model,
- has no inference cost,
- is deterministic,
- directly reinforces evidence-selection skill.

---

## 22.2 Analysis Neutrality Rule

This is the governing rule for model-generated Daily analysis.

> **The analysis critiques the advocacy. It never evaluates the conclusion.**

Prohibited:

- saying the player chose the weaker side,
- saying the player reached the wrong answer,
- identifying a hidden correct outcome,
- favouring one position,
- resolving the case ambiguity.

Permitted:

- identifying unsupported claims,
- identifying opened evidence that was never used,
- identifying an unopened item that would have supported a claim the player made,
- identifying overstatement,
- identifying structural weaknesses,
- identifying strong evidence-to-rule connections,
- identifying recurring reasoning patterns across multiple cases.

An analysis that becomes an answer key has failed.

---

## 22.3 Daily Word Limit

```text
DAILY    150 words
RANKED    60 words
```

The word-count split applies to everyone.

Do not sell additional writing length as a premium advantage.

Daily has more room because there is no competitive comparability requirement.

Ranked stays compressed because comparability is part of the game.

---

## 22.4 Analysis Monetization

| Tier | Receives |
|---|---|
| Free | one headline insight + full deterministic evidence debrief |
| Subscriber | full breakdown + all evidence analysis + cross-case reasoning-pattern tracking |

The long-term subscription value is the compounding personal pattern layer, for example:

> You consistently under-use documentary evidence.

or:

> You often make an intent claim before connecting it to a concrete fact.

These patterns should describe reasoning behavior, not declare legal conclusions correct or incorrect.

---

# 23. Learn

Learn is a first-class bottom-navigation destination.

It is the repeat-visit surface for reflection and retained value.

Learn may contain:

- past case reviews,
- post-case analysis archive,
- doctrine explanations,
- Inline Glossary index,
- terms opened and not opened during prior cases,
- evidence debriefs,
- subscriber reasoning-pattern history.

Learn should not become a generic law-school LMS.

It should remain tied to actual CaseDrop play whenever possible.

The ideal feeling is:

> **I played something, then I understood what I missed.**

not:

> I opened an unrelated textbook tab.

---

# 24. Monetization Principle

The monetization boundary is:

```text
FREE PLAYER
fair competitive game
```

```text
SUBSCRIBER
more control, more volume, more analysis depth
```

not:

```text
FREE PLAYER
competitive disadvantage
```

```text
SUBSCRIBER
better chance to win
```

Subscribers may receive:

- Side-Lock Tickets,
- deeper Daily analysis,
- cross-case reasoning-pattern tracking,
- uncapped Ranked play,
- other non-competitive convenience or review features later.

Subscribers must not receive:

- stronger evidence,
- easier opponents,
- extra Ranked argument length,
- favorable panel weighting,
- rating protection,
- hidden information unavailable to free players in the same competitive context,
- access to a statistically dominant side while that side is known to be unbalanced.

---

# 25. Ranked Play Cap

Inference-backed Ranked play creates a real per-user cost.

Therefore v4 requires a free-tier daily Ranked cap.

| Tier | Ranked matches |
|---|---|
| Free | capped per day |
| Subscriber | uncapped |

The exact free cap is **TBD** and should be set from measured retention, session length, conversion behavior, and inference economics rather than cost alone.

The cap changes **volume**, not match fairness.

Rating, evidence quality, ghost quality rules, argument length, and panel treatment remain the same across tiers.

---

# 26. Visual Product Direction

## 26.1 Core UI Label

The closest visual language for CaseDrop is:

- **editorial dark UI**
- **Swiss / typographic brutalism, dark mode**
- **terminal-editorial**
- **data-brutalist**

Its lineage is Swiss graphic design:

- strong grid structure,
- clear hierarchy,
- typography-led layout,
- minimal ornament,
- strict restraint.

Translate that language into a near-black mobile product shell.

A useful comparative target is the minimal, restrained feel associated with Offsuit-style poker mobile interfaces while keeping CaseDrop primarily typographic rather than gamey.

---

## 26.2 Surface System

Use a strict two-surface system:

- **Base:** `#0B0C0D`
- **Card / elevated surface:** `#15171A`

Hairline dividers and borders:

- `rgba(255,255,255,0.07)`

Rules:

- never more than two primary surface tones,
- no gradients,
- no glow,
- no glassmorphism,
- no drop shadows,
- depth comes from spacing and hairline borders.

---

## 26.3 Typography

CaseDrop uses three type families with fixed jobs.

### Headlines

- **Archivo**
- weight **700–800**
- uppercase
- tracking around **-0.03em**
- line-height **0.96–1.0**
- large stacked headlines over 2–3 lines where appropriate

Use for:

- page titles,
- major state labels,
- rank moments,
- verdict declarations.

### Reading / body / labels

- **Instrument Sans**
- weight **400–600**
- line-height **1.45–1.55**

Use for:

- body copy,
- evidence descriptions,
- argument text,
- instructions,
- tab labels.

### Numerical / metadata language

- **JetBrains Mono**
- every number,
- rating,
- XP,
- timer,
- percentage,
- timestamp,
- ID,
- small uppercase metadata label.

Guidance:

- approximately **10.5 px** for small metadata,
- letter spacing around **0.16em**,
- muted grey.

Rule:

> **Numbers should never use the body face.**

---

## 26.4 Color Meaning

Accent colors carry meaning only.

- **Blue** = interactive / primary / actionable
- **Green** = positive / success / gain
- **Amber** = special / rank / premium / event
- **Red** = failure / loss / penalty

Rules:

- greyscale is the palette,
- one screen should generally use at most one accent,
- avoid simultaneous accent clutter,
- no extra brand colors,
- no color merely to make the interface feel lively.

---

## 26.5 Shape and Components

- Use hairline rules between sections where possible.
- Prefer borders and whitespace over heavy containers.
- Use cards only when grouping improves comprehension.
- Progress bars: flat, **4–6 px** tall, lightly rounded.
- Chips: around **8 px** radius.
- Cards: around **13–20 px** radius.
- Avoid excessive pill UI.
- No ornamental illustration system.
- No photo avatars.
- No badge clutter.

---

## 26.6 Copy Tone

CaseDrop copy is:

- flat,
- declarative,
- short,
- slightly institutional,
- factual.

Rules:

- no exclamation marks in core UI,
- no emoji,
- no cheerleading,
- no cartoonish gamification language.

State facts, numbers, conditions, and outcomes with restraint.

---

## 26.7 Avoid List

Do not drift into:

- colorful illustration,
- hero gradients,
- glossy gaming UI,
- playful microcopy,
- photographic avatar systems,
- decorative achievement clutter,
- more than one dominant CTA per screen.

**Icon-plus-label navigation is allowed.**

Icon-only bottom navigation remains prohibited.

Structure should come from:

> **type, spacing, and rules**

not ornament.

---

# 27. Navigation

Bottom navigation contains exactly four destinations:

```text
HOME    RANK    LEARN    PROFILE
```

SVG icons are permitted and recommended when paired with labels.

Labels are mandatory.

---

## 27.1 Home

Home contains:

- Daily entry,
- Ranked entry / status summary as appropriate,
- Sunday card only when live,
- primary group comparison row where applicable,
- progression snapshot,
- current timers or cadence information.

---

## 27.2 Rank

Rank contains:

- rating,
- division / tier,
- wins and losses,
- streak information,
- recent rating movement,
- `GLOBAL / GROUP` toggle when the player belongs to a group.

---

## 27.3 Learn

Learn contains:

- case reviews,
- evidence debriefs,
- analysis history,
- glossary index,
- reasoning-pattern history where available.

---

## 27.4 Profile

Profile contains:

- identity,
- personal statistics,
- history,
- notable performance markers,
- group memberships,
- subscription / entitlement entry points where appropriate.

---

## 27.5 Removed Permanent Tabs

### Jury

Removed.

There is no human jury queue in v4.

### Sunday

Removed from permanent navigation.

Sunday is a Home event card while live.

### Groups

Groups remain untabbed.

They are surfaced inside Home, Rank, and Profile.

---

# 28. Hub Layer and Flow Layer

## 28.1 Hub Layer

Persistent, revisitable destinations:

- Home
- Rank
- Learn
- Profile

Bottom navigation is visible.

---

## 28.2 Flow Layer

Immersive, linear surfaces:

- Case Prompt
- Evidence
- Decision
- Argument
- Submission Locked
- Daily Community Verdict
- Ranked AI Panel Reveal
- Daily Post-Case Analysis when entered directly from a case
- Sunday case flow
- Group Detail

Bottom navigation is hidden.

The purpose is:

- one dominant CTA,
- no mid-decision escape ramp,
- stronger decision weight,
- less visual competition.

---

# 29. Interaction Rules

## 29.1 Evidence

**Model:** pick any 2, cards reveal in place.

Rules:

- five evidence options are visible,
- exactly two may be opened,
- cards reveal inline,
- opened cards remain spatially anchored,
- no disruptive full-screen modal,
- after two opens, proceed.

---

## 29.2 Decision

**Model:** select → **LOCK**.

Rules:

- selection is reversible before lock,
- selected choice becomes visibly active,
- a separate action commits,
- the user must understand the difference between browsing and committing.

---

## 29.3 Argument

**Model:** live word count.

Rules:

- word count always visible,
- cap always explicit,
- Daily cap = **150**,
- Ranked cap = **60**,
- no extra ornament.

---

## 29.4 Ranked Panel Reveal

**Model:** juror-by-juror sequential reveal.

Rules:

- reveal one juror at a time,
- show one short rationale,
- build tally progressively,
- show final rating change after result,
- keep full-screen until complete.

---

## 29.5 Inline Glossary

**Model:** tap → bottom sheet → dismiss → unchanged position.

The underlying screen remains mounted.

---

# 30. Twelve-Screen Master Canvas

The design workspace should show **twelve screens on one pan/zoom canvas**.

This is a design-review rule, not an in-product interaction rule.

The purpose is to review:

- system consistency,
- flow,
- hierarchy,
- transitions,
- Daily vs Ranked distinctions,
- hub vs flow architecture.

Recommended base size remains approximately **390 × 844** per mobile screen unless the implementation target changes.

---

## 30.1 Screen 1 - Home

Purpose:

- primary hub,
- Daily entry,
- Ranked entry,
- Sunday event card when live,
- primary group comparison,
- progression snapshot.

Bottom nav: **visible**

---

## 30.2 Screen 2 - Case Prompt / Intro

Purpose:

- present the case,
- establish legal tension,
- show jurisdiction rule,
- begin Daily or Ranked flow.

Bottom nav: **hidden**

---

## 30.3 Screen 3 - Evidence

Purpose:

- show five evidence options,
- open exactly two,
- reveal inline.

Bottom nav: **hidden**

---

## 30.4 Screen 4 - Decision

Purpose:

- present the key call,
- select,
- **LOCK**.

Daily uses the player's real conclusion.

Ranked frames the decision around the assigned advocacy side where needed.

Bottom nav: **hidden**

---

## 30.5 Screen 5 - Argument

Purpose:

- write the justification / advocacy,
- live word count,
- Daily 150 / Ranked 60.

Bottom nav: **hidden**

---

## 30.6 Screen 6 - Submission Locked

Purpose:

- confirm filing,
- prevent editing,
- bridge into mode-specific result.

Ranked should move into scoring/reveal without an artificial long waiting state.

Bottom nav: **hidden**

---

## 30.7 Screen 7 - Verdict / Reveal

This screen has two mode variants.

### Daily variant

Shows:

- player's position,
- community split,
- “you are in the X%,”
- why both sides were defensible.

### Ranked variant

Shows:

- sequential AI juror reveal,
- one-line rationale per juror,
- live tally,
- final win/loss,
- rating movement.

Bottom nav: **hidden**

---

## 30.8 Screen 8 - Daily Analysis / Evidence Debrief

Purpose:

- show opened and unopened evidence,
- explain what unopened evidence could have supported,
- give free headline insight,
- show deeper analysis for subscribers.

Bottom nav: **hidden** when reached from case flow.

---

## 30.9 Screen 9 - Rank

Purpose:

- rating,
- tier / division,
- streak,
- gains / losses,
- `GLOBAL / GROUP` toggle where eligible.

Bottom nav: **visible**

---

## 30.10 Screen 10 - Profile

Purpose:

- identity,
- statistics,
- history,
- group memberships,
- controlled prestige layer.

Bottom nav: **visible**

---

## 30.11 Screen 11 - Sunday

Purpose:

- weekly event content,
- entered from Home only while live,
- special/event positioning.

Bottom nav: **hidden during the event flow**.

Amber may be the semantic accent.

---

## 30.12 Screen 12 - Learn / Review

Purpose:

- review prior cases,
- doctrine explanation,
- glossary index,
- evidence debrief history,
- analysis history,
- reasoning patterns.

Bottom nav: **visible** as a hub destination.

---

# 31. Inline Glossary

## 31.1 Purpose

Cases contain doctrinal language.

A player who does not know a term should not have to guess or leave the app.

Model:

> **A marked term inside a case opens a neutral definition in place.**

The glossary is different from Learn / Review:

- **Inline Glossary** = during case, term-level, general, neutral.
- **Learn / Review** = after case, issue-level, case-specific reflection.

They can cross-link but do not merge.

---

## 31.2 Where Terms May Appear

Marked terms may appear in:

- case prompt,
- evidence body,
- jurisdiction rule,
- result explanatory copy,
- Ranked feedback copy where appropriate.

Marked terms must not appear in:

- player's own argument input,
- community percentages,
- Rank,
- Profile,
- progression UI.

---

## 31.3 Marking Rule

Terms are authored, not auto-detected.

Rules:

- each marked term is explicitly declared in case data,
- no automatic string matching,
- maximum **four** marked terms per case,
- a term is marked at most once per case, on first appearance,
- no term should be marked inside a sentence carrying decisive evidentiary weight.

Four is a ceiling, not a target.

---

## 31.4 Neutrality Rule

> **A glossary entry defines the concept. It never applies the concept to the current case.**

Prohibited:

- current party names,
- current facts,
- current evidence,
- worked examples based on the live case,
- language favoring a side,
- ambiguity resolution.

Entries are reusable across cases.

If an entry changes meaning based on which case invoked it, it has failed.

---

## 31.5 Visual Treatment

Marked term:

- hairline dotted underline,
- `rgba(255,255,255,0.28)`,
- no accent color,
- no icon,
- no weight change,
- no background.

Do not let glossary affordance compete with the primary CTA.

---

## 31.6 Interaction

Tap opens a bottom sheet over the current screen.

Rules:

- current screen remains mounted,
- scroll position preserved,
- dismiss by backdrop, downward drag, or close control,
- no route change,
- no full-screen takeover,
- no case-state reset,
- any Ranked timer continues while open.

Sheet:

- content-sized,
- capped at approximately **60%** viewport height,
- internally scrollable beyond cap.

---

## 31.7 Sheet Structure

```text
TERM                         Archivo, uppercase
CATEGORY                     JetBrains Mono, muted

MEANING                      Instrument Sans, ≤ 60 words

HEARD AS                     one generic sentence

RELATED                      up to 3 terms
```

Rules:

- Meaning ≤ 60 words.
- Heard As ≤ one sentence.
- Related ≤ three entries.
- No images.
- No citation apparatus.
- No jurisdiction-specific application.
- No external links.

Target read time: **30–45 seconds**.

Related-term navigation replaces sheet content in place.

Depth cap: **three entries per open session**.

---

## 31.8 Ranked Behavior

Glossary is available in Daily and Ranked.

Rules:

- universal access,
- not rationed,
- not scored,
- no subscription advantage,
- Ranked clock continues while open if a clock exists.

Vocabulary access is not a competitive resource.

---

## 31.9 Data Model

```text
GlossaryEntry
  id                string
  term              string
  category          objection | courtroom_term |
                    legal_concept | procedure
  meaning           string      ≤ 60 words
  heardAs           string      ≤ 1 sentence
  related           string[]    ≤ 3 ids
```

Case declaration:

```text
Case.markedTerms
  entryId           string
  anchor            string
  location          prompt | evidence:<id> | rule | verdict
```

Build validation:

- every entry resolves,
- every anchor occurs exactly once in declared location,
- no more than four marks,
- no duplicate entry within one case,
- no case-specific glossary content.

A failing case does not ship with invalid marks.

---

## 31.10 Relationship to Learn

After a case, Learn may surface:

- terms opened,
- terms not opened,
- links into full entries.

Opened/unopened glossary state:

- is recorded per case,
- is never shown before resolution,
- never affects scoring,
- is never shown to an opponent.

Initial content target remains approximately **25 entries**, authored from the needs of real shipped cases rather than as a standalone dictionary project.

---

# 32. Community Groups

## 32.1 Purpose

Global community percentages are informative but impersonal.

Groups answer:

> **How did my people decide?**

A 61/39 global split is a statistic.

A 61/39 split among people the player knows can create a stronger social comparison.

---

## 32.2 Structural Rule

Groups do not receive a bottom-navigation destination.

They appear inside:

- Home,
- Rank,
- Profile,

plus a full-screen Group Detail surface.

Groups are a lens on existing data, not a separate social network.

---

## 32.3 Home Surface

When the player has a primary group:

- show one hairline-separated row beneath relevant community data,
- show group name,
- show group split when threshold is met,
- show participation count,
- tap opens Group Detail.

If the player has no group, the row is absent.

---

## 32.4 Rank Surface

Show:

```text
GLOBAL / GROUP
```

when the player belongs to a group.

Group standing uses the same global rating.

There is:

- no separate group rating,
- no separate group ladder,
- no group-only progression.

---

## 32.5 Profile Surface

Profile contains a `GROUPS` section with:

- memberships,
- create,
- join,
- leave,
- primary-group designation.

---

## 32.6 Group Detail

Full-screen, no bottom navigation.

Contents in order:

1. group name and member count,
2. today's case split among eligible members,
3. member standings by rating,
4. highest-rated eligible argument of the day within the group,
5. leave control.

Nothing else ships in v1.

---

## 32.7 Membership

Invite code only.

Rules:

- group created with name,
- generates an **8-character** invite code,
- code is the sole join mechanism,
- no directory,
- no search,
- no recommendations,
- no discovery feed,
- maximum **200** members per group,
- player may belong to at most **three** groups,
- exactly one group is primary.

---

## 32.8 Explicit Exclusions

Do not ship:

- free-text posts,
- threads,
- replies,
- DMs,
- reactions,
- group chat,
- group-versus-group events,
- member roles beyond creator,
- group avatars,
- banners,
- descriptions,
- public group profiles.

> **Community in CaseDrop means seeing how your people decided. It does not mean talking to them.**

---

## 32.9 Competitive Integrity

Group membership must not alter Ranked.

Rules:

- no group-based side assignment,
- no group-based ghost selection preference,
- no group-based panel treatment,
- no group-based rating modification,
- group standing is only a filtered view of global rating.

A ghost's identity is not provided to the AI panel.

Group context must never enter the scoring prompt.

---

## 32.10 Visibility Rules

Within a group, members may see:

- display name,
- rating and rank band,
- today's Daily decision only after the viewer has submitted their own,
- eligible resolved argument highlights where product rules permit.

Members may not see:

- unsubmitted case state,
- another player's unresolved evidence state,
- another player's argument before that argument is eligible for post-resolution display,
- content from a case the viewer has not yet played if that would spoil the case.

---

## 32.11 Population Behavior

A group split appears only when at least **five members** have submitted on that case.

Below threshold:

- show participation count,
- do not show percentages.

For empty or single-member groups:

- no split,
- no meaningful leaderboard,
- no top argument.

State the condition plainly and expose the invite code.

---

## 32.12 Moderation Surface

Free text specific to groups is limited to **group names**.

Rules:

- names are reportable,
- reported names can be reviewed and renamed,
- no additional group-authored text fields ship in v1.

Arguments remain governed by existing case and submission rules rather than a separate group content system.

---

## 32.13 Data Model

```text
Group
  id                string
  name              string        ≤ 40 chars
  inviteCode        string        8 chars
  createdBy         playerId
  createdAt         timestamp
  memberCount       int           ≤ 200
```

```text
GroupMembership
  groupId           string
  playerId          string
  joinedAt          timestamp
  isPrimary         bool
```

Access requirements:

- membership lists readable only by members,
- group result content obeys spoiler gates,
- group data never enters Ranked scoring context.

---

# 33. Core Data Additions

The following data objects are required or implied by v4.

## 33.1 Evidence

```ts
type Evidence = {
  id: string;
  wouldHaveSupported: string[];
  // authored case fields omitted here
};
```

---

## 33.2 Side Assignment

```ts
type SideAssignmentState = {
  lastSide: "defend" | "challenge" | null;
  consecutiveSideCount: number;
};
```

---

## 33.3 Ranked Submission

```ts
type RankedSubmission = {
  id: string;
  playerId: string | null;      // null for authored seeds
  caseId: string;
  caseVersion: string;
  side: "defend" | "challenge";
  bundleId: string;
  openedEvidenceIds: string[];
  argument: string;
  wordCount: number;
  isSeed: boolean;
  createdAt: string;
};
```

---

## 33.4 Scoring Version

```ts
type ScoringVersion = {
  id: string;
  rubricVersion: string;
  modelId: string;
  jurorRosterVersion: string;
  casePanelSeedRuleVersion: string;
  createdAt: string;
};
```

---

## 33.5 Ranked Score

```ts
type RankedSubmissionScore = {
  submissionId: string;
  scoringVersionId: string;
  jurorScores: {
    jurorId: string;
    score: number;
    rationale: string;
  }[];
  aggregateScore: number;
  scoredAt: string;
};
```

---

## 33.6 Glossary

Use the structures defined in §31.9.

---

## 33.7 Groups

Use the structures defined in §32.13.

---

# 34. Inference Cost Planning

The figures below are retained as **planning assumptions from the 2026-08 v3 revision**. They are not product rules and should be revalidated whenever model pricing or token behavior changes.

Pricing basis recorded in the source blueprint:

| Model | Input / MTok | Output / MTok | Min cacheable prefix |
|---|---:|---:|---:|
| Claude Opus 5 | $5.00 | $25.00 | 512 |
| Claude Sonnet 5 | $3.00 | $15.00 | 1,024 |
| Claude Haiku 4.5 | $1.00 | $5.00 | 4,096 |

---

## 34.1 Ranked Planning Estimate

Source assumptions:

- ~3,500 cached-prefix tokens,
- ~1,000 uncached tokens,
- ~600 output tokens,
- one panel call rather than ten separate calls.

Recorded estimates:

| Model | Head-to-head | Independent scoring |
|---|---:|---:|
| Claude Opus 5 | ~$0.022 | ~$0.019 |
| Claude Sonnet 5 | ~$0.013 | ~$0.011 |
| Claude Haiku 4.5 | ~$0.0075 | ~$0.0065 |

The important architectural conclusion remains:

> **Independent scoring becomes cheaper over time because ghost scores are reusable.**

---

## 34.2 Daily Planning Estimate

Deterministic evidence debrief:

```text
$0 inference cost
```

Recorded model-analysis estimates:

| Model | Cost per analyzed Daily case |
|---|---:|
| Claude Opus 5 | ~$0.011 |
| Claude Sonnet 5 | ~$0.0067 |
| Claude Haiku 4.5 | ~$0.0045 |

---

## 34.3 Recorded 10,000-DAU Projection

Source scenario:

- 10,000 daily active users,
- one Daily case per user,
- three Ranked matches per user per day.

Recorded projection:

| Model | Per day | Per month | Per user / month |
|---|---:|---:|---:|
| Claude Opus 5 | ~$766 | ~$23,000 | ~$2.30 |
| Claude Sonnet 5 | ~$460 | ~$13,800 | ~$1.38 |
| Claude Haiku 4.5 | ~$270 | ~$8,100 | ~$0.81 |

These numbers motivated the free Ranked cap in §25.

---

## 34.4 Cost Engineering Rules

- Put stable case text, evidence set, and rubric in the cacheable prefix.
- Keep volatile argument content after the stable prefix.
- Do not make ten separate API calls when one structured panel call can return all juror outputs.
- Reuse stored ghost scores under the same case and scoring version.
- Make cache minimums explicit in implementation tests so a supposedly cached prompt does not silently bill at full input rate.
- Treat pricing as an operational parameter, not a fixed gameplay assumption.

---

# 35. Failure and Reliability Behavior

Inference failure must not make Ranked unusable.

Normal expectation:

> verdict resolves in-session.

Fallback:

1. preserve the submitted argument,
2. preserve the selected evidence state,
3. mark scoring as pending,
4. retry under a bounded server-side policy,
5. deliver the verdict when scoring succeeds.

The UI should not lose the submission or make the player rewrite it.

A rare fallback may become asynchronous, but asynchronous waiting is a **failure mode**, not the normal Ranked design.

The system should log:

- scoring failures,
- timeouts,
- malformed outputs,
- scoring-version mismatches,
- cache misses,
- re-score events.

---

# 36. Launch Order

Recommended implementation sequence:

## Phase 1 - Core Product Loop

1. Daily case flow.
2. Evidence open-two mechanic.
3. Decision → LOCK.
4. Daily 150-word argument.
5. Community verdict.
6. Why-both-sides-were-defensible copy.
7. Deterministic evidence debrief.

## Phase 2 - Ranked Without Population Dependency

1. Fairness-weighted side assignment.
2. Pre-authored Ranked bundles.
3. Seed ghost arguments.
4. Ghost selection.
5. Ranked 60-word argument.
6. Independent scoring.
7. Sequential AI panel reveal.
8. Rating updates.

## Phase 3 - Retention Surfaces

1. Learn tab.
2. Glossary index.
3. Past case review.
4. AI Daily analysis.
5. Cross-case reasoning patterns.

## Phase 4 - Social / Monetization Layers

1. Groups.
2. Side-Lock Tickets.
3. Free Ranked cap / subscriber uncapped entitlement.
4. Sunday event card and live event flow.

The phases may overlap technically, but product testing should preserve this dependency order.

---

# 37. Confirmed Rules vs TBD

## 37.1 Confirmed

### Product

- Daily = judgment.
- Ranked = advocacy.
- Cases should support intelligent disagreement.
- The product must not reveal a hidden correct answer.

### Daily

- open two of five evidence items,
- select → LOCK,
- 150-word cap,
- human community split,
- deterministic evidence debrief,
- analysis critiques advocacy, not conclusion.

### Ranked

- DEFEND vs CHALLENGE,
- fairness-weighted random assignment,
- +5 percentage points toward opposite side per repeated assignment,
- 75/25 cap,
- reset after streak breaks,
- hidden assignment probabilities,
- ghost matching,
- 60-word cap,
- AI panel,
- independent scoring preferred,
- sequential juror reveal,
- normal verdict within session,
- Side-Lock before case reveal.

### Navigation

- Home / Rank / Learn / Profile,
- SVG icon + label allowed,
- Jury tab removed,
- Sunday surfaced from Home,
- Groups remain embedded.

### Visual

- near-black / dark editorial system,
- two core surface tones,
- Archivo / Instrument Sans / JetBrains Mono,
- semantic accent colors only,
- no gradients, glow, glassmorphism, or decorative game clutter.

### Glossary

- authored terms,
- max four per case,
- neutral definitions,
- bottom-sheet interaction,
- universal access.

### Groups

- invite-only,
- max 200 members,
- max three groups per player,
- one primary group,
- no chat/posts/DMs,
- no effect on Ranked.

---

## 37.2 TBD Before Production

- exact Side-Lock Ticket allowance,
- Side-Lock regeneration schedule,
- exact free Ranked daily cap,
- exact subscription price and entitlement packaging,
- final AI model/provider,
- final scoring rubric,
- final 24-juror roster,
- ghost rating reuse / anti-farming guard,
- ghost exposure limits,
- re-scoring policy when scoring versions change,
- Sunday rules and rewards,
- final rating formula,
- exact panel score normalization if needed,
- model-analysis retention and privacy policy,
- production moderation workflow for group names.

---

# 38. Product Success Test

If v4 is working correctly, CaseDrop should feel like:

- a legal judgment game in Daily,
- an advocacy duel in Ranked,
- a serious but fast mobile product,
- a system where players can play another round immediately,
- an educational experience without becoming an LMS,
- a social comparison product without becoming a chat network,
- a subscription product without selling competitive advantage.

It should not feel like:

- a hidden-answer legal quiz,
- a waiting room for other players,
- unpaid jury work,
- a colorful trivia app,
- a generic AI tutor,
- a pay-to-win debate game.

The target feeling is:

> **minimal, severe, readable, immediate, intelligent, and competitive.**

---

# Appendix A - v3 → v4 Consolidation Map

This appendix is non-normative. It records what was rewritten or deleted so implementation and design work do not accidentally follow superseded v3 language.

| v3 section | v4 treatment |
|---|---|
| §2 Daily flow | Rewritten to 150-word Daily, community verdict, evidence debrief, and optional AI analysis. |
| §2 Ranked identity | Preserved, but live two-player framing removed. |
| §3 Ranked Match Structure | Rewritten completely for ghost matching and in-session AI verdicts. |
| §4 Fairness | Preserved and expanded with evaluation fairness. |
| §5 Fairness-Weighted Assignment | Preserved. |
| §6 Two-Player Assignment Conflicts | **Deleted.** Ghost matching removes the conflict. |
| §7 Assignment Data Model | Preserved and simplified for one live-player assignment. |
| §8.1–§8.3 Side-Lock Tickets | Preserved. |
| §8.4 Matchmaking With Tickets | **Deleted/replaced.** Ghost matching makes same-side ticket conflicts impossible. |
| §8.5 Fairness Streak Interaction | Preserved. |
| §9 Pay-to-Win Guard | Preserved, now governed by AI-panel competitive side performance. |
| §10 Evidence System | Preserved and extended with `wouldHaveSupported`. |
| §11 Human Jury Design | **Deleted in full.** Replaced by AI panel and independent scoring. |
| §12 Case Reuse | Preserved, updated from “jury changes” to ghost/panel variation. |
| §13.1 Community Position | Preserved as Daily human signal. |
| §13.2 Competitive Side Win Rate | Preserved conceptually, now measures AI-scored competitive outcomes rather than human jury voting. |
| §13.3 Bundle Performance | Preserved. |
| §13.4 Evidence Performance | Preserved. |
| §14 Balance Intervention | Rewritten to add offline pre-ship panel validation and scoring-version checks. |
| §15 Monetization Principle | Preserved and extended with Ranked volume cap and analysis depth. |
| §16 Confirmed Ranked Rules | Rewritten into consolidated §37; obsolete jury language removed. |
| §17 Product Principle | Preserved as governing principle. |
| §18 Visual Direction | Preserved. Icon-plus-label navigation explicitly allowed. |
| §19 Five-tab Navigation | **Rewritten.** Now Home / Rank / Learn / Profile. Jury removed; Sunday moved to Home. |
| §20.1 Evidence | Preserved. |
| §20.2 Decision | Preserved. |
| §20.3 Argument | Rewritten to Daily 150 / Ranked 60. |
| §20.4 Human Jury Interaction | **Deleted.** Replaced by AI panel reveal interaction. |
| §21 Twelve-Screen Canvas | Rewritten: Jury screen removed, Daily Analysis added, Verdict becomes mode-specific, Sunday remains a Home-entered screen. |
| §22 Hub / Flow Principle | Preserved with new four-tab hub and AI/Daily analysis flow surfaces. |
| §23 UI Summary | Preserved in spirit and updated in §38. |
| §24 Inline Glossary | Preserved; jury references generalized to Ranked feedback/result contexts. |
| §25 Community Groups | Preserved; human-jury-specific integrity language removed and replaced with ghost/panel isolation. |
| §26 Amendment Register | **Deleted as normative content.** v4 is consolidated and no longer requires amendment precedence. |
| §27 v3 Revision | **Integrated throughout v4.** It no longer exists as a patch section. |

---

# Appendix B - Governing Precedence

This file is the consolidated source of truth for the CaseDrop product direction as of **2026-08-16**.

If an older CaseDrop blueprint, prototype note, or design instruction conflicts with this file, this file governs unless a later dated revision explicitly supersedes it.
