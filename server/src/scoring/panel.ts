/**
 * deterministicPanel(caseId, scoringVersionId) -> JurorId[panelSize]
 *
 * Contract: docs/scoring-contract.md §7b, blueprint v4.2 §14.3
 *
 * INV-3: the panel for a case is identical for every argument scored under that
 * (caseId, scoringVersionId) pair — live and ghost alike. If this function is
 * not reproducible, stored ghost scores stop being comparable and the entire
 * independent-scoring architecture fails silently.
 *
 * Two deliberate choices:
 *
 * 1. The roster is sorted by jurorId before shuffling. Relying on database row
 *    order would make the panel depend on physical storage and change after a
 *    restore or a replica switch.
 *
 * 2. The PRNG is counter-mode SHA-256, not a named PRNG algorithm and emphatically
 *    not the language's stdlib RNG. `Math.random` is unseedable; a named PRNG can
 *    be reimplemented subtly differently across languages. SHA-256 is fixed
 *    forever and identical in every runtime, so a Swift or Python reimplementation
 *    of this function produces the same panel.
 *
 * Any change to this algorithm bumps casePanelSeedRuleVersion, which mints a new
 * scoring version.
 */

import { createHash } from 'node:crypto';

export const PANEL_SEED_RULE_VERSION = 'seed_v1_sha256ctr_fisheryates';

/**
 * Deterministic byte stream: SHA256(seed || counter_be32), concatenated.
 * Counter mode rather than iterated hashing so any block is independently
 * derivable and the stream never depends on how much was consumed earlier.
 */
class Sha256Ctr {
  #seed: Buffer;
  #counter = 0;
  #block: Buffer = Buffer.alloc(0);
  #offset = 0;

  constructor(seed: Buffer) {
    this.#seed = seed;
  }

  #refill(): void {
    const ctr = Buffer.alloc(4);
    ctr.writeUInt32BE(this.#counter++, 0);
    this.#block = createHash('sha256').update(this.#seed).update(ctr).digest();
    this.#offset = 0;
  }

  nextUint32(): number {
    if (this.#offset + 4 > this.#block.length) this.#refill();
    const v = this.#block.readUInt32BE(this.#offset);
    this.#offset += 4;
    return v;
  }

  /**
   * Uniform integer in [0, bound). Rejection sampling — a naive modulo would
   * bias low indices, which over many cases would over-select jurors that sort
   * early in the roster.
   */
  nextBelow(bound: number): number {
    if (bound <= 0) throw new Error('bound must be positive');
    const limit = Math.floor(0x1_0000_0000 / bound) * bound;
    for (;;) {
      const v = this.nextUint32();
      if (v < limit) return v % bound;
    }
  }
}

/** SHA256(caseId || 0x00 || scoringVersionId). The 0x00 prevents "ab"+"c" and "a"+"bc" colliding. */
export function panelSeed(caseId: string, scoringVersionId: string): Buffer {
  return createHash('sha256')
    .update(caseId, 'utf8')
    .update(Buffer.from([0x00]))
    .update(scoringVersionId, 'utf8')
    .digest();
}

/**
 * Partial Fisher-Yates over the sorted roster, taking the first `panelSize`.
 *
 * SEAT ORDER IS PART OF THE OUTPUT, not incidental — the model's `jurors` array
 * must match it (contract §3) and stored scores are keyed by seat index.
 */
export function deterministicPanel(
  caseId: string,
  scoringVersionId: string,
  rosterJurorIds: readonly string[],
  panelSize: number,
): string[] {
  if (panelSize <= 0) throw new Error('panelSize must be positive');
  if (rosterJurorIds.length < panelSize) {
    throw new Error(
      `roster has ${rosterJurorIds.length} jurors, need at least ${panelSize}`,
    );
  }
  const unique = new Set(rosterJurorIds);
  if (unique.size !== rosterJurorIds.length) {
    throw new Error('roster contains duplicate jurorIds');
  }

  // Sort first. Never trust incoming order.
  const pool = [...rosterJurorIds].sort();
  const rng = new Sha256Ctr(panelSeed(caseId, scoringVersionId));

  for (let i = 0; i < panelSize; i++) {
    const j = i + rng.nextBelow(pool.length - i);
    const a = pool[i]!;
    const b = pool[j]!;
    pool[i] = b;
    pool[j] = a;
  }
  return pool.slice(0, panelSize);
}
