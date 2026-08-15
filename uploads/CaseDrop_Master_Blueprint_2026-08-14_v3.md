# CaseDrop — Updated Product & Ranked PvP Blueprint

**Version:** 2026-08-14  
**Status:** Working product blueprint  
**Primary design principle:** CaseDrop should test judgment in solo play and advocacy in competitive play without turning legal ambiguity into a hidden “correct answer” quiz.

---

## 1. Product Thesis

CaseDrop is a fast, social legal-reasoning game built around ambiguous cases.

The core fantasy is not:

> Can I guess the author's intended answer?

It is:

> **Can I form a defensible judgment, and can I out-argue another person from the evidence available to me?**

Cases should avoid obvious guilty/not-guilty or clearly right/wrong outcomes whenever possible. A strong CaseDrop case should contain enough ambiguity that intelligent players can reasonably disagree.

For authoring, the initial target is usually around a **60/40 natural opinion split**, not because every case must literally poll at 60/40, but because neither side should feel absurd.

A case that ultimately tests at 89/11 may still be useful for Daily, Learn, or special challenges, but it should normally not enter serious Ranked PvP.

---

# 2. Two Core Modes

## DAILY — Judgment

**Question:** *What do YOU think?*

Daily measures the player's own judgment.

Flow:

1. Receive the case.
2. Read the case prompt.
3. Inspect/select limited evidence.
4. Reach a personal decision.
5. Write a short justification.
6. Submit.
7. Discover how the community responded.
8. Later see discussion, jury/community reaction, and related learning material.

Daily does **not** assign the player a side.

The player is expressing their actual conclusion.

Core emotional payoff:

> **“I’m in the 38%. Why?”**

Daily = **belief / judgment**.

---

## RANKED — Advocacy

**Question:** *Can you make the case?*

Ranked does not ask what the player personally believes.

Two players receive the same base case and are assigned opposing positions:

- **DEFEND**
- **CHALLENGE**

The instruction is:

> **This is your side. Make the strongest case you can.**

Ranked measures whether a player can reason persuasively from the hand they were dealt.

Ranked = **advocacy / ability**.

This distinction is fundamental:

**Daily asks what you believe. Ranked asks what you can argue.**

---

# 3. Ranked Match Structure

```text
MATCH FOUND

        Player A
           │
           │
      SAME BASE CASE
           │
       ↙       ↘
   DEFEND     CHALLENGE
      │           │
      │   balanced evidence
      │      opportunity
      │           │
  5 evidence   5 evidence
   options      options
      │           │
   open 2       open 2
      │           │
    write        write
   argument     argument
       └────┬────┘
            ↓
          FILED
            ↓
     ANONYMOUS JURY
            ↓
        A vs B vote
            ↓
       VERDICT LATER
```

Recommended Ranked loop:

1. **Match found.**
2. Side preference locks, if any, are resolved.
3. Same case is assigned to both players.
4. **ASSIGNING COUNSEL...** reveal animation plays.
5. One player receives DEFEND and the other CHALLENGE.
6. Both receive pre-authored, balanced evidence bundles.
7. Each may inspect exactly two evidence items.
8. Each writes a short argument, currently targeted at roughly **60 words**.
9. Submission locks.
10. Overall case-opinion distribution may be shown, but the opponent's argument remains hidden.
11. Both arguments enter the anonymous Jury queue.
12. Jurors compare the two submissions and the evidence each advocate actually used.
13. The match resolves after the required jury confidence / vote threshold.
14. Verdict arrives asynchronously.
15. Rating updates based on win/loss and opponent rating.
16. **Play Again.**

Ranked should remain asynchronous. Both competitors do not need to be online at the same moment.

---

# 4. The Three Separate Fairness Problems

Ranked fairness must be treated as three independent systems.

## 4.1 Position Balance

Question:

> Can both assigned positions be reasonably defended?

Initial authoring target:

```text
approximately 40/60 to 60/40
```

A looser early eligibility band can be used during testing:

```text
35/65 to 65/35
```

The key distinction is that **community opinion does not need to be 50/50**.

A strong CaseDrop case may produce:

```text
Community belief:
DEFEND     60%
CHALLENGE  40%
```

while Ranked produces:

```text
Competitive win rate:
DEFEND     50.8%
CHALLENGE  49.2%
```

That is excellent.

One position may feel more intuitive while both remain competitively viable.

---

## 4.2 Evidence Opportunity Balance

Evidence does not need to be identical.

The requirement is:

```text
Evidence A ≠ Evidence B
```

but:

```text
Argumentative opportunity A ≈ Argumentative opportunity B
```

Players should not receive mirrored copies of the same facts simply for the appearance of fairness.

They should receive different, strategically comparable opportunities.

Possible evidence functions include:

| Function | Example purpose |
|---|---|
| Core support | strongest fact for the position |
| Intent | supports or undermines state of mind |
| Authority / rule | supports permission, prohibition, duty, revocation, etc. |
| Credibility / context | attacks the opposing interpretation |
| Wild card | indirect, ambiguous, or unusually powerful fact |

These functions can help authors balance bundles without pretending that two different facts have identical numerical value.

---

## 4.3 Assignment Fairness

