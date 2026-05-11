"use server";

import { OpportunityStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/server/auth";
import { prisma } from "@/server/db/client";
import {
  canTransitionOpportunity,
  opportunityIntakeSchema,
  parseDateInput,
  parseTags,
  validateOpportunityReadyForDraft,
} from "@/server/opportunities/workflow";
import { syncScenarioTaskOrchestration } from "@/server/scenarios/orchestration";
import { syncScenarioProofState } from "@/server/scenarios/proof";
import { syncScenarioFromOpportunity } from "@/server/scenarios/service";

function redirectWithMessage(kind: "error" | "notice", message: string): never {
  const params = new URLSearchParams({ [kind]: message });
  redirect(`/app/opportunities?${params.toString()}`);
}

async function recordOpportunityAudit(
  db: Pick<typeof prisma, "auditEvent">,
  actorId: string,
  entityId: string,
  action: string,
  payload: Record<string, unknown>,
) {
  await db.auditEvent.create({
    data: {
      entityType: "Opportunity",
      entityId,
      action,
      actorId,
      payload: payload as Prisma.InputJsonValue,
    },
  });
}

export async function createOpportunityAction(formData: FormData) {
  const session = await requireUser("EDITOR");

  const parsed = opportunityIntakeSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary"),
    sourceName: formData.get("sourceName"),
    sourceUrl: formData.get("sourceUrl"),
    scenario: formData.get("scenario"),
    whyNow: formData.get("whyNow"),
    suggestedAssetAngle: formData.get("suggestedAssetAngle"),
    priority: formData.get("priority"),
    ownerId: formData.get("ownerId"),
    tags: parseTags(String(formData.get("tags") ?? "")),
    capturedAt: new Date(),
  });

  if (!parsed.success) {
    redirectWithMessage("error", parsed.error.issues[0]?.message ?? "Intake fields are incomplete.");
  }

  try {
    await prisma.$transaction(async (tx) => {
      const opportunity = await tx.opportunity.create({
        data: parsed.data,
      });

      const scenario = await syncScenarioFromOpportunity(tx, {
        actorId: session.user.id,
        opportunity,
      });

      await syncScenarioProofState(tx, {
        scenarioId: scenario.id,
        actorId: session.user.id,
      });

      await syncScenarioTaskOrchestration(tx, {
        scenarioId: scenario.id,
        actorId: session.user.id,
      });

      await recordOpportunityAudit(tx, session.user.id, opportunity.id, "created", {
        status: opportunity.status,
        priority: opportunity.priority,
        scenario: opportunity.scenario,
      });
    });
  } catch (error) {
    redirectWithMessage("error", error instanceof Error ? error.message : "Failed to capture opportunity.");
  }

  revalidatePath("/app");
  revalidatePath("/app/opportunities");
  redirectWithMessage("notice", "Opportunity captured.");
}

