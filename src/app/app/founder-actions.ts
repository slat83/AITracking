"use server";

import { PilotStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/server/auth";
import { prisma } from "@/server/db/client";
import { resolvePilotWorkspaceAccess } from "@/server/pilots/commercial";
import { parseLineList, pilotOnboardingSchema } from "@/server/pilots/workflow";

function redirectWithMessage(kind: "error" | "notice", message: string): never {
  const params = new URLSearchParams({ [kind]: message });
  redirect(`/app?${params.toString()}`);
}

export async function saveFounderOnboardingAction(formData: FormData) {
  const session = await requireUser("VIEWER");
  const pilotId = String(formData.get("pilotId") ?? "");

  if (!pilotId) {
    redirectWithMessage("error", "Missing pilot onboarding record.");
  }

  const membership = await prisma.pilotContact.findFirst({
    where: {
      pilotId,
      userId: session.user.id,
    },
    include: {
      pilot: {
        include: {
          contacts: true,
        },
      },
    },
  });

  if (!membership) {
    redirectWithMessage("error", "You do not have access to that workspace.");
  }

  const access = resolvePilotWorkspaceAccess(membership.pilot, session.user.id);
  if (!access.hasAccess) {
    redirectWithMessage("error", access.reason);
  }

  const parsed = pilotOnboardingSchema.safeParse({
    brandName: formData.get("brandName"),
    websiteUrl: formData.get("websiteUrl"),
    storePlatform: formData.get("storePlatform"),
    targetGeography: formData.get("targetGeography"),
    prioritySurfaces: parseLineList(String(formData.get("prioritySurfaces") ?? "")),
    topCompetitors: parseLineList(String(formData.get("topCompetitors") ?? "")),
    businessQuestion: formData.get("businessQuestion"),
    supportingContext: formData.get("supportingContext"),
  });

  if (!parsed.success) {
    redirectWithMessage("error", parsed.error.issues[0]?.message ?? "Complete the onboarding fields.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.pilot.update({
      where: { id: pilotId },
      data: {
        brandName: parsed.data.brandName,
        websiteUrl: parsed.data.websiteUrl,
        storePlatform: parsed.data.storePlatform ?? null,
        targetGeography: parsed.data.targetGeography ?? null,
        prioritySurfaces: parsed.data.prioritySurfaces,
        topCompetitors: parsed.data.topCompetitors,
        businessQuestion: parsed.data.businessQuestion,
        supportingContext: parsed.data.supportingContext ?? null,
        onboardingStartedAt: membership.pilot.onboardingStartedAt ?? new Date(),
        onboardingCompletedAt: new Date(),
        status:
          membership.pilot.status === PilotStatus.INVITE_SENT
          || membership.pilot.status === PilotStatus.ONBOARDING_IN_PROGRESS
            ? PilotStatus.READY_FOR_AUDIT
            : membership.pilot.status,
      },
    });

    await tx.auditEvent.create({
      data: {
        entityType: "Pilot",
        entityId: pilotId,
        action: "founder_onboarding_saved",
        actorId: session.user.id,
      },
    });
  });

  revalidatePath("/app");
  redirectWithMessage("notice", "Inputs saved. Flowvory has the details needed to continue.");
}
