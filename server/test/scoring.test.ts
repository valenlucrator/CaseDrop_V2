import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  CALIBRATION_ROSTER_V1,
  assertValidWeights,
  assertValidDimensions,
  computeJurorScore,
  computeAggregate,
  DIMENSIONS,
  type DimensionScores,
  type WeightVector,
} from '../src/scoring/rubric.ts';
import { deterministicPanel, panelSeed } from '../src/scoring/panel.ts';
import { computeVerdict, actualScore, displayMeanMargin } from '../src/scoring/verdict.ts';
import {
  scoreArgument,
  validateResponse,
  ContractViolation,
  seedFor,
  type ModelClient,
  type ScoringVersion,
} from '../src/scoring/scorer.ts';
import {
  buildCachedPrefix,
  buildVariableTail,
  assertCacheBoundary,
  type CaseMaterial,
} from '../src/scoring/prompt.ts';

const dims = (v: number): DimensionScores =>
  Object.fromEntries(DIMENSIONS.map((d) => [d, v])) as DimensionScores;

const flatWeights: WeightVector = { grounding: 20, rule: 20, coherence: 20, calibration: 20, ambiguity: 20 };

describe('rubric', () => {
  test('every calibration weight vector sums to 100', () => {
    for (const j of CALIBRATION_ROSTER_V1) {
      assert.doesNotThrow(() => assertValidWeights(j.weights, j.jurorId));
    }
  });

  test('roster has no duplicate juror ids', () => {
    const ids = CALIBRATION_ROSTER_V1.map((j) => j.jurorId);
    assert.equal(new Set(ids).size, ids.length);
  });

  test('roster is large enough to draw a panel of 10', () => {
    assert.ok(CALIBRATION_ROSTER_V1.length >= 10);
  });

  test('weights not summing to 100 are rejected', () => {
    assert.throws(
      () => assertValidWeights({ ...flatWeights, grounding: 30 }, 'bad'),
      /sum to 110/,
    );
  });

  test('dimension outside 0..20 is rejected, not clamped', () => {
    assert.throws(() => assertValidDimensions({ ...dims(10), rule: 21 }, 'j'), /0\.\.20/);
    assert.throws(() => assertValidDimensions({ ...dims(10), rule: -1 }, 'j'), /0\.\.20/);
    assert.throws(() => assertValidDimensions({ ...dims(10), rule: 10.5 }, 'j'), /0\.\.20/);
  });

  test('flat dimensions give back the same score under any weight vector', () => {
    for (const j of CALIBRATION_ROSTER_V1) {
      assert.equal(computeJurorScore(dims(13), j.weights), 13);
    }
  });

  test('rounding is half-up and integer-exact', () => {
    // weighted = 1250 -> 12.5 -> 13
    const w: WeightVector = { grounding: 100, rule: 0, coherence: 0, calibration: 0, ambiguity: 0 };
    assert.equal(computeJurorScore({ ...dims(0), grounding: 13 }, w), 13);
    // half-way case via a 50/50 split of 12 and 13
    const half: WeightVector = { grounding: 50, rule: 50, coherence: 0, calibration: 0, ambiguity: 0 };
    assert.equal(computeJurorScore({ ...dims(0), grounding: 12, rule: 13 }, half), 13);
  });

  test('juror score stays within 0..20 at the extremes', () => {
    for (const j of CALIBRATION_ROSTER_V1) {
      assert.equal(computeJurorScore(dims(0), j.weights), 0);
      assert.equal(computeJurorScore(dims(20), j.weights), 20);
    }
  });

  test('aggregate is the sum of juror scores', () => {
    assert.equal(computeAggregate([20, 20, 20, 20, 20, 20, 20, 20, 20, 20]), 200);
    assert.equal(computeAggregate([]), 0);
  });
});