Question:

> Has this player repeatedly been assigned the same side?

Ranked should **not** use a completely independent 50/50 coin flip forever.

Pure randomness can produce technically fair but psychologically terrible streaks.

Instead, CaseDrop uses **fairness-weighted randomness**.

The user still experiences uncertainty.

The system quietly reduces excessive same-side streaks.

---

# 5. Fairness-Weighted Side Assignment

## 5.1 Base Rule

Every player begins at:

```text
DEFEND     50%
CHALLENGE  50%
```

If the player receives the same side repeatedly, the next game's weighting moves **5 percentage points toward the opposite side** for each consecutive assignment.

Example: the player has repeatedly received DEFEND.

| Current consecutive assignments | Next DEFEND weight | Next CHALLENGE weight |
|---|---:|---:|
| none | 50% | 50% |
| D | 45% | 55% |
| D D | 40% | 60% |
| D D D | 35% | 65% |
| D D D D | 30% | 70% |
| D D D D D+ | 25% | 75% |

The same rule operates symmetrically for repeated CHALLENGE assignments.

---

## 5.2 Reset Rule

The moment the streak breaks, the correction fully resets.

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

their following match returns to:

```text
DEFEND     50%
CHALLENGE  50%
```

There is **no gradual decay after the correction succeeds**.

The system resets immediately.

---

## 5.3 Probability Cap

The correction should not become a guaranteed assignment.

Recommended v1 cap:

```text
75% / 25%
```

Therefore a long streak never reaches 100/0.

This preserves unpredictability and prevents players from knowing their next role with certainty.

---

## 5.4 Player-Facing Presentation

Do **not** display:

> “You currently have a 65% chance of CHALLENGE.”

Players should not be encouraged to optimize around the hidden correction system.

Player-facing language remains simple:

> **Sides are assigned automatically.**

The reveal can still visually feel random:

```text
ASSIGNING COUNSEL...

CHALLENGE
```

The fairness logic stays internal.

---

# 6. Resolving Two-Player Assignment Conflicts

The algorithm cannot independently roll each player's desired probability because one match always requires:

```text
1 × DEFEND
1 × CHALLENGE
```

There are only two valid configurations:

```text
Configuration A
Player 1 = DEFEND
Player 2 = CHALLENGE
```

or:

```text
Configuration B
Player 1 = CHALLENGE
Player 2 = DEFEND
```

The matchmaker should compare both players' fairness pressure.

Example:

```text
Player A:
D D D D D
→ strong correction toward CHALLENGE

Player B:
D
→ mild correction toward CHALLENGE
```

Both players cannot receive CHALLENGE.

Player A should receive **greater probability priority** because A has the longer unresolved streak.

Important:

> **Priority does not mean guarantee.**

The stronger correction increases the chance that the more imbalanced player receives the corrective side while preserving randomness.

If both players have identical correction pressure toward the same side, the two valid configurations return to an effective 50/50 choice.

---

# 7. Recommended Assignment Data Model

A minimal player-side state can be represented as:

```ts
type Side = "defend" | "challenge";

type SideAssignmentState = {
  lastSide: Side | null;
  consecutiveSideCount: number;
};
```

The system does not need lifetime side imbalance for v1.

The confirmed v1 mechanic is based on the **current consecutive-side streak**.

Conceptually:

```ts
function preferredOppositeWeight(streak: number) {
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

  // Fairness correction itself is reset.
  // The new side begins a fresh streak.
}
```

For matchmaking, evaluate the two legal Player A / Player B configurations rather than independently rolling a role for each person.

---

# 8. Side-Lock Tickets

Some players will genuinely prefer one form of advocacy.

A player might think:

> **I want to play CHALLENGE tonight.**

CaseDrop can monetize that preference without selling competitive power.

## 8.1 Product Concept

Subscribers receive a limited number of **Side-Lock Tickets**.

Example player action:

> **Use a ticket to lock CHALLENGE for your next Ranked match.**

or:

> **Use a ticket to lock DEFEND for your next Ranked match.**

The final ticket allowance and regeneration schedule are **TBD**.

A limited allowance is preferred over unlimited permanent side selection.

---

## 8.2 What a Ticket Does

A Side-Lock Ticket guarantees the chosen side for the next eligible Ranked match.

A ticket changes:

```text
role preference
```

It does **not** change:

```text
rating
rating gain/loss
opponent quality
evidence quality
jury treatment
case difficulty
argument limits
```

The player purchases **preference**, not power.

---

## 8.3 Ticket Timing

Recommended rule:

> **A player locks their side before the case is revealed.**

This prevents players from seeing a particular case and purchasing whichever side appears easier.

Flow:

```text
Ranked
↓
optional: USE SIDE-LOCK TICKET
↓
choose DEFEND / CHALLENGE
↓
matchmaking
↓
case revealed
```

---

## 8.4 Matchmaking With Tickets

A ticket must actually mean **guaranteed**.

If Player A locks CHALLENGE, matchmaking should seek:

1. a player who locked DEFEND, or
2. a normal player who can legally receive DEFEND.

Two players who both lock CHALLENGE should not be paired with each other.

Likewise:

```text
CHALLENGE LOCK + CHALLENGE LOCK
= incompatible pairing
```

The matchmaker should find compatible opponents instead of overriding one paid preference.

---

## 8.5 Interaction With the Fairness Streak

A ticket assignment counts as a real side assignment.

Example:

```text
D D D
```

The player's natural next-match correction favors CHALLENGE at 65%.

They use a ticket to guarantee CHALLENGE:

```text
D D D C(ticket)
```

The prior DEFEND streak is broken.

The following normal match begins again at:

```text
50 / 50
```

A ticket should never allow a player to preserve an old correction bonus after deliberately receiving the corrective side.

---

# 9. Why Side-Lock Tickets Are Not Pay-to-Win

This only works if Ranked side balance remains healthy.

CaseDrop must continuously distinguish:

```text
position popularity
```

from:

```text
competitive side win rate
```

For example:

```text
Community belief:
DEFEND 61%
CHALLENGE 39%
```

can be acceptable if competitive results remain approximately:

```text
Ranked victories:
DEFEND 49.6%
CHALLENGE 50.4%
```

If CHALLENGE starts winning 60% of Ranked matches, selling CHALLENGE locks becomes a competitive advantage.

That must trigger balance review.

Therefore Side-Lock Tickets are acceptable only while the game maintains approximately equal **competitive opportunity** between the two assigned sides.

---

# 10. Evidence System

## 10.1 Preferred Model: Same Universe, Mixed Bundles

Do not give each side five obviously side-supporting cards.

That reduces evidence selection to:

> “I am DEFEND, so I choose one of the five defense clues.”

Instead, both players draw from the **same larger case universe**, but receive different pre-authored subsets containing:

- helpful information,
- harmful information,
- ambiguous information,
- incomplete information.

Example complete case:

```text
E1 E2 E3 E4 E5 E6 E7 E8 E9 E10
```

Player A bundle:

```text
E1 E2 E4 E7 E9
```

Player B bundle:

```text
E2 E3 E5 E8 E10
```

Each player may inspect only two.

Now evidence selection becomes:

> **Which information do I investigate?**

instead of:

> Which supporting weapon do I choose?

That preserves the “Damn, I should have opened that one” feeling.

---

## 10.2 Pre-Author Bundles

Do not initially sample five evidence items completely at random.

Blind procedural randomization will eventually create terrible matchups.

Author explicit bundles:

```text
SIDE A

A1 = [E1, E2, E5, E7, E9]
A2 = [E1, E3, E4, E8, E10]
A3 = [...]
```

```text
SIDE B

B1 = [E2, E3, E6, E8, E10]
B2 = [...]
B3 = [...]
```

Then pre-pair combinations believed to be competitively fair:

```text
A1 ↔ B2
A2 ↔ B3
A3 ↔ B1
```

Live player data can later validate or invalidate those assumptions.

---

# 11. Jury Design

Jurors must evaluate advocacy based on the information each player actually possessed.

The Jury screen should show:

```text
ARGUMENT A

[submission]

BASED ON:
Termination Email
Security Log
```

versus:

```text
ARGUMENT B

[submission]

BASED ON:
Manager Messages
Employee Handbook
```

Primary Jury question:

> **Which advocate made the stronger case from the evidence available to them?**

That wording matters.

The jury is evaluating:

```text
quality of advocacy given available information
```

not merely:

```text
who happened to receive the stronger fact
```

Evidence choice itself becomes part of the player's visible strategy.

---

# 12. Case Reuse

Ranked makes case reuse a feature rather than a weakness.

A player may previously have encountered a case in Daily and personally concluded:

> Do not prosecute.

Later, Ranked can assign:

> **CHALLENGE / PROSECUTE**

The player must now attack their own earlier reasoning.

Knowing the base case does not necessarily ruin replayability because:

- the assigned side can change,
- the evidence bundle can change,
- the evidence opened can change,
- the opponent changes,
- the jury changes.

A strong advocate should understand both sides.

This also allows the same authored case to power multiple experiences without requiring a completely new content library for every Ranked match.

---

# 13. Live Balance Analytics

Once enough players exist, CaseDrop should stop relying entirely on author intuition.

Track at least four separate layers.

## 13.1 Community Position

```text
P(DEFEND)
P(CHALLENGE)
```

This answers:

> What do people believe?

---

## 13.2 Competitive Side Win Rate

```text
W(DEFEND)
W(CHALLENGE)
```

This answers:

> Can both sides win fairly when assigned?

---

## 13.3 Evidence Bundle Performance

```text
W(A1)
W(A2)
W(B1)
W(B2)
...
```

This identifies bundles that produce abnormal advantages.

---

## 13.4 Individual Evidence Performance

Track relationships such as:

```text
Players opening E4:
54.2% match win rate

Players opening E7:
49.1% match win rate
```

These statistics should not automatically prove causation, but they are valuable balance signals.

Over time, real players become part of the case-balancing feedback loop.

---

# 14. Ranked Eligibility and Balance Intervention

A case should be reviewed or removed from serious Ranked rotation when data suggests:

- one assigned side has a persistent large win-rate advantage,
- one evidence bundle substantially outperforms its paired bundle,
- the natural position split becomes too extreme,
- a particular evidence item dominates outcomes,
- jury results suggest jurors are voting primarily on preferred conclusion rather than advocacy,
- Side-Lock Ticket usage creates meaningful matchmaking distortion.

Ranked balance should focus on **competitive opportunity**, not forcing public opinion itself to become 50/50.

---

# 15. Monetization Principle

The monetization boundary is:

```text
Free player:
fair competitive game
```

```text
Subscriber:
more control over preferred experience
```

not:

```text
Free player:
competitive disadvantage
```

```text
Subscriber:
better chance to win
```

Side-Lock Tickets fit CaseDrop because they sell **agency over role preference**.

They must never sell:

- stronger evidence,
- easier opponents,
- extra argument length,
- jury weighting,
- rating protection,
- knowledge unavailable to the opponent,
- access to a statistically dominant side without balance intervention.

---

# 16. Current Confirmed Ranked Rules

As of this blueprint revision:

### Case philosophy
- Cases should support intelligent disagreement.
- Approximately 60/40 natural opinion is a useful authoring target.
- Competitive side viability should aim much closer to 50/50.

### Ranked identity
- Same base case.
- Opposing assigned sides.
- DEFEND vs CHALLENGE.
- Ranked measures advocacy, not personal belief.
- Jury resolves the matchup asynchronously.

### Evidence
- Evidence opportunity must be comparable, not identical.
- Mixed pre-authored evidence bundles are preferred.
- Players currently inspect two from five available items.
- Jury sees the evidence actually used.

### Assignment fairness
- Base assignment is 50/50.
- Each consecutive same-side assignment adds **5 percentage points** toward the opposite side.
- The correction caps at **75/25**.
- When the player receives the opposite side, the old streak correction resets to **50/50**.
- Two-player conflicts are resolved by comparing both players' correction pressure.
- The exact internal percentages are hidden from players.

### Side-Lock Tickets
- Subscription-based side preference is allowed.
- A ticket guarantees DEFEND or CHALLENGE for one eligible Ranked match.
- Lock occurs before the case reveal.
- Matchmaking must find a compatible opposing assignment.
- Ticket use does not change competitive rewards or resources.
- A ticket that breaks a side streak resets the previous fairness correction.
- Ticket quantity / regeneration schedule remains TBD.

---

# 17. Product Principle to Keep

CaseDrop should never feel like:

> **Guess what the author thinks.**

Daily should feel like:

> **What do I think, and how do other people see this?**

Ranked should feel like:

> **Give me a side and a limited case file. I’ll make the case.**

The ideal CaseDrop case can simultaneously be:

```text
60 / 40 in belief
```

and:

```text
50 / 50 in competitive viability
```

That is not a contradiction.

It is the foundation of the game.


---

# 18. Visual Product Direction

## 18.1 Canvas Planning

The design workspace should be laid out as:

> **Twelve screens on one canvas, with pan/zoom to move around.**

This is a presentation and design-review rule, not an in-product interaction rule.

The purpose is to let the entire CaseDrop product system be reviewed spatially as one connected experience rather than as isolated Figma frames. It should support:

- flow review,
- information hierarchy review,
- transition review,
- design consistency review,
- quick comparison between Daily, Ranked, and profile/progression screens.

---

## 18.2 Core UI Label

The closest visual language for CaseDrop is:

- **editorial dark UI**
- **Swiss / typographic brutalism, dark mode**
- sometimes described as **terminal-editorial**
- sometimes described as **data-brutalist**

Its lineage is Swiss graphic design:

- strong grid structure,
- clear hierarchy,
- typography-led layout,
- minimal ornament,
- strict restraint.

That visual language should be translated into a near-black mobile product shell.

A useful comparative target is the **minimal, simple, restrained UI feel associated with Offsuit-style poker mobile interfaces**, while keeping CaseDrop's structure primarily typographic rather than gamey or decorative.

---

## 18.3 Design System

### Surface System

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
- depth comes from spacing and hairline borders only.

---

### Typography

CaseDrop uses three type families with fixed jobs.

#### 1. Headlines
- **Archivo**
- weight **700–800**
- uppercase
- tight tracking around **-0.03em**
- line-height **0.96–1.0**
- large stacked headlines, often over **2–3 lines**

Use for:
- page titles,
- major state labels,
- section-leading declarations,
- rank naming moments,
- hero-style verdict statements.

#### 2. Reading / body / labels
- **Instrument Sans**
- weight **400–600**
- line-height **1.45–1.55**

Use for:
- body copy,
- interactive labels,
- evidence descriptions,
- argument text,
- navigation labels,
- instructional copy.

#### 3. Numerical / metadata language
- **JetBrains Mono**
- for every:
  - number,
  - rating,
  - XP,
  - timer,
  - percentage,
  - timestamp,
  - ID,
  - small uppercase metadata label

Metadata styling guidance:
- approximately **10.5 px**
- letter spacing around **0.16em**
- muted grey tone

Rule:

> **Numbers should never use the body face.**

---

### Color Meaning

CaseDrop uses a restrained semantic accent system.

Accent colors carry **meaning only**, never mood or decorative branding.

Allowed accent categories:

- **Blue** = interactive / primary / actionable
- **Green** = positive / success / gain
- **Amber** = special / rank / premium / rare
- **Red** = failure / loss / penalty

Rules:

- greyscale remains the main palette,
- a screen should generally use **at most one accent color**,
- avoid stacking multiple accents on the same screen unless the screen genuinely needs comparative meaning,
- no extra brand colors,
- no color used just to make a screen feel lively.

---

### Shape and Components

- Hairline rules should separate sections wherever possible.
- Prefer borders over heavy containers.
- Use cards only when grouping materially improves readability.
- Progress bars should be:
  - flat,
  - **4–6 px** tall,
  - lightly rounded only,
  - no exaggerated capsule ends.
- Radii:
  - chips: around **8 px**
  - cards: around **13–20 px**
- Avoid pill-shaped UI except where intentionally meaningful.
- No ornamental illustration system.
- No photo avatars.
- No badge clutter.

---

### Copy Tone

CaseDrop copy should be:

- flat,
- declarative,
- short,
- slightly institutional,
- factual.

Rules:

- no exclamation marks,
- no emoji,
- no cheerleading,
- no playful gamified encouragement in core interface language.

The UI should state conditions, facts, numbers, and outcomes with confidence and restraint.

---

### Avoid List

Do not drift into:

- icon-heavy navigation,
- colorful illustration,
- hero gradients,
- glossy gaming UI,
- playful microcopy,
- photographic avatar systems,
- decorative achievement clutter,
- more than one dominant CTA per screen.

Structure and hierarchy should come from:

> **type, spacing, and rules**

not ornament.

---

# 19. Navigation Rule

Bottom navigation should appear **only** on the following hub-level screens:

- **Home**
- **Jury**
- **Rank**
- **Profile**
- **Sunday**

The in-case flow should run **full-screen** without bottom navigation.

This specifically applies to:

- case intake / prompt,
- evidence,
- decision,
- argument,
- result / reveal states inside the flow,
- other decision-critical in-case screens.

Purpose:

- keep exactly **one main CTA** visible,
- remove the mid-flow escape hatch,
- increase focus,
- make decisions feel more consequential,
- reduce UI competition during the legal reasoning loop.

This is the recommended default.

If later testing shows that users strongly want persistent nav, that can be revisited, but the current judgment call is:

> **Hub screens get bottom nav. In-case screens go full-screen.**

---

# 20. Interaction Rules

## 20.1 Evidence

**Interaction model:** pick any 2, cards reveal in place.

Rules:
- the player receives five visible evidence options,
- the player may open exactly two,
- reveal should happen inline without leaving the screen,
- opened cards should remain spatially anchored to preserve orientation,
- once two are opened, the player proceeds.

This interaction should feel deliberate and local, not modal and disruptive.

---

## 20.2 Decision

**Interaction model:** select → **LOCK**

Rules:
- choice is visible,
- the selected choice becomes visually active,
- a separate confirm action locks the judgment,
- the player should clearly understand the difference between:
  - browsing an option,
  - committing to an option.

The word **LOCK** is appropriate because it makes commitment feel procedural and final.

---

## 20.3 Argument

**Interaction model:** live word count.

Rules:
- the current word count should always remain visible,
- the cap should be explicit,
- the interface should reinforce precision,
- extra ornament is unnecessary.

The argument screen should feel like a disciplined editorial workspace.

---

## 20.4 Jury

**Interaction model:** vote reveals identities.

Interpretation:
- anonymous evaluation governs the initial vote,
- identities can be revealed at the appropriate post-vote stage,
- the reveal should feel earned rather than noisy.

This reinforces:
- fairness during evaluation,
- social payoff after the decision.

---

# 21. Twelve-Screen Master Canvas

The master CaseDrop canvas should show twelve screens together.

These should function as the primary product-system overview.

## 21.1 Proposed Twelve Screens

### 1. Home
Purpose:
- primary hub,
- entry point into Daily / Ranked / Sunday,
- status overview,
- current streaks / timers / progression snapshot.

Bottom nav: **visible**

---

### 2. Case Prompt / Intro
Purpose:
- present the assigned case,
- establish the fact pattern,
- set the legal tension,
- launch the in-case flow.

Bottom nav: **hidden**

---

### 3. Evidence
Purpose:
- show five available evidence cards,
- allow opening exactly two,
- reveal chosen cards in place.

Bottom nav: **hidden**

---

### 4. Decision
Purpose:
- force the player to make the key legal or strategic call,
- select then **LOCK**.

Bottom nav: **hidden**

---

### 5. Argument
Purpose:
- write the argument,
- maintain live word count,
- reinforce precise advocacy.

Bottom nav: **hidden**

---

### 6. Submission Locked / Waiting
Purpose:
- confirm the player is filed,
- show that the matter is now in process,
- bridge into jury or verdict waiting.

Bottom nav: **hidden**

---

### 7. Jury
Purpose:
- present A vs B advocacy comparison,
- show evidence used by each side,
- allow voting,
- reveal identities after vote when appropriate.

Bottom nav: **visible**

---

### 8. Verdict / Reveal
Purpose:
- show result,
- show whether the player's side won or lost,
- show vote distribution,
- show rating / XP / consequence summary.