export async function updateOpportunityAction(formData: FormData) {
  const session = await requireUser("EDITOR");
  const opportunityId = String(formData.get("opportunityId") ?? "");
  const intent = String(formData.get("intent") ?? "");

  if (!opportunityId || !intent) {
    redirectWithMessage("error", "Missing opportunity action.");
  }

  const existing = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
    select: {
      id: true,
      status: true,
    },
  });

  if (!existing) {
    redirectWithMessage("error", "Opportunity not found.");
  }

  if (!canTransitionOpportunity(existing.status, intent)) {
    redirectWithMessage("error", "That transition is not allowed from the current state.");
  }

  const updateData = {
    title: String(formData.get("title") ?? "").trim(),
    summary: String(formData.get("summary") ?? "").trim(),
    sourceName: String(formData.get("sourceName") ?? "").trim(),
    sourceUrl: String(formData.get("sourceUrl") ?? "").trim() || null,
    scenario: String(formData.get("scenario") ?? "").trim() || null,
    whyNow: String(formData.get("whyNow") ?? "").trim() || null,
    suggestedAssetAngle: String(formData.get("suggestedAssetAngle") ?? "").trim() || null,
    priority: String(formData.get("priority") ?? "MEDIUM"),
    ownerId: String(formData.get("ownerId") ?? "").trim() || null,
    tags: parseTags(String(formData.get("tags") ?? "")),
    briefAudience: String(formData.get("briefAudience") ?? "").trim() || null,
    briefQuestion: String(formData.get("briefQuestion") ?? "").trim() || null,
    assetType: String(formData.get("assetType") ?? "").trim() || null,
    proofRequirement: String(formData.get("proofRequirement") ?? "").trim() || null,
    targetCta: String(formData.get("targetCta") ?? "").trim() || null,
    dueDate: parseDateInput(String(formData.get("dueDate") ?? "")) ?? null,
    rejectionReason: String(formData.get("rejectionReason") ?? "").trim() || null,
  };

  const baseIntakeCheck = opportunityIntakeSchema.safeParse({
    title: updateData.title,
    summary: updateData.summary,
    sourceName: updateData.sourceName,
    sourceUrl: updateData.sourceUrl ?? undefined,
    scenario: updateData.scenario ?? undefined,
    whyNow: updateData.whyNow ?? undefined,
    suggestedAssetAngle: updateData.suggestedAssetAngle ?? undefined,
    priority: updateData.priority,
    ownerId: updateData.ownerId ?? undefined,
    tags: updateData.tags,
    capturedAt: new Date(),
  });

  if (!baseIntakeCheck.success) {
    redirectWithMessage("error", baseIntakeCheck.error.issues[0]?.message ?? "Intake fields are incomplete.");
  }

  let nextStatus = existing.status;

  if (intent === "start-triage") {
    nextStatus = OpportunityStatus.TRIAGE;
  }

  if (intent === "ready") {
    const readyCheck = validateOpportunityReadyForDraft({
      briefAudience: updateData.briefAudience ?? undefined,
      briefQuestion: updateData.briefQuestion ?? undefined,
      assetType: updateData.assetType ?? undefined,
      proofRequirement: updateData.proofRequirement ?? undefined,
      targetCta: updateData.targetCta ?? undefined,
      dueDate: updateData.dueDate ?? undefined,
    });

    if (!readyCheck.success) {
      redirectWithMessage("error", readyCheck.error.issues[0]?.message ?? "Draft brief is incomplete.");
    }

    nextStatus = OpportunityStatus.READY_FOR_DRAFT;
    updateData.rejectionReason = null;
  }

  if (intent === "reject") {
    if (!updateData.rejectionReason) {
      redirectWithMessage("error", "Add a rejection reason before parking the opportunity.");
    }

    nextStatus = OpportunityStatus.ARCHIVED;
  }

  if (intent === "archive") {
    nextStatus = OpportunityStatus.ARCHIVED;
  }

  try {
    await prisma.$transaction(async (tx) => {
      const opportunity = await tx.opportunity.update({
        where: { id: opportunityId },
        data: {
          ...updateData,
          priority: updateData.priority as "LOW" | "MEDIUM" | "HIGH",
          status: nextStatus,
        },
      });

      const scenario = await syncScenarioFromOpportunity(tx, {
        actorId: session.user.id,
        opportunity,
      });

      await syncScenarioProofState(tx, {
        scenarioId: scenario.id,
        actorId: session.user.id,
      });

      await syncScenarioTaskOrchestration(tx, {
        scenarioId: scenario.id,
        actorId: session.user.id,
      });

      await recordOpportunityAudit(tx, session.user.id, opportunity.id, `updated:${intent}`, {
        previousStatus: existing.status,
        nextStatus,
        priority: opportunity.priority,
      });
    });
  } catch (error) {
    redirectWithMessage("error", error instanceof Error ? error.message : "Failed to update opportunity.");
  }

  revalidatePath("/app");
  revalidatePath("/app/opportunities");
  redirectWithMessage("notice", "Opportunity updated.");
}