describe('deterministicPanel (INV-3)', () => {
  const roster = CALIBRATION_ROSTER_V1.map((j) => j.jurorId);

  test('is reproducible across calls', () => {
    const a = deterministicPanel('case_a', 'sv_01', roster, 10);
    const b = deterministicPanel('case_a', 'sv_01', roster, 10);
    assert.deepEqual(a, b);
  });

  test('does not depend on input roster order', () => {
    const a = deterministicPanel('case_a', 'sv_01', roster, 10);
    const b = deterministicPanel('case_a', 'sv_01', [...roster].reverse(), 10);
    const c = deterministicPanel('case_a', 'sv_01', [...roster].sort().reverse(), 10);
    assert.deepEqual(a, b, 'reversed roster must give the same panel');
    assert.deepEqual(a, c, 'any input order must give the same panel');
  });

  test('different cases get different panels', () => {
    const a = deterministicPanel('case_a', 'sv_01', roster, 10);
    const b = deterministicPanel('case_b', 'sv_01', roster, 10);
    assert.notDeepEqual(a, b);
  });

  test('a new scoring version may repanel the same case', () => {
    const a = deterministicPanel('case_a', 'sv_01', roster, 10);
    const b = deterministicPanel('case_a', 'sv_02', roster, 10);
    assert.notDeepEqual(a, b);
  });

  test('seed separator prevents id concatenation collisions', () => {
    // without the 0x00 separator, ("ab","c") and ("a","bc") would collide
    assert.notDeepEqual(panelSeed('ab', 'c'), panelSeed('a', 'bc'));
  });

  test('panel is exactly panelSize distinct jurors from the roster', () => {
    const p = deterministicPanel('case_a', 'sv_01', roster, 10);
    assert.equal(p.length, 10);
    assert.equal(new Set(p).size, 10);
    for (const id of p) assert.ok(roster.includes(id));
  });

  test('rejects a roster smaller than the panel', () => {
    assert.throws(() => deterministicPanel('c', 'v', roster.slice(0, 3), 10), /at least 10/);
  });

  test('rejects duplicate jurors in the roster', () => {
    assert.throws(
      () => deterministicPanel('c', 'v', [...roster, roster[0]!], 10),
      /duplicate/,
    );
  });

  test('selection is not biased toward early-sorting jurors', () => {
    // A naive modulo instead of rejection sampling would over-select the pool head.
    const counts = new Map<string, number>();
    for (let i = 0; i < 4000; i++) {
      for (const id of deterministicPanel(`case_${i}`, 'sv_01', roster, 10)) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
    }
    const expected = (4000 * 10) / roster.length;
    for (const [id, n] of counts) {
      const drift = Math.abs(n - expected) / expected;
      assert.ok(drift < 0.06, `${id} drifted ${(drift * 100).toFixed(1)}% from uniform`);
    }
  });
});

describe('verdict — epsilon unit discipline', () => {
  test('THE v1.0 BUG: a tallied tie with a fractional per-juror edge is a DRAW', () => {
    // calls tie 5-5, aggregate 127 vs 125, margin +2 => 0.2 pts/juror
    const live = [15, 15, 15, 15, 17, 10, 10, 10, 10, 10];
    const ghost = [12, 12, 12, 12, 12, 13, 13, 13, 13, 13];
    const v = computeVerdict(live, ghost, 1);

    assert.equal(v.liveCalls, 5);
    assert.equal(v.ghostCalls, 5);
    assert.equal(v.margin, 2);
    assert.equal(v.aggregateEpsilon, 10, 'band must be epsilon x panelSize, not epsilon');
    assert.equal(v.outcome, 'DRAW', 'a 0.2 pt/juror edge must not decide the match');
  });

  test('aggregate band scales with panel size', () => {
    assert.equal(computeVerdict(Array(10).fill(10), Array(10).fill(10), 1).aggregateEpsilon, 10);
    assert.equal(computeVerdict(Array(6).fill(10), Array(6).fill(10), 2).aggregateEpsilon, 12);
  });

  test('a tallied tie beyond the aggregate band still resolves', () => {
    const live = [20, 20, 20, 20, 20, 2, 2, 2, 2, 2];   // 110
    const ghost = [5, 5, 5, 5, 5, 20, 20, 20, 20, 20];  // 125
    const v = computeVerdict(live, ghost, 1);
    assert.equal(v.liveCalls, 5);
    assert.equal(v.ghostCalls, 5);
    assert.equal(v.margin, -15);
    assert.ok(Math.abs(v.margin) > v.aggregateEpsilon, 'must exceed the band to resolve');
    assert.equal(v.outcome, 'GHOST');
  });
});

