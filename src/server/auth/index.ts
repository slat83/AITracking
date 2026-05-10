import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/server/auth/config";
import { hasRequiredRole, type AppRole } from "@/server/auth/roles";

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export async function requireUser(requiredRole: AppRole = "VIEWER") {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (!hasRequiredRole(session.user.role, requiredRole)) {
    redirect("/app");
  }

  return session;
}
