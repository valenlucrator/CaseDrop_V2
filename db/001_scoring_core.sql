-- CaseDrop — scoring core schema
-- Target: PostgreSQL 15+
-- Governed by: docs/scoring-contract.md v1.1, blueprint v4.2 §14, §15, §33, §34
--
-- Scope: everything required before the first valid ghost score can exist.
-- Deliberately excludes matchmaking, ghost selection, groups, and Daily.
--
-- The invariants in the scoring contract are enforced HERE, not in application
-- code. A comparison across scoring versions must be impossible to persist,
-- not merely discouraged.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Scoring versions
-- ---------------------------------------------------------------------------

CREATE TYPE scoring_version_status AS ENUM (
  'draft', 'calibrating', 'backfilling', 'active', 'retired'
);

CREATE TABLE scoring_versions (
  id                            text PRIMARY KEY,
  rubric_version                text        NOT NULL,
  model_id                      text        NOT NULL,
  provider_id                   text        NOT NULL,
  juror_roster_version          text        NOT NULL,
  case_panel_seed_rule_version  text        NOT NULL,
  epsilon                       smallint    NOT NULL,
  panel_size                    smallint    NOT NULL DEFAULT 10,
  status                        scoring_version_status NOT NULL DEFAULT 'draft',
  created_at                    timestamptz NOT NULL DEFAULT now(),
  activated_at                  timestamptz,
  retired_at                    timestamptz,

  -- epsilon is on the single-juror 0..20 scale (contract §6 unit discipline).
  -- The aggregate draw band is epsilon * panel_size and is DERIVED, never stored.
  CONSTRAINT epsilon_on_juror_scale CHECK (epsilon >= 0 AND epsilon <= 20),
  CONSTRAINT panel_size_positive    CHECK (panel_size > 0),
  CONSTRAINT activation_timestamped CHECK (
    (status IN ('active','retired')) = (activated_at IS NOT NULL)
    OR status = 'retired'
  ),
  CONSTRAINT retirement_timestamped CHECK (
    (status = 'retired') = (retired_at IS NOT NULL)
  )
);

-- INV-5: at most one active scoring version. Enforced by the database.
CREATE UNIQUE INDEX one_active_scoring_version
  ON scoring_versions ((true)) WHERE status = 'active';

COMMENT ON INDEX one_active_scoring_version IS
  'INV-5. Live scoring uses the active version only (INV-6); ghost selection may '
  'return only submissions scored under it (INV-7).';

-- ---------------------------------------------------------------------------
-- 2. Juror definitions
--
-- Jurors are weight vectors over a fixed rubric, not separate prompts.
-- Contract §2.
-- ---------------------------------------------------------------------------

CREATE TABLE juror_definitions (
  juror_id        text     NOT NULL,
  roster_version  text     NOT NULL,
  display_name    text     NOT NULL,
  lens            text     NOT NULL,

  w_grounding     smallint NOT NULL,
  w_rule          smallint NOT NULL,
  w_coherence     smallint NOT NULL,
  w_calibration   smallint NOT NULL,
  w_ambiguity     smallint NOT NULL,

  PRIMARY KEY (juror_id, roster_version),

  CONSTRAINT weights_nonnegative CHECK (
    w_grounding >= 0 AND w_rule >= 0 AND w_coherence >= 0
    AND w_calibration >= 0 AND w_ambiguity >= 0
  ),
  -- Integer weights summing to 100 keep jurorScore arithmetic float-free.
  CONSTRAINT weights_sum_100 CHECK (
    w_grounding + w_rule + w_coherence + w_calibration + w_ambiguity = 100
  ),
  -- 'anthropic.advisor'-style reserved names are not a thing here, but a juror
  -- must not be named for a side.
  CONSTRAINT juror_id_not_side CHECK (juror_id NOT IN ('defend','challenge'))
);

-- ---------------------------------------------------------------------------
-- 3. Case panels
--
-- INV-3. Materialised from deterministicPanel(caseId, scoringVersionId) on
-- first use, so the panel is auditable and enforceable by foreign key rather
-- than recomputed per call. Seat order is part of the output (contract §7b).
-- ---------------------------------------------------------------------------

CREATE TABLE case_panels (
  case_id            text     NOT NULL,
  scoring_version_id text     NOT NULL REFERENCES scoring_versions(id),
  seat_index         smallint NOT NULL,
  juror_id           text     NOT NULL,
  roster_version     text     NOT NULL,

  PRIMARY KEY (case_id, scoring_version_id, seat_index),
  FOREIGN KEY (juror_id, roster_version) REFERENCES juror_definitions(juror_id, roster_version),

  CONSTRAINT seat_index_range CHECK (seat_index >= 0 AND seat_index < 32),
  -- A juror may not occupy two seats on the same panel.
  UNIQUE (case_id, scoring_version_id, juror_id)
);

-- A panel must be exactly panel_size seats, contiguous from 0.
-- Deferred so the ten rows can be inserted in one transaction.
CREATE OR REPLACE FUNCTION assert_panel_complete() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  expected smallint;
  actual   smallint;