Bottom nav: **hidden** if treated as part of case flow  
Bottom nav: **optional visible** only if you later decide reveal is a hub-return state

Current preferred approach:
- keep it **full-screen** as part of the in-case sequence.

---

### 9. Rank
Purpose:
- show rating,
- show division / tier / league structure,
- show streak, gains, losses, and rank progression.

Bottom nav: **visible**

---

### 10. Profile
Purpose:
- identity,
- stats,
- history,
- notable performance markers,
- controlled prestige layer.

Bottom nav: **visible**

---

### 11. Sunday
Purpose:
- special weekly mode,
- premium or event-like positioning,
- featured or limited cadence content.

Bottom nav: **visible**

Amber may be the principal semantic accent here.

---

### 12. Learn / Review
Purpose:
- post-case learning,
- doctrine explanation,
- issue review,
- why each side was defensible,
- what stronger reasoning could have looked like.

Bottom nav:
- if framed as a hub destination, **visible**
- if embedded directly after a case, **hidden**

For the twelve-screen system view, it can be shown as a standalone destination screen.

---

## 21.2 Optional Expansion Screens

Depending on future scope, the following may later become additional system screens beyond the core twelve:

- Groups
- Notifications / inbox
- Match history
- Side-Lock Ticket purchase / subscription state
- Detailed analytics
- Promotion / rank milestone screen
- Case archive

These are secondary and should not dilute the first twelve-screen system overview.

---

# 22. Screen-to-Screen Flow Principle

The product should visually separate:

## Hub layer
- Home
- Jury
- Rank
- Profile
- Sunday

These are navigable, persistent, and revisitable.

## Flow layer
- Case Prompt
- Evidence
- Decision
- Argument
- Submission Locked
- Verdict / Reveal
- embedded Learn / Review if treated as continuation

These are immersive and linear.

This distinction is one of the strongest structural calls in the product.

It gives CaseDrop:

- a clean game loop,
- a clean hub architecture,
- less navigational noise,
- stronger decision weight.

---

# 23. Final UI Summary

If this visual system is executed correctly, CaseDrop should feel like:

- an editorial legal product,
- a restrained competitive game,
- a dark Swiss-typographic mobile interface,
- a serious but modern system.

It should **not** feel like:
- a colorful quiz app,
- a cartoon mobile game,
- a law-school LMS,
- a flashy social app,
- a generic productivity dashboard.

The target feeling is:

> **minimal, severe, readable, confident, and competitive.**

---

# 24. Inline Glossary

## 24.1 Purpose

Cases contain doctrinal language. A player who does not know a term either guesses, leaves the app to search, or disengages.

The Inline Glossary removes that failure without turning CaseDrop into a course.

Model:

> **A marked term inside a case opens a definition in place. The player never leaves the case.**

This is distinct from **Screen 12 — Learn / Review**, which remains a post-case doctrinal debrief tied to the specific case just played.

The two systems have different jobs:

- **Inline Glossary** — during the case, general, term-level, no case content.
- **Learn / Review** — after the case, specific, issue-level, full case content.

They may cross-link. They do not merge.

---

## 24.2 Where Terms Appear

Marked terms may appear in:

- the case prompt,
- evidence card bodies,
- the jurisdiction rule statement,
- Jury argument text,
- Verdict / Reveal explanatory copy.

Marked terms must **not** appear in:

- the player's own argument input,
- community percentage displays,
- rank, profile, or progression screens.

---

## 24.3 Marking Rule

Terms are **authored**, not auto-detected.

Rules:

- each marked term is declared explicitly in case data,
- automatic string matching is prohibited,
- a maximum of **four** marked terms per case,
- a term is marked at most **once** per case, on first appearance,
- no term may be marked inside a sentence that carries decisive evidentiary weight.

Rationale:

Auto-detection produces false positives, marks the same word repeatedly, and turns the scenario into a field of underlines. Four is a ceiling, not a target. A case that needs six marked terms is written at the wrong reading level.

---

## 24.4 Neutrality Rule

This is the governing constraint of the entire system.

> **A glossary entry defines the concept. It never applies the concept to the current case.**

Prohibited in any entry:

- reference to the case being played,
- reference to any party, fact, or evidence item,
- worked examples drawn from live case content,
- language indicating which side a doctrine favours,
- any phrasing that resolves ambiguity.

Entries are written once and served to every case that marks them. An entry that reads differently depending on the case has failed.

Violating this converts the glossary into a hint system and destroys the ambiguity the product is built on.

---

## 24.5 Visual Treatment

A marked term receives:

- a **hairline dotted underline** at `rgba(255,255,255,0.28)`,
- no color,
- no icon,
- no weight change,
- no background.

Rules:

- the glossary is **not** an accent-carrying element,
- blue remains reserved for interactive / primary / actionable per §18.3,
- a marked term must not compete with the screen's single CTA,
- underlines must not fragment across a line break; keep the term unbroken.

The intent is that a marked term is discoverable on a second read, not visually loud on the first.

---

## 24.6 Interaction

**Interaction model:** tap → sheet in place → dismiss → unchanged position.

