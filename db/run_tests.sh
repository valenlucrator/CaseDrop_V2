#!/usr/bin/env bash
# Applies the scoring core schema to a scratch database and runs the invariant tests.
# Usage:  db/run_tests.sh [PGDATABASE_URL]
# Default expects a local postgres reachable as the current user.
set -euo pipefail
cd "$(dirname "$0")/.."
DB="${1:-postgres}"
psql "$DB" -v ON_ERROR_STOP=1 -q -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;"
psql "$DB" -v ON_ERROR_STOP=1 -q -f db/001_scoring_core.sql
psql "$DB" -v ON_ERROR_STOP=1 -t -f db/tests/001_invariants.sql \
  | grep -E "pass|FAIL|===" | sed 's/^ *//'
if psql "$DB" -v ON_ERROR_STOP=1 -t -f db/tests/001_invariants.sql 2>/dev/null | grep -q FAIL; then
  echo "INVARIANT TESTS FAILED"; exit 1
fi
echo "all invariants hold"