BEGIN
  SELECT panel_size INTO expected
    FROM scoring_versions WHERE id = NEW.scoring_version_id;

  SELECT count(*) INTO actual
    FROM case_panels
   WHERE case_id = NEW.case_id
     AND scoring_version_id = NEW.scoring_version_id;

  IF actual <> expected THEN
    RAISE EXCEPTION
      'panel for case % under % has % seats, expected % (INV-3)',
      NEW.case_id, NEW.scoring_version_id, actual, expected;
  END IF;

  IF EXISTS (
    SELECT 1 FROM case_panels
     WHERE case_id = NEW.case_id AND scoring_version_id = NEW.scoring_version_id
     GROUP BY case_id, scoring_version_id
    HAVING max(seat_index) <> expected - 1 OR min(seat_index) <> 0
  ) THEN
    RAISE EXCEPTION 'panel seat indices for case % are not contiguous from 0',
      NEW.case_id;
  END IF;

  RETURN NULL;
END $$;

CREATE CONSTRAINT TRIGGER case_panel_complete
  AFTER INSERT OR UPDATE ON case_panels
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION assert_panel_complete();

-- ---------------------------------------------------------------------------
-- 4. Ranked submissions
--
-- Written BEFORE the scoring call (contract §5). A scoring failure must never
-- lose a player's writing.
-- ---------------------------------------------------------------------------

CREATE TYPE ranked_side AS ENUM ('defend', 'challenge');

CREATE TABLE ranked_submissions (
  id                  uuid PRIMARY KEY,
  player_id           uuid,                 -- NULL for authored seed ghosts
  case_id             text        NOT NULL,
  case_version        text        NOT NULL,
  side                ranked_side NOT NULL,
  bundle_id           text        NOT NULL,
  opened_evidence_ids text[]      NOT NULL,
  argument            text        NOT NULL,
  word_count          smallint    NOT NULL,
  is_seed             boolean     NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),

  -- Blueprint §29.3: Ranked cap is 60 words.
  CONSTRAINT ranked_word_cap CHECK (word_count > 0 AND word_count <= 60),
  -- Blueprint §29.1: exactly two evidence items opened.
  CONSTRAINT opened_exactly_two CHECK (array_length(opened_evidence_ids, 1) = 2),
  CONSTRAINT opened_distinct    CHECK (opened_evidence_ids[1] <> opened_evidence_ids[2]),
  -- Blueprint §13.3: seeded authored ghosts have no owner and never gain rating.
  CONSTRAINT seed_has_no_player CHECK (NOT is_seed OR player_id IS NULL)
);

CREATE INDEX ranked_submissions_ghost_pool
  ON ranked_submissions (case_id, case_version, side, bundle_id);

-- ---------------------------------------------------------------------------
-- 5. Scores
--
-- INV-2: a score is only meaningful for the (case_id, case_version,
-- scoring_version_id) triple it was generated under. case_version is
-- denormalised onto the score row so the triple is checkable without a join.
-- ---------------------------------------------------------------------------

CREATE TABLE ranked_submission_scores (
  id                 uuid PRIMARY KEY,
  submission_id      uuid        NOT NULL REFERENCES ranked_submissions(id) ON DELETE CASCADE,
  scoring_version_id text        NOT NULL REFERENCES scoring_versions(id),
  case_id            text        NOT NULL,
  case_version       text        NOT NULL,
  aggregate_score    smallint    NOT NULL,
  scored_at          timestamptz NOT NULL DEFAULT now(),

  -- One score per submission per scoring version. Re-scoring under a NEW
  -- version inserts a new row; it never overwrites the audit record.
  UNIQUE (submission_id, scoring_version_id),

  CONSTRAINT aggregate_range CHECK (aggregate_score >= 0 AND aggregate_score <= 200)
);

CREATE INDEX scores_by_version ON ranked_submission_scores (scoring_version_id, case_id);

-- The score's (case_id, case_version) must match its submission's. Without this,
-- a score can silently outlive the case text it was computed against.
CREATE OR REPLACE FUNCTION assert_score_matches_submission() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE s record;
BEGIN
  SELECT case_id, case_version INTO s
    FROM ranked_submissions WHERE id = NEW.submission_id;

  IF s.case_id <> NEW.case_id OR s.case_version <> NEW.case_version THEN
    RAISE EXCEPTION
      'score (%/%) does not match submission (%/%) — INV-2',
      NEW.case_id, NEW.case_version, s.case_id, s.case_version;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER score_matches_submission
  BEFORE INSERT OR UPDATE ON ranked_submission_scores
  FOR EACH ROW EXECUTE FUNCTION assert_score_matches_submission();

-- ---------------------------------------------------------------------------
-- 6. Per-juror dimension scores
--
-- Raw model output. Every derived number (juror_score, aggregate) is computed
-- host-side and stored alongside, so a verdict stays reproducible from the
-- stored dimensions forever (contract §3).
-- ---------------------------------------------------------------------------

