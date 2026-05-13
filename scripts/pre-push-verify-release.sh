#!/usr/bin/env bash

set -euo pipefail

printf 'Running local release verification suite...\n'

npm run hygiene:check
npm run lint
npm run typecheck
npm run test
npm run build

printf 'Release verification suite completed.\n'
