import { PilotInvoiceStatus, PilotStatus } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { z } from "zod";

import { normalizeEmail } from "@/server/auth/credentials";

const nonEmptyTrimmed = z.string().trim().min(1);

export const pilotIntakeSchema = z.object({
  brandName: nonEmptyTrimmed,
  websiteUrl: z.url().or(nonEmptyTrimmed),
  primaryContactName: nonEmptyTrimmed,
  primaryContactEmail: z.email().transform(normalizeEmail),
  primaryContactRole: z.string().trim().optional().transform(emptyToUndefined),
  storePlatform: z.string().trim().optional().transform(emptyToUndefined),
  productCategory: z.string().trim().optional().transform(emptyToUndefined),
  monthlyRevenueBand: z.string().trim().optional().transform(emptyToUndefined),
  targetGeography: z.string().trim().optional().transform(emptyToUndefined),
  topCompetitors: z.array(nonEmptyTrimmed).default([]),
  businessQuestion: nonEmptyTrimmed,
  urgencyNotes: z.string().trim().optional().transform(emptyToUndefined),
});

export const pilotOnboardingSchema = z.object({
  brandName: nonEmptyTrimmed,
  websiteUrl: z.url().or(nonEmptyTrimmed),
  storePlatform: z.string().trim().optional().transform(emptyToUndefined),
  targetGeography: z.string().trim().optional().transform(emptyToUndefined),
  prioritySurfaces: z.array(nonEmptyTrimmed).min(1, "Add at least one priority surface."),
  topCompetitors: z.array(nonEmptyTrimmed).min(1, "Add at least one competitor or substitute."),
  businessQuestion: nonEmptyTrimmed,
  supportingContext: z.string().trim().optional().transform(emptyToUndefined),
});

export const pilotInvoiceSchema = z.object({
  amountDollars: z.coerce.number().positive("Invoice amount must be greater than zero."),
  description: nonEmptyTrimmed,
  dueDate: z.string().trim().min(1, "Due date is required."),
  notes: z.string().trim().optional().transform(emptyToUndefined),
});

export function emptyToUndefined(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function parseLineList(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function slugifySegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function buildPilotWorkspaceSlug(brandName: string) {
  return `${slugifySegment(brandName) || "pilot"}-pilot`;
}

export function buildPilotAccountSlug(brandName: string) {
  return `${slugifySegment(brandName) || "brand"}-account`;
}

export function buildInviteToken() {
  return randomBytes(24).toString("hex");
}

export function buildInvoiceNumber(sequence: number, now = new Date()) {
  const stamp = now.toISOString().slice(0, 10).replace(/-/g, "");
  return `FLW-${stamp}-${String(sequence).padStart(3, "0")}`;
}

export function mapInviteAcceptanceStatus(current: PilotStatus) {
  if (current === PilotStatus.ACCEPTED_PENDING_INVITE || current === PilotStatus.INVITE_SENT) {
    return PilotStatus.ONBOARDING_IN_PROGRESS;
  }

  return current;
}

export function mapInvoiceLifecycle(input: {
  status: PilotInvoiceStatus;
  dueAt: Date | null;
  paidAt: Date | null;
  voidedAt: Date | null;
  now?: Date;
}) {
  if (input.paidAt) {
    return PilotInvoiceStatus.PAID;
  }

  if (input.voidedAt) {
    return PilotInvoiceStatus.VOID;
  }

  if (input.status === PilotInvoiceStatus.SENT && input.dueAt && input.dueAt.getTime() < (input.now ?? new Date()).getTime()) {
    return PilotInvoiceStatus.OVERDUE;
  }

  return input.status;
}
