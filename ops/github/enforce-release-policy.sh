#!/usr/bin/env bash

set -euo pipefail

TARGET_BRANCH="${TARGET_BRANCH:-main}"
REPOSITORY_SLUG="${GITHUB_REPOSITORY:-}"
DRY_RUN=false

usage() {
  cat <<'USAGE'
Enforce repository release policy on a branch via GitHub branch protection.

Usage:
  ./ops/github/enforce-release-policy.sh [options]

Options:
  --repo <owner/repo>      GitHub repository slug. Defaults to GITHUB_REPOSITORY or git remote.
  --branch <name>          Branch to protect. Defaults to "main".
  --dry-run                Print API calls and payload without mutating GitHub.
  -h, --help               Show this help text.

Policy applied:
  - Requires pull requests before merge
  - Requires at least 1 approving review
  - Dismisses stale approvals when new commits are pushed
  - Requires conversation resolution before merge
  - Requires status checks with strict branch up-to-date behavior
  - Requires successful "CI" check
  - Enforces protection for admins
  - Blocks force pushes and branch deletion
  - Requires linear history
USAGE
}

fail() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"
}

infer_repository_slug() {
  local remote_url normalized

  remote_url="$(git remote get-url origin 2>/dev/null || true)"
  [ -n "${remote_url}" ] || fail "Could not infer GitHub repository from git remote 'origin'. Pass --repo."

  normalized="${remote_url%.git}"
  normalized="${normalized#git@github.com:}"
  normalized="${normalized#https://github.com/}"
  normalized="${normalized#ssh://git@github.com/}"

  case "${normalized}" in
    */*)
      printf '%s\n' "${normalized}"
      ;;
    *)
      fail "Unsupported GitHub remote URL: ${remote_url}"
      ;;
  esac
}

while [ $# -gt 0 ]; do
  case "$1" in
    --repo)
      [ $# -ge 2 ] || fail "--repo requires a value"
      REPOSITORY_SLUG="$2"
      shift 2
      ;;
    --branch)
      [ $# -ge 2 ] || fail "--branch requires a value"
      TARGET_BRANCH="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      fail "Unknown option: $1"
      ;;
  esac
done

require_command git
require_command gh

if [ -z "${REPOSITORY_SLUG}" ]; then
  REPOSITORY_SLUG="$(infer_repository_slug)"
fi

if [ "${DRY_RUN}" != true ]; then
  gh auth status >/dev/null 2>&1 || fail "GitHub CLI is not authenticated. Run 'gh auth login' first."
fi

payload="$(cat <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "checks": [
      {
        "context": "CI"
      }
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1,
    "require_last_push_approval": false
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": false
}
JSON
)"

api_path="repos/${REPOSITORY_SLUG}/branches/${TARGET_BRANCH}/protection"

if [ "${DRY_RUN}" = true ]; then
  printf '[dry-run] gh api --method PUT -H %q --input - %q\n' "Accept: application/vnd.github+json" "${api_path}"
  printf '%s\n' "${payload}"
  exit 0
fi

printf '%s\n' "${payload}" | gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  --input - \
  "${api_path}" >/dev/null

printf 'Enforced branch protection on %s/%s for branch %s.\n' "${REPOSITORY_SLUG}" "${TARGET_BRANCH}" "${TARGET_BRANCH}"
