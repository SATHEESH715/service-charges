#!/usr/bin/env bash
# Adds up the test results from the four JUnit/TRX files and writes summary/summary.json.
# Expects PROJECT_NAME, RESULT_FOLDER, JOB_STATUS and RUN_URL in the environment.
set -uo pipefail

# Bruno writes one testsuite per request, so add them up. The other tools put totals on the first match.
sum()   { grep -o " $2=\"[0-9]*\"" "$1" 2>/dev/null | grep -o '[0-9]*' | awk '{s+=$1} END {print s+0}'; }
first() { grep -o " $2=\"[0-9]*\"" "$1" 2>/dev/null | head -1 | grep -o '[0-9]*' || echo 0; }

TRX=$(find api -name results.trx 2>/dev/null | head -1)
ANGULAR=web/test-results/junit.xml
BRUNO=bruno/results/junit.xml
PLAYWRIGHT=playwright/results/junit.xml

mkdir -p summary
cat > summary/summary.json <<JSON
{
  "project": "$PROJECT_NAME",
  "folder": "$RESULT_FOLDER",
  "repo": "${GITHUB_REPOSITORY:-local}",
  "commit": "${GITHUB_SHA:-unknown}",
  "branch": "${GITHUB_REF_NAME:-local}",
  "actor": "${GITHUB_ACTOR:-unknown}",
  "runUrl": "${RUN_URL:-}",
  "runDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "jobStatus": "${JOB_STATUS:-unknown}",
  "levels": {
    "dotnet":     { "total": $(first "$TRX" total), "failed": $(first "$TRX" failed) },
    "angular":    { "total": $(first $ANGULAR tests), "failed": $(( $(first $ANGULAR failures) + $(first $ANGULAR errors) )) },
    "bruno":      { "total": $(sum $BRUNO tests), "failed": $(( $(sum $BRUNO failures) + $(sum $BRUNO errors) )) },
    "playwright": { "total": $(first $PLAYWRIGHT tests), "failed": $(( $(first $PLAYWRIGHT failures) + $(first $PLAYWRIGHT errors) )) }
  }
}
JSON
cat summary/summary.json