describe('verdict — calls and outcomes', () => {
  test('clear win on every lens', () => {
    const v = computeVerdict(Array(10).fill(16), Array(10).fill(12), 1);
    assert.equal(v.outcome, 'LIVE');
    assert.equal(v.liveCalls, 10);
    assert.equal(v.abstentions, 0);
    assert.equal(v.margin, 40);
  });

  test('identical arguments abstain across the board and draw', () => {
    const v = computeVerdict(Array(10).fill(14), Array(10).fill(14), 1);
    assert.equal(v.outcome, 'DRAW');
    assert.equal(v.abstentions, 10);
    assert.equal(v.margin, 0);
  });

  test('a razor-thin sweep is abstention and a draw, not a fake landslide', () => {
    // Uniform +1 per juror at epsilon=1: every juror abstains, and the aggregate
    // margin (+10) lands EXACTLY on the band (10), which is not > band. So a
    // uniform edge of exactly epsilon per juror is a DRAW.
    // This is the desired property: if no single juror could separate the two
    // arguments, the panel as a whole has not separated them either.
    const v = computeVerdict(Array(10).fill(13), Array(10).fill(12), 1);
    assert.equal(v.liveCalls, 0, 'one point per juror is inside the band');
    assert.equal(v.abstentions, 10);
    assert.equal(v.margin, 10);
    assert.equal(v.aggregateEpsilon, 10);
    assert.equal(v.outcome, 'DRAW');
  });

  test('a uniform edge just past epsilon does resolve', () => {
    const live = [14, 14, 14, 14, 14, 13, 13, 13, 13, 13];  // 135
    const ghost = Array(10).fill(12);                        // 120
    const v = computeVerdict(live, ghost, 1);
    assert.equal(v.liveCalls, 5, 'the +2 jurors call, the +1 jurors abstain');
    assert.equal(v.abstentions, 5);
    assert.equal(v.outcome, 'LIVE');
  });

  test('epsilon 0 makes every non-equal juror cast a call', () => {
    const v = computeVerdict(Array(10).fill(13), Array(10).fill(12), 0);
    assert.equal(v.liveCalls, 10);
    assert.equal(v.abstentions, 0);
  });

  test('panel size mismatch is rejected (INV-3)', () => {
    assert.throws(() => computeVerdict([1, 2, 3], [1, 2], 1), /INV-3/);
  });

  test('negative or non-integer epsilon rejected', () => {
    assert.throws(() => computeVerdict([1], [1], -1), /non-negative integer/);
    assert.throws(() => computeVerdict([1], [1], 1.5), /non-negative integer/);
  });

  test('draw is worth 0.5 to both sides', () => {
    assert.equal(actualScore('DRAW', 'LIVE'), 0.5);
    assert.equal(actualScore('DRAW', 'GHOST'), 0.5);
    assert.equal(actualScore('LIVE', 'LIVE'), 1);
    assert.equal(actualScore('LIVE', 'GHOST'), 0);
  });

  test('mean margin is display-only and derived from the integer', () => {
    const v = computeVerdict(Array(10).fill(16), Array(10).fill(12), 1);
    assert.equal(Number.isInteger(v.margin), true, 'stored margin must be an integer');
    assert.equal(displayMeanMargin(v, 10), 4);
  });
});

