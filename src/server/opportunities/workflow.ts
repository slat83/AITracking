import { OpportunityPriority, OpportunityStatus } from "@prisma/client";
import { z } from "zod";

const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().optional());

const requiredTrimmedString = (label: string) =>
  z.preprocess((value) => (typeof value === "string" ? value.trim() : value), z.string().min(1, `${label} is required.`));

export const opportunityIntakeSchema = z.object({
  title: requiredTrimmedString("Title"),
  summary: requiredTrimmedString("Summary"),
  sourceName: requiredTrimmedString("Source"),
  sourceUrl: optionalTrimmedString,
  scenario: requiredTrimmedString("Priority scenario"),
  whyNow: requiredTrimmedString("Why it matters now"),
  suggestedAssetAngle: requiredTrimmedString("Suggested asset or distribution angle"),
  priority: z.nativeEnum(OpportunityPriority),
  ownerId: requiredTrimmedString("Owner"),
  tags: z.array(z.string()).default([]),
  capturedAt: z.date().default(() => new Date()),
});

export const opportunityBriefSchema = z.object({
  briefAudience: requiredTrimmedString("Target audience"),
  briefQuestion: requiredTrimmedString("Target question"),
  assetType: requiredTrimmedString("Asset type"),
  proofRequirement: requiredTrimmedString("Key evidence or proof requirement"),
  targetCta: requiredTrimmedString("Target CTA"),
  dueDate: z.date({
    error: "Due date is required.",
  }),
});

export type OpportunityIntakeInput = z.infer<typeof opportunityIntakeSchema>;
export type OpportunityBriefInput = z.infer<typeof opportunityBriefSchema>;

export function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function parseDateInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = new Date(`${trimmed}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function validateOpportunityReadyForDraft(input: Record<string, unknown>) {
  return opportunityBriefSchema.safeParse(input);
}

export function canTransitionOpportunity(status: OpportunityStatus, intent: string) {
  if (intent === "save") {
    return true;
  }

  if (intent === "start-triage") {
    return status === OpportunityStatus.INTAKE;
  }

  if (intent === "ready") {
    return status === OpportunityStatus.INTAKE || status === OpportunityStatus.TRIAGE;
  }

  if (intent === "reject") {
    return status === OpportunityStatus.INTAKE || status === OpportunityStatus.TRIAGE;
  }

  if (intent === "archive") {
    return status !== OpportunityStatus.ARCHIVED;
  }

  return false;
}