Rules:

- tapping opens a bottom sheet over the current screen,
- the underlying screen is not unmounted,
- scroll position is preserved exactly,
- dismissal by backdrop tap, downward drag, or close control,
- no navigation, no route change, no full-screen takeover,
- bottom navigation state is unaffected,
- opening a sheet never advances or resets any in-case state.

Sheet height:

- content-sized,
- capped at approximately **60%** of viewport height,
- internally scrollable beyond that cap.

This follows §20.1: reveal happens inline, anchored, and local.

---

## 24.7 Sheet Content Structure

Each entry renders in fixed order:

```text
TERM                          Archivo, uppercase
CATEGORY                      JetBrains Mono, 10.5px, muted

MEANING                       Instrument Sans, ≤ 60 words

HEARD AS                      one short illustrative line
                              generic, never case-derived

RELATED                       up to three related terms,
                              each tappable within the sheet
```

Rules:

- **Meaning** is capped at 60 words,
- **Heard as** is capped at one sentence,
- **Related** is capped at three entries,
- no images,
- no citation apparatus,
- no jurisdiction references,
- no external links.

Target read time: **30–45 seconds.**

Related-term navigation replaces sheet content in place. Depth is capped at **three** entries per open session; beyond that the sheet offers only dismissal. Unbounded chaining turns a reference into a browsing session mid-case.

---

## 24.8 Ranked Behaviour

The glossary is available in **both** Daily and Ranked.

Rules:

- glossary access is not an advantage and is not rationed,
- both players in a Ranked pair have identical glossary access regardless of assigned side or evidence bundle,
- **any Ranked clock continues while the sheet is open**,
- glossary access is never surfaced as a scored, timed, or rewarded action.

Rationale:

Per §4.2, fairness in CaseDrop concerns evidence opportunity, not vocabulary. A universal reference available to both players introduces no asymmetry. Pausing a clock for it would make the sheet a tactical resource rather than a reading aid.

---

## 24.9 Data Model

```text
GlossaryEntry
  id                string        stable, kebab-case
  term              string        display form
  category          enum          objection | courtroom_term |
                                  legal_concept | procedure
  meaning           string        ≤ 60 words
  heardAs           string        ≤ 1 sentence
  related           string[]      ≤ 3 entry ids
```

Case-side declaration:

```text
Case.markedTerms
  entryId           string        must resolve to a GlossaryEntry
  anchor            string        exact substring to mark
  location          enum          prompt | evidence:<id> |
                                  rule | verdict
```

Validation rules, enforced at build:

- every `entryId` resolves,
- every `anchor` occurs exactly once in the declared location,
- `markedTerms.length ≤ 4`,
- no entry references case-specific content,
- no two marked terms share an `entryId` within one case.

A case failing validation does not ship. This is the mechanical guard on §24.4.

---

## 24.10 Relationship to Learn / Review

After the case, **Screen 12 — Learn / Review** surfaces:

- the terms this player opened,
- the terms this player did not open,
- entry points into full entries.

The second list is the more interesting one. A player who never opened a marked term and then reasoned incorrectly on that exact issue is being shown something useful about their own play.

Rules:

- opened / unopened state is recorded per case,
- this record is **never** shown before the case resolves,
- it is never used in scoring,
- it is never shown to an opponent or juror.

---

## 24.11 Content Scope

Initial content target: **25 entries**, selected by frequency of appearance across shipped cases.

Do not author a full glossary ahead of the case library. Entries are written to serve cases that exist.

Category weighting at launch:

- legal concepts — approximately half,
- objections — approximately a quarter,
- courtroom terms and procedure — the remainder.

There is no search interface in this system. Terms are reached from cases and from Learn / Review only. A standalone searchable index is an expansion, not a launch feature.

---

# 25. Community Groups

## 25.1 Purpose

CaseDrop already displays community position as an aggregate percentage (§13.1). That number is informative and impersonal.

Community Groups make the comparison specific:

> **How did my people decide?**

A 61/39 global split is a statistic. A 61/39 split among forty people you know is a conversation.

---

## 25.2 Structural Rule

Community Groups add **no sixth bottom-navigation destination**.

Bottom navigation remains exactly as defined in §19:

- Home
- Jury
- Rank
- Profile
- Sunday

Group functionality is surfaced **inside existing hub screens**, plus one full-screen Group Detail screen in the flow layer.

Rationale:

Five destinations is already the practical ceiling for a bottom bar under the §18.3 avoid list. A sixth tab would either compress labels or introduce icon-only navigation, both of which are prohibited. Groups are a lens on existing data, not a separate product surface, and they should be reached from the data they modify.

---

## 25.3 Surfaces

**Home**

- one hairline-separated row beneath the community result,
- shows the player's primary group name, member split, and participation count,
- tapping opens Group Detail,
- absent entirely when the player has no group.

**Rank**

- a two-state toggle: `GLOBAL` / `GROUP`,
- group standing uses the same rating as global standing,
- no separate group rating, no separate ladder, no group-only progression,
- toggle hidden when the player has no group.

**Profile**

- a `GROUPS` section listing memberships,
- create and join controls,
- leave control,
- absent when the player has no group.

