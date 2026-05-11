# VPS Access Hardening And Root Credential Rotation

This runbook defines the approved access path for the production VPS and the response flow if the root credential was exposed.

Follow [../security/storage-and-worker-policy.md](../security/storage-and-worker-policy.md) before recording any host-specific details. Keep hostnames, IPs, usernames, key fingerprints, provider console links, and rotation notes in ignored local paths such as `ops/local/` or `private/`.

## Target state

- SSH access uses a named admin user, not `root`
- SSH uses public keys only
- `root` SSH login is disabled
- password-based SSH login is disabled
- the host firewall exposes only SSH, `80`, and `443`
- `fail2ban` is enabled for SSH
- the root password is rotated immediately after any suspected exposure

## Bootstrap flow

Run this once from a trusted root session on a Debian or Ubuntu VPS:

```bash
cp ~/.ssh/authorized_keys ./private/admin-authorized_keys
sudo env \
  ADMIN_USER=flowvory \
  ADMIN_SSH_KEYS_FILE=./private/admin-authorized_keys \
  SSH_ALLOW_CIDR=203.0.113.0/24 \
  sh ./ops/hardening/harden-vps-access.sh
```

What it does:

- installs `sudo`, `ufw`, and `fail2ban` when `apt-get` is available
- creates the admin user if needed and grants `sudo`
- installs the supplied public keys as that user's `authorized_keys`
- writes an SSH config override that disables root and password login
- validates SSH configuration before reload
- enables firewall rules for SSH, `80`, and `443`
- enables `fail2ban` for SSH

Keep the current root session open until the new admin login is confirmed from a second terminal.

## Required verification

1. Open a second terminal.
2. SSH in as the new admin user with the installed key.
3. Confirm `sudo -v` succeeds.
4. Confirm `ssh root@host` is denied.
5. Confirm password-based SSH login is denied.
6. Confirm `sudo ufw status` and `sudo fail2ban-client status sshd` show the expected controls.
7. Update any deploy automation secret or local SSH config that still references `root` so it uses the new admin user instead.

Do not close the original root session until all seven checks pass.

## Root credential exposure response

Use this sequence when the root password or root SSH access path may have been exposed:

1. Finish the bootstrap flow above from a trusted console or existing root shell.
2. Verify non-root key-based access works.
3. Rotate the root password immediately from the provider console or a trusted console shell with `passwd root`.
4. If the provider offers console recovery and the team agrees root password login is unnecessary, lock the root account with `passwd -l root` or rerun the hardening script with `LOCK_ROOT_ACCOUNT=true`.
5. Review `/var/log/auth.log` or the distro equivalent for unexpected root login attempts.
6. Update deploy automation to use the hardened admin user if any secret, CI job, or operator shortcut still references `root`.
7. Record a redacted summary in the issue and keep sensitive forensic notes in `ops/local/` or `private/`.

If there is evidence of unauthorized access, stop here and treat the event as an incident. Follow the incident workflow in [vps-operations.md](./vps-operations.md) before proceeding with routine deploys.

## Script inputs

The hardening script reads these environment variables:

- `ADMIN_USER`: required admin username
- `ADMIN_SSH_KEYS_FILE`: required path to a file containing one or more public keys
- `SSH_ALLOW_CIDR`: optional CIDR allowed to reach SSH; if omitted, SSH stays open on the configured port
- `SSH_PORT`: optional SSH port, defaults to `22`
- `SSH_GROUP`: optional sudo-capable group, defaults to `sudo`
- `LOCK_ROOT_ACCOUNT`: optional `true` or `false`, defaults to `false`
- `ENABLE_UFW`: optional `true` or `false`, defaults to `true`
- `ENABLE_FAIL2BAN`: optional `true` or `false`, defaults to `true`
- `INSTALL_PACKAGES`: optional `true` or `false`, defaults to `true`

## Notes

- The script intentionally does not set a new root password. Rotation should happen in the operator's approved secret-management flow, not through repo-tracked automation.
- If the host is not Debian or Ubuntu, adapt the package-install step manually and then rerun the script with `INSTALL_PACKAGES=false`.
- If SSH access is restricted by CIDR, confirm the operator IP range before applying the rule.
