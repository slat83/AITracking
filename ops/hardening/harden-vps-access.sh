#!/bin/sh
set -eu

if [ "$(id -u)" -ne 0 ]; then
  echo "Run this script as root." >&2
  exit 1
fi

if [ -z "${ADMIN_USER:-}" ]; then
  echo "ADMIN_USER is required." >&2
  exit 1
fi

if [ -z "${ADMIN_SSH_KEYS_FILE:-}" ]; then
  echo "ADMIN_SSH_KEYS_FILE is required." >&2
  exit 1
fi

if [ ! -f "$ADMIN_SSH_KEYS_FILE" ]; then
  echo "SSH key file not found: $ADMIN_SSH_KEYS_FILE" >&2
  exit 1
fi

if ! command -v sshd >/dev/null 2>&1; then
  echo "OpenSSH server is required before hardening." >&2
  exit 1
fi

SSH_GROUP="${SSH_GROUP:-sudo}"
SSH_PORT="${SSH_PORT:-22}"
SSH_ALLOW_CIDR="${SSH_ALLOW_CIDR:-}"
ENABLE_UFW="${ENABLE_UFW:-true}"
ENABLE_FAIL2BAN="${ENABLE_FAIL2BAN:-true}"
INSTALL_PACKAGES="${INSTALL_PACKAGES:-true}"
LOCK_ROOT_ACCOUNT="${LOCK_ROOT_ACCOUNT:-false}"

if [ "$INSTALL_PACKAGES" = "true" ] && command -v apt-get >/dev/null 2>&1; then
  export DEBIAN_FRONTEND=noninteractive
  apt-get update
  apt-get install -y sudo ufw fail2ban
fi

if ! getent group "$SSH_GROUP" >/dev/null 2>&1; then
  echo "Group not found: $SSH_GROUP" >&2
  exit 1
fi

if ! id "$ADMIN_USER" >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash --groups "$SSH_GROUP" "$ADMIN_USER"
else
  usermod -aG "$SSH_GROUP" "$ADMIN_USER"
fi

install -d -m 700 -o "$ADMIN_USER" -g "$ADMIN_USER" "/home/$ADMIN_USER/.ssh"
install -m 600 -o "$ADMIN_USER" -g "$ADMIN_USER" "$ADMIN_SSH_KEYS_FILE" "/home/$ADMIN_USER/.ssh/authorized_keys"

SSHD_CONFIG_DIR="/etc/ssh/sshd_config.d"
SSHD_OVERRIDE="$SSHD_CONFIG_DIR/10-content-ops-hardening.conf"

install -d -m 755 "$SSHD_CONFIG_DIR"
cat >"$SSHD_OVERRIDE" <<EOF
PasswordAuthentication no
KbdInteractiveAuthentication no
ChallengeResponseAuthentication no
PubkeyAuthentication yes
PermitRootLogin no
PermitEmptyPasswords no
UsePAM yes
AllowUsers $ADMIN_USER
EOF

if [ "$SSH_PORT" != "22" ]; then
  printf 'Port %s\n' "$SSH_PORT" >>"$SSHD_OVERRIDE"
fi

sshd -t

if [ "$ENABLE_FAIL2BAN" = "true" ] && command -v systemctl >/dev/null 2>&1; then
  cat > /etc/fail2ban/jail.d/content-ops-sshd.local <<EOF
[sshd]
enabled = true
port = $SSH_PORT
maxretry = 5
findtime = 10m
bantime = 1h
EOF
  systemctl enable --now fail2ban
fi

if [ "$ENABLE_UFW" = "true" ] && command -v ufw >/dev/null 2>&1; then
  ufw --force reset

  if [ -n "$SSH_ALLOW_CIDR" ]; then
    ufw allow from "$SSH_ALLOW_CIDR" to any port "$SSH_PORT" proto tcp
  else
    ufw allow "$SSH_PORT"/tcp
  fi

  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw --force enable
fi

if command -v systemctl >/dev/null 2>&1; then
  systemctl reload ssh || systemctl reload sshd
fi

if [ "$LOCK_ROOT_ACCOUNT" = "true" ]; then
  passwd -l root
fi

cat <<EOF
VPS SSH hardening applied.

Next steps:
1. Open a second terminal and verify SSH access as $ADMIN_USER before closing the current root session.
2. Rotate the root password from a trusted console session if it may have been exposed.
3. If console recovery is available, rerun with LOCK_ROOT_ACCOUNT=true after verification.
EOF
