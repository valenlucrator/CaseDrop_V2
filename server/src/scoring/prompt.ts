/**
 * Prompt construction, split at the cache boundary.
 *
 * Contract: docs/scoring-contract.md §1, blueprint v4.2 §34.4
 *
 * The split is load-bearing, not cosmetic. Anything above the boundary that
 * varies per match destroys caching silently and bills at full input rate —
 * there is no error, only a larger invoice. `assertCacheBoundary` exists so a
 * test can catch that regression.
 *
 * INV-4: no community percentages, ratings, rank, subscription status, side
 * popularity, opponent identity, group membership, or any authored indication of
 * a correct outcome may appear anywhere in this prompt.
 */

import { DIMENSIONS, type JurorDefinition } from './rubric.ts';
import { RATIONALE_MAX_CHARS } from './schema.ts';

export type CaseMaterial = {
  caseId: string;
  caseVersion: string;
  prompt: string;
  jurisdictionRule: string;
  evidence: { id: string; title: string; body: string }[];
};

export type ArgumentUnderReview = {
  side: 'defend' | 'challenge';
  openedEvidenceIds: string[];
  argument: string;
};

/**
 * Verbatim anti-farming definitions (contract §2).
 *
 * Without these, players discover that one "Although X..." sentence farms
 * ambiguity handling and that hedging everything farms calibration. Both would
 * reward ritual rather than advocacy, so this text is part of the contract and
 * changing it bumps rubricVersion.
 */
const DIMENSION_GUIDANCE: Record<(typeof DIMENSIONS)[number], string> = {
  grounding:
    'Evidence grounding. Are the claims tied to evidence this advocate actually opened? ' +
    'An assertion with no cited exhibit behind it scores low however plausible it sounds.',
  rule:
    'Rule connection. Is the evidence connected to the governing rule, or merely recited? ' +
    'Reciting a fact is not the same as showing what it does under the rule.',
  coherence:
    'Coherence. Does the argument hold together as a structure, so each step follows from the last?',
  calibration:
    'Calibration. This measures OVERCLAIMING. It does not reward timid or hedged language. ' +
    'An argument that states exactly what its evidence supports scores full marks; an argument ' +
    'that hedges a well-supported claim is not scoring better than one that asserts it.',
  ambiguity:
    'Ambiguity handling. This does NOT require an explicit concession or counterargument. ' +
    'It rewards appropriately addressing uncertainty WHERE MATERIAL. An argument facing no ' +
    'material uncertainty is not penalised for failing to manufacture one.',
};

/** Stable per (caseId, scoringVersionId, caseVersion). Cache this. */
export function buildCachedPrefix(
  material: CaseMaterial,
  panel: readonly JurorDefinition[],
): string {
  const dims = DIMENSIONS.map((d, i) => `${i + 1}. ${DIMENSION_GUIDANCE[d]}`).join('\n');
  const jurors = panel
    .map((j, seat) => `  seat ${seat} — ${j.jurorId} (${j.displayName})`)
    .join('\n');
  const evidence = material.evidence
    .map((e) => `[${e.id}] ${e.title}\n${e.body}`)
    .join('\n\n');

  return `You are scoring a single piece of legal advocacy for a game called CaseDrop.

YOU ARE NOT DECIDING WHO IS RIGHT.
You are evaluating how well this advocate made their case from the evidence available
to them. The case is deliberately ambiguous and both positions are defensible. There is
no correct answer recorded for this case. Do not reward or penalise the position taken.

Score each of five dimensions from 0 to 20 (integers only):

${dims}

You are scoring on behalf of ${panel.length} jurors, each reading with a different
emphasis. Score the SAME observations for every juror; the weighting of those
observations is applied elsewhere and is not your concern. Differences between jurors
should reflect genuine differences in what each lens notices, not invented disagreement.

Panel, in seat order — your response array MUST be in this exact order:
${jurors}

Give each juror one rationale sentence of at most ${RATIONALE_MAX_CHARS} characters,
addressed to the advocate.

--- CASE ---
${material.prompt}

--- GOVERNING RULE ---
${material.jurisdictionRule}

--- FULL EVIDENCE SET FOR THIS CASE ---
${evidence}`;
}

/** Varies per submission. Must sit AFTER the cache breakpoint. */
export function buildVariableTail(arg: ArgumentUnderReview): string {
  return `--- THE ARGUMENT UNDER REVIEW ---
Side argued: ${arg.side.toUpperCase()}
Evidence this advocate opened: ${arg.openedEvidenceIds.join(', ')}

${arg.argument}`;
}

/**
 * Guard for the cache boundary. A prefix that changes between two submissions on
 * the same case and scoring version is a caching regression; assert this in tests.
 */
export function assertCacheBoundary(prefixA: string, prefixB: string): void {
  if (prefixA !== prefixB) {
    throw new Error(
      'cached prefix differs between submissions on the same case/version — ' +
        'something volatile leaked above the cache boundary (contract §1)',
    );
  }
}
