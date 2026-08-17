-- Invariant tests for db/001_scoring_core.sql
-- Each test asserts that an ILLEGAL state is REJECTED by the database.
-- Run: psql -v ON_ERROR_STOP=1 -f db/001_scoring_core.sql -f db/tests/001_invariants.sql

\set QUIET on
\pset pager off

CREATE OR REPLACE FUNCTION must_fail(stmt text, expect text) RETURNS text
LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE stmt;
  RETURN format('FAIL  <%s> was ACCEPTED but must be rejected', expect);
EXCEPTION WHEN others THEN
  IF position(lower(expect) in lower(SQLERRM)) = 0 THEN
    RETURN format('FAIL  <%s> rejected for the wrong reason: %s', expect, SQLERRM);
  END IF;
  RETURN format('pass  %s', expect);
END $$;

CREATE OR REPLACE FUNCTION must_pass(stmt text, label text) RETURNS text
LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE stmt;
  RETURN format('pass  %s', label);
EXCEPTION WHEN others THEN
  RETURN format('FAIL  %s unexpectedly rejected: %s', label, SQLERRM);
END $$;

-- ---------------------------------------------------------------- fixtures --

INSERT INTO scoring_versions
  (id, rubric_version, model_id, provider_id, juror_roster_version,
   case_panel_seed_rule_version, epsilon, status, activated_at)
VALUES
  ('sv_01','r1','gpt-5-nano','openai','roster_v1','seed_v1',1,'active', now()),
  ('sv_02','r2','gpt-5.4-nano','openai','roster_v1','seed_v1',1,'backfilling', NULL);

INSERT INTO juror_definitions
  (juror_id, roster_version, display_name, lens,
   w_grounding, w_rule, w_coherence, w_calibration, w_ambiguity)
SELECT j, 'roster_v1', initcap(j), j, 20, 20, 20, 20, 20
FROM unnest(ARRAY['formalist','pragmatist','skeptic','equitable','evidence_first',
                  'institutionalist','plain_reader','contrarian','textualist',
                  'consequentialist','spare_a']) AS j;

-- panels for both versions (10 seats each)
INSERT INTO case_panels (case_id, scoring_version_id, seat_index, juror_id, roster_version)
SELECT 'case_a', v, s.i - 1, j.juror_id, 'roster_v1'
FROM   (VALUES ('sv_01'),('sv_02')) AS ver(v),
       generate_series(1,10) AS s(i),
       LATERAL (SELECT juror_id FROM juror_definitions
                 WHERE roster_version='roster_v1' AND juror_id <> 'spare_a'
                 ORDER BY juror_id OFFSET s.i - 1 LIMIT 1) j;

INSERT INTO ranked_submissions
  (id, player_id, case_id, case_version, side, bundle_id,
   opened_evidence_ids, argument, word_count)
VALUES
  ('11111111-1111-1111-1111-111111111111', gen_random_uuid(),
   'case_a','1.0','defend','A1', ARRAY['E1','E2'],'live argument', 55),
  ('22222222-2222-2222-2222-222222222222', gen_random_uuid(),
   'case_a','1.0','challenge','B2', ARRAY['E3','E4'],'ghost argument', 58),
  ('33333333-3333-3333-3333-333333333333', gen_random_uuid(),
   'case_a','2.0','challenge','B2', ARRAY['E3','E4'],'later case version', 40);

INSERT INTO ranked_submission_scores
  (id, submission_id, scoring_version_id, case_id, case_version, aggregate_score)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','sv_01','case_a','1.0',140),
  ('aaaaaaaa-0000-0000-0000-000000000002','22222222-2222-2222-2222-222222222222','sv_01','case_a','1.0',132),
  ('aaaaaaaa-0000-0000-0000-000000000003','22222222-2222-2222-2222-222222222222','sv_02','case_a','1.0',128),
  ('aaaaaaaa-0000-0000-0000-000000000004','33333333-3333-3333-3333-333333333333','sv_01','case_a','2.0',120);

\set QUIET off
\echo ''
\echo '=== scoring version lifecycle ==='
SELECT must_fail($$INSERT INTO scoring_versions
  (id,rubric_version,model_id,provider_id,juror_roster_version,
   case_panel_seed_rule_version,epsilon,status,activated_at)
  VALUES ('sv_03','r3','m','openai','roster_v1','seed_v1',1,'active',now())$$,
  'duplicate key') AS "INV-5  second active version rejected";

