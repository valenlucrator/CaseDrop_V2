/**
 * Strict JSON schema for the panel response.
 *
 * Contract: docs/scoring-contract.md §3
 *
 * The model returns DIMENSION SCORES AND PROSE ONLY. jurorScore and
 * aggregateScore are absent by design — every derived number is computed
 * host-side so a verdict stays reproducible from stored dimensions forever,
 * even where the provider call is not bit-reproducible.
 *
 * OpenAI strict structured outputs require additionalProperties:false on every
 * object and every property listed in `required`. A schema that omits either is
 * silently downgraded to non-strict and can return partial objects.
 */

import { DIMENSIONS } from './rubric.ts';

export const RATIONALE_MAX_CHARS = 180;

export function panelResponseSchema(panelSize: number) {
  const dimensionProps: Record<string, unknown> = {};
  for (const d of DIMENSIONS) {
    dimensionProps[d] = { type: 'integer', minimum: 0, maximum: 20 };
  }

  return {
    type: 'object',
    additionalProperties: false,
    required: ['jurors'],
    properties: {
      jurors: {
        type: 'array',
        minItems: panelSize,
        maxItems: panelSize,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['jurorId', 'dimensions', 'rationale'],
          properties: {
            jurorId: { type: 'string' },
            dimensions: {
              type: 'object',
              additionalProperties: false,
              required: [...DIMENSIONS],
              properties: dimensionProps,
            },
            rationale: {
              type: 'string',
              minLength: 1,
              maxLength: RATIONALE_MAX_CHARS,
            },
          },
        },
      },
    },
  } as const;
}

/** Shape the model is contracted to return. Validated before anything is persisted. */
export type RawPanelResponse = {
  jurors: {
    jurorId: string;
    dimensions: Record<string, number>;
    rationale: string;
  }[];
};