CREATE TABLE juror_dimension_scores (
  score_id     uuid     NOT NULL REFERENCES ranked_submission_scores(id) ON DELETE CASCADE,
  seat_index   smallint NOT NULL,
  juror_id     text     NOT NULL,

  grounding    smallint NOT NULL,
  rule         smallint NOT NULL,
  coherence    smallint NOT NULL,
  calibration  smallint NOT NULL,
  ambiguity    smallint NOT NULL,

  juror_score  smallint NOT NULL,   -- host-computed: round(Σ(w×d)/100)
  rationale    text     NOT NULL,

  PRIMARY KEY (score_id, seat_index),

  CONSTRAINT dimensions_0_20 CHECK (
    grounding   BETWEEN 0 AND 20 AND
    rule        BETWEEN 0 AND 20 AND
    coherence   BETWEEN 0 AND 20 AND
    calibration BETWEEN 0 AND 20 AND
    ambiguity   BETWEEN 0 AND 20
  ),
  CONSTRAINT juror_score_0_20 CHECK (juror_score BETWEEN 0 AND 20),
  CONSTRAINT rationale_bounded CHECK (
    length(rationale) > 0 AND length(rationale) <= 180
  )
);

-- The juror at seat N must be the juror deterministicPanel() put at seat N.
CREATE OR REPLACE FUNCTION assert_juror_on_panel() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  sc       record;
  expected text;
BEGIN
  SELECT case_id, scoring_version_id INTO sc
    FROM ranked_submission_scores WHERE id = NEW.score_id;

  SELECT juror_id INTO expected
    FROM case_panels
   WHERE case_id = sc.case_id
     AND scoring_version_id = sc.scoring_version_id
     AND seat_index = NEW.seat_index;

  IF expected IS NULL THEN
    RAISE EXCEPTION 'no panel seat % for case % under % — INV-3',
      NEW.seat_index, sc.case_id, sc.scoring_version_id;
  END IF;

  IF expected <> NEW.juror_id THEN
    RAISE EXCEPTION
      'juror % scored at seat % but panel seat % is % — INV-3',
      NEW.juror_id, NEW.seat_index, NEW.seat_index, expected;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER juror_on_panel
  BEFORE INSERT OR UPDATE ON juror_dimension_scores
  FOR EACH ROW EXECUTE FUNCTION assert_juror_on_panel();

-- ---------------------------------------------------------------------------
-- 7. Ghost strength
--
-- Blueprint §13.5. A ghost's strength evolves on its own record. The author's
-- PlayerRating is NOT touched when their archived submission is faced.
-- ---------------------------------------------------------------------------

CREATE TABLE ghost_strength (
  submission_id   uuid PRIMARY KEY REFERENCES ranked_submissions(id) ON DELETE CASCADE,
  initial_rating  integer     NOT NULL,   -- author's PlayerRating at submission time
  current_rating  integer     NOT NULL,
  appearances     integer     NOT NULL DEFAULT 0,
  wins            integer     NOT NULL DEFAULT 0,
  draws           integer     NOT NULL DEFAULT 0,
  losses          integer     NOT NULL DEFAULT 0,
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT counts_nonnegative CHECK (
    appearances >= 0 AND wins >= 0 AND draws >= 0 AND losses >= 0
  ),
  CONSTRAINT counts_reconcile CHECK (wins + draws + losses = appearances)
);

-- ---------------------------------------------------------------------------
-- 8. Comparison guard
--
-- INV-1 as a callable. A comparison across scoring versions RAISES.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION assert_comparable(live_score_id uuid, ghost_score_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE a record; b record; active_version text;
BEGIN
  SELECT scoring_version_id, case_id, case_version INTO a
    FROM ranked_submission_scores WHERE id = live_score_id;
  SELECT scoring_version_id, case_id, case_version INTO b
    FROM ranked_submission_scores WHERE id = ghost_score_id;

  IF a IS NULL OR b IS NULL THEN
    RAISE EXCEPTION 'assert_comparable: score not found';
  END IF;

  IF a.scoring_version_id <> b.scoring_version_id THEN
    RAISE EXCEPTION 'INV-1 violated: scoring versions % vs %',
      a.scoring_version_id, b.scoring_version_id;
  END IF;

  IF a.case_id <> b.case_id OR a.case_version <> b.case_version THEN
    RAISE EXCEPTION 'INV-2 violated: case %/% vs %/%',
      a.case_id, a.case_version, b.case_id, b.case_version;
  END IF;

  SELECT id INTO active_version FROM scoring_versions WHERE status = 'active';
  IF a.scoring_version_id IS DISTINCT FROM active_version THEN
    RAISE EXCEPTION 'INV-6/7 violated: % is not the active scoring version',
      a.scoring_version_id;
  END IF;
END $$;

COMMENT ON FUNCTION assert_comparable IS
  'INV-1/2/6/7. Call before computing any verdict. Raises rather than warns.';

COMMIT;
