#!/usr/bin/env bash

set -euo pipefail

ENVIRONMENT_NAME="${ENVIRONMENT_NAME:-production}"
SECRETS_FILE="${SECRETS_FILE:-private/github-production-secrets.env}"
REPOSITORY_SLUG="${GITHUB_REPOSITORY:-}"
DRY_RUN=false
CONFIGURE_BRANCH_POLICY=true

required_secrets=(
  VPS_HOST
  VPS_PORT
  VPS_USER
  VPS_APP_DIR
  VPS_SSH_PRIVATE_KEY
  VPS_SSH_KNOWN_HOSTS
)

usage() {
  cat <<'EOF'
Bootstrap the GitHub Actions production environment and deploy secrets.

Usage:
  ./ops/github/bootstrap-production-environment.sh [options]

Options:
  --repo <owner/repo>      GitHub repository slug. Defaults to GITHUB_REPOSITORY or the local git remote.
  --env <name>             GitHub environment name. Defaults to "production".
  --secrets-file <path>    Local env file that provides the required deploy secrets.
                           Defaults to "private/github-production-secrets.env".
  --skip-branch-policy     Create/update the environment without forcing protected branches only.
  --dry-run                Print the actions that would run without mutating GitHub.
  -h, --help               Show this help text.

Expected secrets in the secrets file:
  VPS_HOST
  VPS_PORT
  VPS_USER
  VPS_APP_DIR
  VPS_SSH_PRIVATE_KEY
  VPS_SSH_KNOWN_HOSTS

Example:
  cp ops/github/production-secrets.env.example private/github-production-secrets.env
  $EDITOR private/github-production-secrets.env
  ./ops/github/bootstrap-production-environment.sh --repo acme/flowvory-app

Notes:
  - Live runs require "gh auth login" or an equivalent token-backed gh session.
  - Dry runs do not require GitHub authentication.
  - The default branch policy allows deployments only from protected branches. If "main"
    is not protected yet, either protect it first or pass --skip-branch-policy.
EOF
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
  [ -n "${remote_url}" ] || fail "Could not infer the GitHub repository from git remote 'origin'. Pass --repo."

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

load_secret_file() {
  local secret_name

  [ -f "${SECRETS_FILE}" ] || fail "Secrets file not found: ${SECRETS_FILE}"

  set -a
  # shellcheck disable=SC1090
  . "${SECRETS_FILE}"
  set +a

  for secret_name in "${required_secrets[@]}"; do
    [ -n "${!secret_name:-}" ] || fail "Secret ${secret_name} is missing or empty in ${SECRETS_FILE}"
  done
}

put_environment() {
  local api_args

  api_args=(
    api
    --method PUT
    -H "Accept: application/vnd.github+json"
    "repos/${REPOSITORY_SLUG}/environments/${ENVIRONMENT_NAME}"
  )

  if [ "${CONFIGURE_BRANCH_POLICY}" = true ]; then
    api_args+=(
      -f "deployment_branch_policy[protected_branches]=true"
      -f "deployment_branch_policy[custom_branch_policies]=false"
    )
  fi

  if [ "${DRY_RUN}" = true ]; then
    printf '[dry-run] gh'
    printf ' %q' "${api_args[@]}"
    printf '\n'
    return
  fi

  gh "${api_args[@]}" >/dev/null
  printf 'Configured GitHub environment %s on %s.\n' "${ENVIRONMENT_NAME}" "${REPOSITORY_SLUG}"
}

set_secret() {
  local secret_name secret_value

  secret_name="$1"
  secret_value="${!secret_name}"

  if [ "${DRY_RUN}" = true ]; then
    printf '[dry-run] gh secret set %s --env %s --repo %s --body ***redacted***\n' \
      "${secret_name}" \
      "${ENVIRONMENT_NAME}" \
      "${REPOSITORY_SLUG}"
    return
  fi

  gh secret set "${secret_name}" \
    --env "${ENVIRONMENT_NAME}" \
    --repo "${REPOSITORY_SLUG}" \
    --body "${secret_value}"
}

while [ $# -gt 0 ]; do
  case "$1" in
    --repo)
      [ $# -ge 2 ] || fail "--repo requires a value"
      REPOSITORY_SLUG="$2"
      shift 2
      ;;
    --env)
      [ $# -ge 2 ] || fail "--env requires a value"
      ENVIRONMENT_NAME="$2"
      shift 2
      ;;
    --secrets-file)
      [ $# -ge 2 ] || fail "--secrets-file requires a value"
      SECRETS_FILE="$2"
      shift 2
      ;;
    --skip-branch-policy)
      CONFIGURE_BRANCH_POLICY=false
      shift
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

if [ "${DRY_RUN}" != true ]; then
  gh auth status >/dev/null 2>&1 || fail "GitHub CLI is not authenticated. Run 'gh auth login' first."
fi

if [ -z "${REPOSITORY_SLUG}" ]; then
  REPOSITORY_SLUG="$(infer_repository_slug)"
fi

load_secret_file
put_environment

for secret_name in "${required_secrets[@]}"; do
  set_secret "${secret_name}"
done

if [ "${DRY_RUN}" = true ]; then
  printf '[dry-run] Completed bootstrap plan for %s/%s.\n' "${REPOSITORY_SLUG}" "${ENVIRONMENT_NAME}"
else
  printf 'Uploaded %s deploy secrets to %s/%s.\n' "${#required_secrets[@]}" "${REPOSITORY_SLUG}" "${ENVIRONMENT_NAME}"
fi