// ---------------------------------------------------------------- scorer ---

const PANEL = CALIBRATION_ROSTER_V1.slice(0, 10);

const VERSION: ScoringVersion = {
  id: 'sv_01',
  rubricVersion: 'r1',
  modelId: 'gpt-5-nano',
  providerId: 'openai',
  jurorRosterVersion: 'roster_v1',
  casePanelSeedRuleVersion: 'seed_v1',
  epsilon: 1,
  panelSize: 10,
  status: 'active',
};

const MATERIAL: CaseMaterial = {
  caseId: 'case_locked_office',
  caseVersion: '1.0',
  prompt: 'A terminated employee re-entered the building at 20:14.',
  jurisdictionRule: 'A person commits trespass if they knowingly enter without licence.',
  evidence: [
    { id: 'E1', title: 'Termination Email', body: 'Sent 17:03. Do not access company offices.' },
    { id: 'E2', title: 'Badge Access Log', body: 'Lobby 20:14. Records room 20:19.' },
  ],
};

function fakeResponse(scores: number[] = Array(10).fill(12)) {
  return {
    jurors: PANEL.map((j, i) => ({
      jurorId: j.jurorId,
      dimensions: dims(scores[i]!),
      rationale: `Rationale for ${j.jurorId}.`,
    })),
  };
}

const clientReturning = (raw: unknown): ModelClient => ({
  async complete() {
    return { raw };
  },
});

describe('prompt cache boundary', () => {
  test('prefix is identical across different submissions on the same case', () => {
    const a = buildCachedPrefix(MATERIAL, PANEL);
    const b = buildCachedPrefix(MATERIAL, PANEL);
    assert.doesNotThrow(() => assertCacheBoundary(a, b));
  });

  test('the argument appears only in the variable tail', () => {
    const prefix = buildCachedPrefix(MATERIAL, PANEL);
    const tail = buildVariableTail({
      side: 'defend',
      openedEvidenceIds: ['E1', 'E2'],
      argument: 'UNIQUE_ARGUMENT_TOKEN',
    });
    assert.ok(!prefix.includes('UNIQUE_ARGUMENT_TOKEN'));
    assert.ok(tail.includes('UNIQUE_ARGUMENT_TOKEN'));
  });

  test('prefix carries the verbatim anti-farming definitions', () => {
    const p = buildCachedPrefix(MATERIAL, PANEL);
    assert.ok(p.includes('does NOT require an explicit concession'));
    assert.ok(p.includes('measures OVERCLAIMING'));
    assert.ok(p.includes('does not reward timid or hedged language'));
  });

  test('prefix leaks no forbidden signal (INV-4)', () => {
    const p = buildCachedPrefix(MATERIAL, PANEL).toLowerCase();
    for (const banned of ['rating', 'subscriber', 'community', '%', 'opponent', 'elo']) {
      assert.ok(!p.includes(banned), `prefix must not mention "${banned}" — INV-4`);
    }
  });

  test('prefix states there is no correct answer (§17)', () => {
    const p = buildCachedPrefix(MATERIAL, PANEL);
    assert.ok(p.includes('no correct answer recorded'));
    assert.ok(p.includes('NOT DECIDING WHO IS RIGHT'));
  });
});