**Group Detail — full-screen, flow layer, no bottom navigation**

Contents, in order:

1. group name and member count,
2. today's case split among members,
3. member standings by rating,
4. the highest-rated argument of the day from within the group,
5. leave control at the foot of the screen.

That is the complete screen. Nothing else ships in it.

---

## 25.4 Membership

**Invite code only.**

Rules:

- a group is created with a name and produces a code,
- a code is the sole means of joining,
- there is no directory,
- there is no discovery feed,
- there is no search,
- there are no recommendations,
- membership cap: **200** per group,
- a player may belong to at most **three** groups,
- one group is designated primary and appears on Home.

Rationale:

Discovery surfaces require ranking, moderation, and abuse handling. Invite codes require none of them, and a group formed from an existing relationship is the only kind that produces the comparison this feature exists for.

---

## 25.5 Explicit Exclusions

The following do not ship, at any scale, under this section:

- free-text posting,
- threads or replies,
- direct messages,
- reactions,
- notifications,
- group-versus-group events,
- group chat,
- member roles beyond creator,
- group avatars, banners, or descriptions,
- public group profiles.

> **Community in CaseDrop means seeing how your people decided. It does not mean talking to them.**

Any of the above is a separate product with its own moderation cost. Adding one adds all of them.

---

## 25.6 Competitive Integrity

Group membership must not touch the Ranked system defined in §3 through §9.

Absolute rules:

- group membership does **not** affect matchmaking,
- group membership does **not** affect side assignment or the fairness streak (§5),
- Ranked opponents are **never** drawn preferentially from within a group,
- jury pairs are **never** drawn preferentially from within a group,
- a player is **never** served a jury pair containing a groupmate's argument where that groupmate is identifiable,
- group standing is a filtered view of global rating and confers no rating change.

Rationale:

Jury voting is the product's fairness mechanism. Any path by which a player can recognise and favour a groupmate's argument compromises every rating derived from it. The jury queue must remain blind to group structure entirely.

---

## 25.7 Visibility Rules

Within a group, members may see:

- display name,
- rating and rank band,
- today's decision **only after the viewer has submitted their own**,
- the group's top argument of the day, attributed.

Members may never see:

- another member's unsubmitted case state,
- another member's evidence bundle before resolution,
- another member's argument before that argument has resolved,
- any submission from a case the viewer has not yet played.

The last rule is the important one. A group must not become a channel for spoiling cases.

---

## 25.8 Data Model

```text
Group
  id                string
  name              string        ≤ 40 chars, reportable
  inviteCode        string        8 chars, regenerable by creator
  createdBy         playerId
  createdAt         timestamp
  memberCount       int           ≤ 200

GroupMembership
  groupId           string
  playerId          string
  joinedAt          timestamp
  isPrimary         bool          exactly one true per player
```

Access rules:

- group membership lists are readable only by members,
- a member's submission is exposed to the group **only** after both that submission has resolved and the viewer has submitted on the same case,
- no group-scoped query may return another player's identifier in a jury context.

---

## 25.9 Population Behaviour

Group displays are subject to the same low-population honesty rule applied elsewhere in the product.

Rules:

- a group split is shown only when at least **five** members have submitted on that case,
- below that threshold, the group row shows participation count only, without percentages,
- an empty or single-member group renders no split, no leaderboard, and no top argument,
- the Group Detail screen for a group with no activity states that plainly and offers the invite code.

A group leaderboard with two names is worse than no group leaderboard. Per §18.3 copy tone, the empty state states the condition and the action, without encouragement.

---

## 25.10 Moderation Surface

Free text in this system is limited to **group names**.

Rules:

- group names are reportable,
- a reported name is reviewable and renameable,
- no other user-authored text is group-scoped,
- arguments remain governed by existing case and jury rules and are not moderated differently inside a group.

This is deliberate. One free-text field is a policy. Several are an operation.

---

# 26. Amendment Register

Sections 24 and 25 are additive. No prior section is deleted or rewritten. The following prior sections are extended:

| Section | Extension |
|---|---|
| §12 Case Reuse | Cases gain a `markedTerms` array. Existing case content is unaffected; an untagged case remains valid and ships without glossary marks. |
| §13.1 Community Position | The global split gains an optional group-scoped view, subject to §25.9 thresholds. The global figure itself is unchanged. |
| §19 Navigation Rule | Unchanged. Bottom navigation remains five hub screens. Group Detail is a flow-layer screen and runs full-screen without bottom navigation. |
| §20 Interaction Rules | Gains §24.6 as a fifth interaction model: tap → sheet in place → dismiss → unchanged position. |
| §21.1 Twelve Screens | Unchanged. The glossary is a sheet, not a screen. Group Detail is registered under §21.2 Optional Expansion Screens. |
| §21.2 Optional Expansion | `Groups` is promoted from optional to specified, scoped exactly as §25.3 defines and no further. |
| §22 Flow Layer | Gains Group Detail. The glossary sheet belongs to neither layer; it overlays whichever screen invoked it. |

Both systems are subordinate to §17:

> CaseDrop should never feel like *guess what the author thinks.*

The glossary defines terms and never resolves cases. Groups compare decisions and never influence them.
