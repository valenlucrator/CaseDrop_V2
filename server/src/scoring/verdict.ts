/**
 * Verdict computation. Host-side, from two stored score sets. No inference.
 *
 * Contract: docs/scoring-contract.md §6, blueprint v4.2 §15.4
 *
 * UNIT DISCIPLINE — this is where contract v1.0 had a bug.
 *
 *   epsilon           is on the SINGLE-JUROR 0..20 scale
 *   aggregate margin  is on the PANEL 0..(20 × panelSize) scale
 *
 * Comparing them directly let a fractional per-juror edge decide a tallied tie:
 * calls 5-5, aggregate 127 vs 125, margin +2 resolved as a win under a ±1 band.
 * The aggregate band is epsilon × panelSize, which is equivalent to comparing the
 * MEAN juror margin against epsilon while staying integer-only.
 */

export type JurorCall = 'LIVE' | 'GHOST' | 'ABSTAIN';
export type Outcome = 'LIVE' | 'GHOST' | 'DRAW';

export type Verdict = {
  outcome: Outcome;
  calls: JurorCall[];
  liveCalls: number;
  ghostCalls: number;
  abstentions: number;
  /** Signed integer on the aggregate scale. Positive favours LIVE. Canonical. */
  margin: number;
  /** epsilon × panelSize. Derived, never stored. */
  aggregateEpsilon: number;
};

/**
 * @param live   per-seat jurorScore for the live argument, panel order
 * @param ghost  per-seat jurorScore for the ghost argument, SAME panel order (INV-3)
 * @param epsilon juror-scale abstention band from the scoring version
 */
export function computeVerdict(
  live: readonly number[],
  ghost: readonly number[],
  epsilon: number,
): Verdict {
  if (live.length !== ghost.length) {
    throw new Error(
      `panel size mismatch: live has ${live.length} seats, ghost has ${ghost.length} — INV-3`,
    );
  }
  if (live.length === 0) throw new Error('empty panel');
  if (!Number.isInteger(epsilon) || epsilon < 0) {
    throw new Error(`epsilon must be a non-negative integer, got ${epsilon}`);
  }

  const calls: JurorCall[] = [];
  for (let i = 0; i < live.length; i++) {
    const l = live[i]!;
    const g = ghost[i]!;
    if (l - g > epsilon) calls.push('LIVE');
    else if (g - l > epsilon) calls.push('GHOST');
    else calls.push('ABSTAIN');
  }

  const liveCalls = calls.filter((c) => c === 'LIVE').length;
  const ghostCalls = calls.filter((c) => c === 'GHOST').length;
  const abstentions = calls.filter((c) => c === 'ABSTAIN').length;

  const margin = sum(live) - sum(ghost);
  const aggregateEpsilon = epsilon * live.length;

  let outcome: Outcome;
  if (liveCalls > ghostCalls) outcome = 'LIVE';
  else if (ghostCalls > liveCalls) outcome = 'GHOST';
  else if (Math.abs(margin) > aggregateEpsilon) outcome = margin > 0 ? 'LIVE' : 'GHOST';
  else outcome = 'DRAW';

  return { outcome, calls, liveCalls, ghostCalls, abstentions, margin, aggregateEpsilon };
}

/** Expected-score value for rating arithmetic. Blueprint §13.5 / §15.4. */
export function actualScore(outcome: Outcome, perspective: 'LIVE' | 'GHOST'): number {
  if (outcome === 'DRAW') return 0.5;
  return outcome === perspective ? 1 : 0;
}

/**
 * Mean juror margin, for DISPLAY only.
 *
 * The canonical persisted margin is the integer on the aggregate scale. This
 * returns a float and must never be written to the database.
 */
export function displayMeanMargin(v: Verdict, panelSize: number): number {
  return v.margin / panelSize;
}

function sum(xs: readonly number[]): number {
  return xs.reduce((a, b) => a + b, 0);
}