SELECT must_fail($$INSERT INTO scoring_versions
  (id,rubric_version,model_id,provider_id,juror_roster_version,
   case_panel_seed_rule_version,epsilon)
  VALUES ('sv_04','r4','m','openai','roster_v1','seed_v1',25)$$,
  'epsilon_on_juror_scale') AS "epsilon above juror scale rejected";

\echo ''
\echo '=== juror definitions ==='
SELECT must_fail($$INSERT INTO juror_definitions
  (juror_id,roster_version,display_name,lens,
   w_grounding,w_rule,w_coherence,w_calibration,w_ambiguity)
  VALUES ('bad_weights','roster_v1','Bad','x',30,30,30,30,30)$$,
  'weights_sum_100') AS "weights not summing to 100 rejected";

\echo ''
\echo '=== panels (INV-3) ==='
SELECT must_fail($$INSERT INTO case_panels
  (case_id,scoring_version_id,seat_index,juror_id,roster_version)
  VALUES ('case_a','sv_01',3,'spare_a','roster_v1')$$,
  'duplicate key') AS "seat collision rejected";

SELECT must_fail($$INSERT INTO case_panels
  (case_id,scoring_version_id,seat_index,juror_id,roster_version)
  VALUES ('case_a','sv_01',0,'formalist','roster_v1')$$,
  'duplicate key') AS "juror twice on one panel rejected";

-- The completeness trigger is DEFERRABLE INITIALLY DEFERRED so ten seats can be
-- inserted in one transaction. Forced IMMEDIATE here so the failure lands inside
-- the catch block rather than at COMMIT.
SELECT must_fail($$SET CONSTRAINTS case_panel_complete IMMEDIATE;
  INSERT INTO case_panels
    (case_id,scoring_version_id,seat_index,juror_id,roster_version)
  VALUES ('case_b','sv_01',0,'formalist','roster_v1')$$,
  'expected 10') AS "incomplete panel rejected";

SET CONSTRAINTS case_panel_complete DEFERRED;

-- ...and a complete 10-seat panel inserted in one transaction is accepted.
SELECT must_pass($$INSERT INTO case_panels
    (case_id,scoring_version_id,seat_index,juror_id,roster_version)
  SELECT 'case_c','sv_01', s.i - 1, j.juror_id, 'roster_v1'
  FROM generate_series(1,10) AS s(i),
       LATERAL (SELECT juror_id FROM juror_definitions
                 WHERE roster_version='roster_v1' AND juror_id <> 'spare_a'
                 ORDER BY juror_id OFFSET s.i - 1 LIMIT 1) j$$,
  'complete 10-seat panel accepted') AS "complete panel accepted";

\echo ''
\echo '=== submissions ==='
SELECT must_fail($$INSERT INTO ranked_submissions
  (id,case_id,case_version,side,bundle_id,opened_evidence_ids,argument,word_count)
  VALUES (gen_random_uuid(),'case_a','1.0','defend','A1',ARRAY['E1','E2'],'x',61)$$,
  'ranked_word_cap') AS "61-word Ranked argument rejected";

SELECT must_fail($$INSERT INTO ranked_submissions
  (id,case_id,case_version,side,bundle_id,opened_evidence_ids,argument,word_count)
  VALUES (gen_random_uuid(),'case_a','1.0','defend','A1',ARRAY['E1','E2','E3'],'x',30)$$,
  'opened_exactly_two') AS "three opened evidence items rejected";

SELECT must_fail($$INSERT INTO ranked_submissions
  (id,player_id,case_id,case_version,side,bundle_id,opened_evidence_ids,
   argument,word_count,is_seed)
  VALUES (gen_random_uuid(),gen_random_uuid(),'case_a','1.0','defend','A1',
          ARRAY['E1','E2'],'x',30,true)$$,
  'seed_has_no_player') AS "seed ghost with an owner rejected";