describe('scorer', () => {
  const call = (raw: unknown) =>
    scoreArgument({
      client: clientReturning(raw),
      version: VERSION,
      material: MATERIAL,
      panel: PANEL,
      submissionId: 'sub_1',
      argument: { side: 'defend', openedEvidenceIds: ['E1', 'E2'], argument: 'x' },
    });

  test('computes juror and aggregate scores host-side', async () => {
    const r = await call(fakeResponse(Array(10).fill(12)));
    assert.equal(r.seats.length, 10);
    assert.ok(r.seats.every((s) => s.jurorScore === 12));
    assert.equal(r.aggregateScore, 120);
  });

  test('seat order follows the panel, not the model', async () => {
    const r = await call(fakeResponse());
    r.seats.forEach((s, i) => {
      assert.equal(s.seatIndex, i);
      assert.equal(s.jurorId, PANEL[i]!.jurorId);
    });
  });

  test('ignores any aggregate the model volunteers', async () => {
    const raw = { ...fakeResponse(Array(10).fill(12)), aggregateScore: 999 } as any;
    const r = await call(raw);
    assert.equal(r.aggregateScore, 120, 'aggregate must be host-computed');
  });

  test('rejects a juror out of panel order (INV-3)', async () => {
    const raw = fakeResponse();
    const a = raw.jurors[0]!;
    raw.jurors[0] = raw.jurors[1]!;
    raw.jurors[1] = a;
    await assert.rejects(call(raw), /INV-3/);
  });

  test('rejects the wrong number of jurors', async () => {
    const raw = fakeResponse();
    raw.jurors.pop();
    await assert.rejects(call(raw), /expected 10 jurors, got 9/);
  });

  test('rejects an out-of-range dimension', async () => {
    const raw = fakeResponse();
    (raw.jurors[3]!.dimensions as any).rule = 21;
    await assert.rejects(call(raw), /0\.\.20/);
  });

  test('rejects an unknown dimension key', async () => {
    const raw = fakeResponse();
    (raw.jurors[2]!.dimensions as any).persuasiveness = 10;
    await assert.rejects(call(raw), /unknown dimension/);
  });

  test('rejects an empty rationale', async () => {
    const raw = fakeResponse();
    raw.jurors[5]!.rationale = '   ';
    await assert.rejects(call(raw), /empty rationale/);
  });

  test('rejects a malformed response', async () => {
    await assert.rejects(call({ nope: true }), /jurors array/);
  });

  test('truncates an over-length rationale at a word boundary', () => {
    const raw = fakeResponse();
    raw.jurors[0]!.rationale = 'word '.repeat(60);
    const ok = validateResponse(raw, PANEL);
    assert.ok(ok.jurors[0]!.rationale.length <= 180);
    assert.ok(!ok.jurors[0]!.rationale.endsWith(' '));
  });

  test('panel size disagreeing with the scoring version is fatal, not retryable', async () => {
    await assert.rejects(
      scoreArgument({
        client: clientReturning(fakeResponse()),
        version: VERSION,
        material: MATERIAL,
        panel: PANEL.slice(0, 9),
        submissionId: 'sub_1',
        argument: { side: 'defend', openedEvidenceIds: ['E1'], argument: 'x' },
      }),
      (e: unknown) => e instanceof ContractViolation && !e.retryable,
    );
  });

  test('seed is stable per submission and version, and differs across them', () => {
    assert.equal(seedFor('sub_1', 'sv_01'), seedFor('sub_1', 'sv_01'));
    assert.notEqual(seedFor('sub_1', 'sv_01'), seedFor('sub_2', 'sv_01'));
    assert.notEqual(seedFor('sub_1', 'sv_01'), seedFor('sub_1', 'sv_02'));
  });

  test('end to end: two scored arguments produce a verdict', async () => {
    const live = await call(fakeResponse([16, 16, 15, 14, 13, 12, 12, 11, 15, 16]));
    const ghost = await call(fakeResponse([12, 15, 17, 13, 14, 12, 15, 11, 15, 13]));
    const v = computeVerdict(
      live.seats.map((s) => s.jurorScore),
      ghost.seats.map((s) => s.jurorScore),
      VERSION.epsilon,
    );
    assert.equal(v.calls.length, 10);
    assert.equal(v.liveCalls + v.ghostCalls + v.abstentions, 10);
    assert.equal(v.margin, live.aggregateScore - ghost.aggregateScore);
    assert.ok(['LIVE', 'GHOST', 'DRAW'].includes(v.outcome));
  });
});
