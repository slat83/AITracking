"use server";

import { PilotContactStatus, PilotInvoiceStatus, PilotStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/server/auth";
import { normalizeEmail } from "@/server/auth/credentials";
import { prisma } from "@/server/db/client";
import {
  buildInviteToken,
  buildInvoiceNumber,
  buildPilotAccountSlug,
  buildPilotWorkspaceSlug,
  emptyToUndefined,
  formatEnumLabel,
  mapInvoiceLifecycle,
  parseLineList,
  pilotIntakeSchema,
  pilotInvoiceSchema,
} from "@/server/pilots/workflow";

function redirectWithMessage(
  kind: "error" | "notice",
  message: string,
  extras?: Record<string, string>,
): never {
  const params = new URLSearchParams({ [kind]: message, ...(extras ?? {}) });
  redirect(`/app/pilots?${params.toString()}`);
}

async function recordPilotAudit(
  db: Pick<typeof prisma, "auditEvent">,
  actorId: string,
  entityId: string,
  action: string,
  payload: Record<string, unknown>,
) {
  await db.auditEvent.create({
    data: {
      entityType: "Pilot",
      entityId,
      action,
      actorId,
      payload: payload as Prisma.InputJsonValue,
    },
  });
}

function parseOptionalDate(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return null;
  }

  const date = new Date(`${raw}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createPilotAction(formData: FormData) {
  const session = await requireUser("EDITOR");
  const parsed = pilotIntakeSchema.safeParse({
    brandName: formData.get("brandName"),
    websiteUrl: formData.get("websiteUrl"),
    primaryContactName: formData.get("primaryContactName"),
    primaryContactEmail: formData.get("primaryContactEmail"),
    primaryContactRole: formData.get("primaryContactRole"),
    storePlatform: formData.get("storePlatform"),
    productCategory: formData.get("productCategory"),
    monthlyRevenueBand: formData.get("monthlyRevenueBand"),
    targetGeography: formData.get("targetGeography"),
    topCompetitors: parseLineList(String(formData.get("topCompetitors") ?? "")),
    businessQuestion: formData.get("businessQuestion"),
    urgencyNotes: formData.get("urgencyNotes"),
  });

  if (!parsed.success) {
    redirectWithMessage("error", parsed.error.issues[0]?.message ?? "Pilot intake is incomplete.");
  }

  try {
    await prisma.$transaction(async (tx) => {
      const pilot = await tx.pilot.create({
        data: {
          ...parsed.data,
          status: PilotStatus.FIT_REVIEW,
          contacts: {
            create: {
              name: parsed.data.primaryContactName,
              email: parsed.data.primaryContactEmail,
              roleLabel: parsed.data.primaryContactRole ?? "Founder contact",
              isPrimary: true,
            },
          },
        },
      });

      await recordPilotAudit(tx, session.user.id, pilot.id, "created", {
        status: pilot.status,
        brandName: pilot.brandName,
      });
    });
  } catch (error) {
    redirectWithMessage("error", error instanceof Error ? error.message : "Failed to create pilot.");
  }

  revalidatePath("/app/pilots");
  redirectWithMessage("notice", "Pilot request captured.");
}

export async function updatePilotAction(formData: FormData) {
  const session = await requireUser("EDITOR");
  const pilotId = String(formData.get("pilotId") ?? "");
  const intent = String(formData.get("intent") ?? "");

  if (!pilotId || !intent) {
    redirectWithMessage("error", "Missing pilot action.");
  }

  const existing = await prisma.pilot.findUnique({
    where: { id: pilotId },
    include: {
      contacts: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      },
      invoices: {
        orderBy: [{ createdAt: "desc" }],
      },
    },
  });

  if (!existing) {
    redirectWithMessage("error", "Pilot not found.");
  }

  const updateData = {
    brandName: String(formData.get("brandName") ?? "").trim(),
    websiteUrl: String(formData.get("websiteUrl") ?? "").trim(),
    primaryContactName: String(formData.get("primaryContactName") ?? "").trim(),
    primaryContactEmail: normalizeEmail(String(formData.get("primaryContactEmail") ?? "")),
    primaryContactRole: emptyToUndefined(String(formData.get("primaryContactRole") ?? "")) ?? null,
    storePlatform: emptyToUndefined(String(formData.get("storePlatform") ?? "")) ?? null,
    productCategory: emptyToUndefined(String(formData.get("productCategory") ?? "")) ?? null,
    monthlyRevenueBand: emptyToUndefined(String(formData.get("monthlyRevenueBand") ?? "")) ?? null,
    targetGeography: emptyToUndefined(String(formData.get("targetGeography") ?? "")) ?? null,
    topCompetitors: parseLineList(String(formData.get("topCompetitors") ?? "")),
    businessQuestion: String(formData.get("businessQuestion") ?? "").trim(),
    urgencyNotes: emptyToUndefined(String(formData.get("urgencyNotes") ?? "")) ?? null,
    reviewNotes: emptyToUndefined(String(formData.get("reviewNotes") ?? "")) ?? null,
    clarificationRequest: emptyToUndefined(String(formData.get("clarificationRequest") ?? "")) ?? null,
    currentRequest: emptyToUndefined(String(formData.get("currentRequest") ?? "")) ?? null,
    currentStageNote: emptyToUndefined(String(formData.get("currentStageNote") ?? "")) ?? null,
    prioritySurfaces: parseLineList(String(formData.get("prioritySurfaces") ?? "")),
    supportingContext: emptyToUndefined(String(formData.get("supportingContext") ?? "")) ?? null,
    findingsSummary: emptyToUndefined(String(formData.get("findingsSummary") ?? "")) ?? null,
    actionPlan: emptyToUndefined(String(formData.get("actionPlan") ?? "")) ?? null,
    deliveryNotes: emptyToUndefined(String(formData.get("deliveryNotes") ?? "")) ?? null,
    pauseReason: emptyToUndefined(String(formData.get("pauseReason") ?? "")) ?? null,
    targetDeliveryDate: parseOptionalDate(formData.get("targetDeliveryDate")),
  };

  const intakeCheck = pilotIntakeSchema.safeParse({
    brandName: updateData.brandName,
    websiteUrl: updateData.websiteUrl,
    primaryContactName: updateData.primaryContactName,
    primaryContactEmail: updateData.primaryContactEmail,
    primaryContactRole: updateData.primaryContactRole ?? undefined,
    storePlatform: updateData.storePlatform ?? undefined,
    productCategory: updateData.productCategory ?? undefined,
    monthlyRevenueBand: updateData.monthlyRevenueBand ?? undefined,
    targetGeography: updateData.targetGeography ?? undefined,
    topCompetitors: updateData.topCompetitors,
    businessQuestion: updateData.businessQuestion,
    urgencyNotes: updateData.urgencyNotes ?? undefined,
  });

  if (!intakeCheck.success) {
    redirectWithMessage("error", intakeCheck.error.issues[0]?.message ?? "Pilot intake is incomplete.");
  }

  let nextStatus = existing.status;
  let inviteUrl: string | undefined;

  try {
    await prisma.$transaction(async (tx) => {
      if (intent === "provision") {
        const workspaceSlug = `${buildPilotWorkspaceSlug(existing.brandName)}-${existing.id.slice(-6)}`;
        const accountSlug = `${buildPilotAccountSlug(existing.brandName)}-${existing.id.slice(-6)}`;
        const workspace = await tx.workspace.create({
          data: {
            name: `${updateData.brandName} Workspace`,
            slug: workspaceSlug,
          },
        });

        const account = await tx.account.create({
          data: {
            workspaceId: workspace.id,
            name: updateData.brandName,
            slug: accountSlug,
          },
        });

        nextStatus = PilotStatus.ACCEPTED_PENDING_INVITE;
        await tx.pilot.update({
          where: { id: pilotId },
          data: {
            ...updateData,
            status: nextStatus,
            acceptedAt: existing.acceptedAt ?? new Date(),
            workspaceId: workspace.id,
            accountId: account.id,
          },
        });
      } else if (intent === "send-invite") {
        const primaryContact = existing.contacts.find((contact) => contact.isPrimary) ?? existing.contacts[0];
        if (!primaryContact) {
          throw new Error("Provision the primary contact before sending an invite.");
        }

        if (!existing.workspaceId || !existing.accountId) {
          throw new Error("Provision the workspace before sending an invite.");
        }

        const token = buildInviteToken();
        await tx.pilotInvite.create({
          data: {
            pilotId,
            contactId: primaryContact.id,
            token,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          },
        });

        await tx.pilotContact.update({
          where: { id: primaryContact.id },
          data: {
            invitedAt: new Date(),
            lastInviteSentAt: new Date(),
            status: PilotContactStatus.INVITED,
          },
        });

        nextStatus = PilotStatus.INVITE_SENT;
        await tx.pilot.update({
          where: { id: pilotId },
          data: {
            ...updateData,
            status: nextStatus,
            invitedAt: new Date(),
          },
        });

        inviteUrl = `/invite/${token}`;
      } else {
        if (intent === "request-clarification") {
          nextStatus = PilotStatus.FIT_REVIEW;
        } else if (intent === "accept") {
          nextStatus = PilotStatus.ACCEPTED_PENDING_INVITE;
        } else if (intent === "mark-onboarding") {
          nextStatus = PilotStatus.ONBOARDING_IN_PROGRESS;
        } else if (intent === "mark-ready") {
          nextStatus = PilotStatus.READY_FOR_AUDIT;
        } else if (intent === "mark-audit") {
          nextStatus = PilotStatus.AUDIT_IN_PROGRESS;
        } else if (intent === "mark-waiting") {
          nextStatus = PilotStatus.WAITING_ON_FOUNDER;
        } else if (intent === "mark-delivery-ready") {
          nextStatus = PilotStatus.DELIVERY_READY;
        } else if (intent === "mark-delivered") {
          nextStatus = PilotStatus.DELIVERED;
        } else if (intent === "mark-follow-up") {
          nextStatus = PilotStatus.FOLLOW_UP;
        } else if (intent === "decline") {
          nextStatus = PilotStatus.DECLINED;
        } else if (intent === "pause") {
          nextStatus = PilotStatus.PAUSED;
        }

        await tx.pilot.update({
          where: { id: pilotId },
          data: {
            ...updateData,
            status: nextStatus,
            acceptedAt: nextStatus === PilotStatus.ACCEPTED_PENDING_INVITE ? (existing.acceptedAt ?? new Date()) : existing.acceptedAt,
            declinedAt: nextStatus === PilotStatus.DECLINED ? new Date() : existing.declinedAt,
            pausedAt: nextStatus === PilotStatus.PAUSED ? new Date() : null,
            deliveredAt: nextStatus === PilotStatus.DELIVERED ? new Date() : existing.deliveredAt,
          },
        });
      }

      await tx.pilotContact.upsert({
        where: {
          pilotId_email: {
            pilotId,
            email: updateData.primaryContactEmail,
          },
        },
        update: {
          name: updateData.primaryContactName,
          roleLabel: updateData.primaryContactRole ?? "Founder contact",
          isPrimary: true,
        },
        create: {
          pilotId,
          name: updateData.primaryContactName,
          email: updateData.primaryContactEmail,
          roleLabel: updateData.primaryContactRole ?? "Founder contact",
          isPrimary: true,
        },
      });

      await recordPilotAudit(tx, session.user.id, pilotId, `updated:${intent}`, {
        previousStatus: existing.status,
        nextStatus,
      });
    });
  } catch (error) {
    redirectWithMessage("error", error instanceof Error ? error.message : "Failed to update pilot.");
  }

  revalidatePath("/app");
  revalidatePath("/app/pilots");
  redirectWithMessage(
    "notice",
    inviteUrl
      ? `Invite prepared for ${updateData.primaryContactEmail}.`
      : `Pilot moved to ${formatEnumLabel(nextStatus)}.`,
    inviteUrl ? { invite: inviteUrl } : undefined,
  );
}

export async function createPilotInvoiceAction(formData: FormData) {
  const session = await requireUser("EDITOR");
  const pilotId = String(formData.get("pilotId") ?? "");

  if (!pilotId) {
    redirectWithMessage("error", "Missing pilot for invoice.");
  }

  const parsed = pilotInvoiceSchema.safeParse({
    amountDollars: formData.get("amountDollars"),
    description: formData.get("description"),
    dueDate: formData.get("dueDate"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    redirectWithMessage("error", parsed.error.issues[0]?.message ?? "Invoice details are incomplete.");
  }

  try {
    await prisma.$transaction(async (tx) => {
      const invoiceCount = await tx.pilotInvoice.count();
      const dueAt = parseOptionalDate(parsed.data.dueDate);

      const invoice = await tx.pilotInvoice.create({
        data: {
          pilotId,
          invoiceNumber: buildInvoiceNumber(invoiceCount + 1),
          amountCents: Math.round(parsed.data.amountDollars * 100),
          description: parsed.data.description,
          notes: parsed.data.notes ?? null,
          dueAt,
          issuedAt: new Date(),
        },
      });

      await recordPilotAudit(tx, session.user.id, pilotId, "invoice_created", {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
      });
    });
  } catch (error) {
    redirectWithMessage("error", error instanceof Error ? error.message : "Failed to create invoice.");
  }

  revalidatePath("/app/pilots");
  redirectWithMessage("notice", "Manual invoice draft created.");
}

export async function updatePilotInvoiceAction(formData: FormData) {
  const session = await requireUser("EDITOR");
  const invoiceId = String(formData.get("invoiceId") ?? "");
  const intent = String(formData.get("intent") ?? "");

  if (!invoiceId || !intent) {
    redirectWithMessage("error", "Missing invoice action.");
  }

  const existing = await prisma.pilotInvoice.findUnique({
    where: { id: invoiceId },
  });

  if (!existing) {
    redirectWithMessage("error", "Invoice not found.");
  }

  try {
    await prisma.$transaction(async (tx) => {
      const next = {
        description: String(formData.get("description") ?? "").trim(),
        notes: emptyToUndefined(String(formData.get("notes") ?? "")) ?? null,
        amountCents: Math.round(Number(formData.get("amountDollars") ?? "0") * 100),
        dueAt: parseOptionalDate(formData.get("dueDate")),
        status: existing.status,
        sentAt: existing.sentAt,
        paidAt: existing.paidAt,
        voidedAt: existing.voidedAt,
      };

      if (intent === "send") {
        next.status = PilotInvoiceStatus.SENT;
        next.sentAt = new Date();
      } else if (intent === "mark-paid") {
        next.status = PilotInvoiceStatus.PAID;
        next.paidAt = new Date();
      } else if (intent === "void") {
        next.status = PilotInvoiceStatus.VOID;
        next.voidedAt = new Date();
      }

      next.status = mapInvoiceLifecycle({
        status: next.status,
        dueAt: next.dueAt,
        paidAt: next.paidAt,
        voidedAt: next.voidedAt,
      });

      await tx.pilotInvoice.update({
        where: { id: invoiceId },
        data: next,
      });

      await recordPilotAudit(tx, session.user.id, existing.pilotId, `invoice_updated:${intent}`, {
        invoiceId,
        previousStatus: existing.status,
        nextStatus: next.status,
      });
    });
  } catch (error) {
    redirectWithMessage("error", error instanceof Error ? error.message : "Failed to update invoice.");
  }

  revalidatePath("/app/pilots");
  redirectWithMessage("notice", "Invoice updated.");
}
