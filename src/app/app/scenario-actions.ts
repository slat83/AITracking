"use server";

import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/server/auth";
import { prisma } from "@/server/db/client";
import { escalateScenario, reassignScenarioOwner } from "@/server/scenarios/mutations";

const WORKSPACE_CONTEXT_FIELDS = [
  "view",
  "scenario",
  "scenarioType",
  "urgency",
  "owner",
  "account",
  "freshness",
  "sort",
];

type WorkspaceMessageKind = "ownershipError" | "ownershipNotice";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectToWorkspace(
  formData: FormData,
  kind: WorkspaceMessageKind,
  message: string,
  extra: Record<string, string | undefined> = {},
): never {
  const params = new URLSearchParams();

  for (const field of WORKSPACE_CONTEXT_FIELDS) {
    const value = getFormValue(formData, field);
    if (value) {
      params.set(field, value);
    }
  }

  params.set(kind, message);

  for (const [key, value] of Object.entries(extra)) {
    if (value) {
      params.set(key, value);
    }
  }

  redirect(`/app?${params.toString()}`);
}

function getScenarioMutationContext(formData: FormData) {
  const scenarioId = getFormValue(formData, "scenarioId");
  const ownershipMode = getFormValue(formData, "ownershipMode");
  const reason = getFormValue(formData, "reason");

  if (!scenarioId) {
    redirectToWorkspace(formData, "ownershipError", "Missing scenario action.");
  }

  return {
    scenarioId,
    ownershipMode,
    reason,
  };
}

function getActorRole(role: string | undefined) {
  if (!role || !Object.values(UserRole).includes(role as UserRole)) {
    return UserRole.VIEWER;
  }

  return role as UserRole;
}

export async function reassignScenarioOwnerAction(formData: FormData) {
  const session = await requireUser("VIEWER");
  const context = getScenarioMutationContext(formData);
  const newOwnerId = getFormValue(formData, "newOwnerId");

  try {
    const result = await prisma.$transaction((tx) =>
      reassignScenarioOwner(tx, {
        scenarioId: context.scenarioId,
        actorId: session.user.id,
        actorRole: getActorRole(session.user.role),
        newOwnerId,
        reason: context.reason,
      }),
    );

    revalidatePath("/app");
    redirectToWorkspace(
      formData,
      "ownershipNotice",
      `Scenario reassigned to ${result.newOwnerName}. Timeline updated.`,
    );
  } catch (error) {
    redirectToWorkspace(
      formData,
      "ownershipError",
      error instanceof Error ? error.message : "Failed to reassign the scenario owner.",
      {
        ownershipMode: context.ownershipMode || "reassign",
        newOwnerId,
        reason: context.reason,
      },
    );
  }
}

export async function escalateScenarioAction(formData: FormData) {
  const session = await requireUser("VIEWER");
  const context = getScenarioMutationContext(formData);
  const escalationTargetId = getFormValue(formData, "escalationTargetId");
  const escalationOwnerId = getFormValue(formData, "escalationOwnerId");

  try {
    const result = await prisma.$transaction((tx) =>
      escalateScenario(tx, {
        scenarioId: context.scenarioId,
        actorId: session.user.id,
        actorRole: getActorRole(session.user.role),
        escalationTargetId,
        escalationOwnerId,
        reason: context.reason,
      }),
    );

    revalidatePath("/app");
    redirectToWorkspace(
      formData,
      "ownershipNotice",
      `Scenario escalated to ${result.escalationTargetName}. Timeline updated.`,
    );
  } catch (error) {
    redirectToWorkspace(
      formData,
      "ownershipError",
      error instanceof Error ? error.message : "Failed to escalate the scenario.",
      {
        ownershipMode: context.ownershipMode || "escalate",
        escalationTargetId,
        escalationOwnerId,
        reason: context.reason,
      },
    );
  }
}
