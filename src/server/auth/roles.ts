export const roles = ["ADMIN", "EDITOR", "VIEWER"] as const;

export type AppRole = (typeof roles)[number];

const roleRank: Record<AppRole, number> = {
  ADMIN: 3,
  EDITOR: 2,
  VIEWER: 1,
};

export function hasRequiredRole(
  role: AppRole | undefined,
  requiredRole: AppRole,
) {
  if (!role) {
    return false;
  }

  return roleRank[role] >= roleRank[requiredRole];
}