\echo ''
\echo '=== scores (INV-2) ==='
SELECT must_fail($$INSERT INTO ranked_submission_scores
  (id,submission_id,scoring_version_id,case_id,case_version,aggregate_score)
  VALUES (gen_random_uuid(),'11111111-1111-1111-1111-111111111111','sv_01','case_a','9.9',100)$$,
  'INV-2') AS "score claiming wrong case_version rejected";

SELECT must_fail($$INSERT INTO ranked_submission_scores
  (id,submission_id,scoring_version_id,case_id,case_version,aggregate_score)
  VALUES (gen_random_uuid(),'11111111-1111-1111-1111-111111111111','sv_01','case_a','1.0',201)$$,
  'aggregate_range') AS "aggregate above 200 rejected";

SELECT must_fail($$INSERT INTO ranked_submission_scores
  (id,submission_id,scoring_version_id,case_id,case_version,aggregate_score)
  VALUES (gen_random_uuid(),'11111111-1111-1111-1111-111111111111','sv_01','case_a','1.0',140)$$,
  'duplicate key') AS "second score under same version rejected";

\echo ''
\echo '=== juror dimension scores (INV-3) ==='
SELECT must_fail($$INSERT INTO juror_dimension_scores
  (score_id,seat_index,juror_id,grounding,rule,coherence,calibration,ambiguity,
   juror_score,rationale)
  VALUES ('aaaaaaaa-0000-0000-0000-000000000001',0,'spare_a',10,10,10,10,10,10,'r')$$,
  'INV-3') AS "juror not on the panel rejected";

SELECT must_fail($$INSERT INTO juror_dimension_scores
  (score_id,seat_index,juror_id,grounding,rule,coherence,calibration,ambiguity,
   juror_score,rationale)
  VALUES ('aaaaaaaa-0000-0000-0000-000000000001',99,'formalist',10,10,10,10,10,10,'r')$$,
  'no panel seat') AS "seat index outside the panel rejected";

SELECT must_fail($$INSERT INTO juror_dimension_scores
  (score_id,seat_index,juror_id,grounding,rule,coherence,calibration,ambiguity,
   juror_score,rationale)
  VALUES ('aaaaaaaa-0000-0000-0000-000000000001',0,'consequentialist',21,10,10,10,10,10,'r')$$,
  'dimensions_0_20') AS "dimension above 20 rejected";

SELECT must_fail($$INSERT INTO juror_dimension_scores
  (score_id,seat_index,juror_id,grounding,rule,coherence,calibration,ambiguity,
   juror_score,rationale)
  VALUES ('aaaaaaaa-0000-0000-0000-000000000001',0,'consequentialist',10,10,10,10,10,10,
          repeat('x',181))$$,
  'rationale_bounded') AS "rationale over 180 chars rejected";

\echo ''
\echo '=== comparison guard (INV-1 / INV-2 / INV-6 / INV-7) ==='
SELECT must_fail(
  $$SELECT assert_comparable('aaaaaaaa-0000-0000-0000-000000000001',
                             'aaaaaaaa-0000-0000-0000-000000000003')$$,
  'INV-1') AS "cross-SCORING-VERSION comparison rejected";

SELECT must_fail(
  $$SELECT assert_comparable('aaaaaaaa-0000-0000-0000-000000000001',
                             'aaaaaaaa-0000-0000-0000-000000000004')$$,
  'INV-2') AS "cross-CASE-VERSION comparison rejected";

SELECT must_pass(
  $$SELECT assert_comparable('aaaaaaaa-0000-0000-0000-000000000001',
                             'aaaaaaaa-0000-0000-0000-000000000002')$$,
  'same version + same case version compares') AS "legal comparison accepted";

\echo ''
\echo '=== ghost strength (blueprint 13.5) ==='
SELECT must_fail($$INSERT INTO ghost_strength
  (submission_id,initial_rating,current_rating,appearances,wins,draws,losses)
  VALUES ('22222222-2222-2222-2222-222222222222',1520,1684,94,60,5,20)$$,
  'counts_reconcile') AS "W+D+L not equal to appearances rejected";

SELECT must_pass($$INSERT INTO ghost_strength
  (submission_id,initial_rating,current_rating,appearances,wins,draws,losses)
  VALUES ('22222222-2222-2222-2222-222222222222',1520,1684,94,67,5,22)$$,
  'consistent ghost record accepted') AS "legal ghost strength accepted";
