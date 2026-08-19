/**
 * Rubric definition and host-side score arithmetic.
 *
 * Contract: docs/scoring-contract.md §2
 *
 * The five dimensions are LOCKED (blueprint v4.2 §37.1). The weight vectors are
 * calibration inputs, not production weights — they are swapped by minting a new
 * scoring version, never by editing in place.
 *
 * All arithmetic here is integer-only. Floats would make the determinism promise
 * in INV-1 unenforceable in practice.
 */

export const DIMENSIONS = [
  'grounding',
  'rule',
  'coherence',
  'calibration',
  'ambiguity',
] as const;

export type Dimension = (typeof DIMENSIONS)[number];

/** Raw model output for one juror. Each dimension is an integer 0..20. */
export type DimensionScores = Record<Dimension, number>;

/** Integer weights over the five dimensions. Must sum to exactly 100. */
export type WeightVector = Record<Dimension, number>;

export type JurorDefinition = {
  jurorId: string;
  displayName: string;
  weights: WeightVector;
};

export const MAX_DIMENSION = 20;
export const MAX_JUROR_SCORE = 20;

/**
 * Calibration weight vectors (contract §2).
 *
 * NOT production weights. Gated on the 200–300 matchup calibration set.
 */
export const CALIBRATION_ROSTER_V1: readonly JurorDefinition[] = [
  { jurorId: 'formalist',        displayName: 'The Formalist',        weights: { grounding: 15, rule: 40, coherence: 20, calibration: 15, ambiguity: 10 } },
  { jurorId: 'pragmatist',       displayName: 'The Pragmatist',       weights: { grounding: 20, rule: 15, coherence: 25, calibration: 15, ambiguity: 25 } },
  { jurorId: 'skeptic',          displayName: 'The Skeptic',          weights: { grounding: 30, rule: 15, coherence: 15, calibration: 35, ambiguity:  5 } },
  { jurorId: 'equitable',        displayName: 'The Equitable',        weights: { grounding: 15, rule: 15, coherence: 25, calibration: 15, ambiguity: 30 } },
  { jurorId: 'evidence_first',   displayName: 'Evidence-First',       weights: { grounding: 45, rule: 20, coherence: 15, calibration: 15, ambiguity:  5 } },
  { jurorId: 'institutionalist', displayName: 'The Institutionalist', weights: { grounding: 20, rule: 35, coherence: 20, calibration: 15, ambiguity: 10 } },
  { jurorId: 'plain_reader',     displayName: 'The Plain-Reader',     weights: { grounding: 15, rule: 15, coherence: 45, calibration: 10, ambiguity: 15 } },
  { jurorId: 'contrarian',       displayName: 'The Contrarian',       weights: { grounding: 20, rule: 15, coherence: 15, calibration: 20, ambiguity: 30 } },
  { jurorId: 'textualist',       displayName: 'The Textualist',       weights: { grounding: 15, rule: 45, coherence: 20, calibration: 15, ambiguity:  5 } },
  { jurorId: 'consequentialist', displayName: 'The Consequentialist', weights: { grounding: 15, rule: 10, coherence: 25, calibration: 20, ambiguity: 30 } },
  { jurorId: 'proceduralist',    displayName: 'The Proceduralist',    weights: { grounding: 20, rule: 30, coherence: 25, calibration: 15, ambiguity: 10 } },
  { jurorId: 'literalist',       displayName: 'The Literalist',       weights: { grounding: 25, rule: 35, coherence: 20, calibration: 15, ambiguity:  5 } },
];

/** Mirrors the weights_sum_100 CHECK in db/001_scoring_core.sql. */
export function assertValidWeights(w: WeightVector, jurorId: string): void {
  let sum = 0;
  for (const d of DIMENSIONS) {
    const v = w[d];
    if (!Number.isInteger(v) || v < 0) {
      throw new Error(`juror ${jurorId}: weight ${d}=${v} must be a non-negative integer`);
    }
    sum += v;
  }
  if (sum !== 100) {
    throw new Error(`juror ${jurorId}: weights sum to ${sum}, must be 100`);
  }
}

/** Mirrors the dimensions_0_20 CHECK. Throws rather than clamping — a model that */
/** returns 21 has violated the contract and the response must be retried, not repaired. */
export function assertValidDimensions(d: DimensionScores, jurorId: string): void {
  for (const key of DIMENSIONS) {
    const v = d[key];
    if (!Number.isInteger(v) || v < 0 || v > MAX_DIMENSION) {
      throw new Error(
        `juror ${jurorId}: dimension ${key}=${v} must be an integer 0..${MAX_DIMENSION}`,
      );
    }
  }
}

/**
 * jurorScore = round(Σ(weight × dimension) / 100), half-up, integer 0..20.
 *
 * Implemented as floor((Σ + 50) / 100) so the rounding is exact integer
 * arithmetic. `Math.round` on a float quotient would introduce a
 * representation-dependent edge at .5 and break reproducibility.
 */
export function computeJurorScore(dims: DimensionScores, weights: WeightVector): number {
  let weighted = 0;
  for (const d of DIMENSIONS) {
    weighted += weights[d] * dims[d];
  }
  const score = Math.floor((weighted + 50) / 100);
  if (score < 0 || score > MAX_JUROR_SCORE) {
    throw new Error(`computed jurorScore ${score} outside 0..${MAX_JUROR_SCORE}`);
  }
  return score;
}

/** aggregateScore = Σ jurorScore over the panel. Range 0..(20 × panelSize). */
export function computeAggregate(jurorScores: readonly number[]): number {
  return jurorScores.reduce((a, b) => a + b, 0);
}
