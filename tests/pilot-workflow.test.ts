import { PilotInvoiceStatus, PilotStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  buildInvoiceNumber,
  buildPilotAccountSlug,
  buildPilotWorkspaceSlug,
  mapInviteAcceptanceStatus,
  mapInvoiceLifecycle,
  parseLineList,
  pilotOnboardingSchema,
} from "@/server/pilots/workflow";

describe("pilot workflow helpers", () => {
  it("parses line and comma separated values into a clean list", () => {
    expect(parseLineList(" Shopify , Amazon\nHelp center  \n")).toEqual([
      "Shopify",
      "Amazon",
      "Help center",
    ]);
  });

  it("builds stable workspace and account slugs from the brand", () => {
    expect(buildPilotWorkspaceSlug(" ACME & Co ")).toBe("acme-co-pilot");
    expect(buildPilotAccountSlug(" ACME & Co ")).toBe("acme-co-account");
  });

  it("promotes accepted invite states into onboarding", () => {
    expect(mapInviteAcceptanceStatus(PilotStatus.ACCEPTED_PENDING_INVITE)).toBe(
      PilotStatus.ONBOARDING_IN_PROGRESS,
    );
    expect(mapInviteAcceptanceStatus(PilotStatus.INVITE_SENT)).toBe(PilotStatus.ONBOARDING_IN_PROGRESS);
    expect(mapInviteAcceptanceStatus(PilotStatus.WAITING_ON_FOUNDER)).toBe(PilotStatus.WAITING_ON_FOUNDER);
  });

  it("marks sent invoices overdue after the due date", () => {
    expect(
      mapInvoiceLifecycle({
        status: PilotInvoiceStatus.SENT,
        dueAt: new Date("2026-05-01T00:00:00.000Z"),
        paidAt: null,
        voidedAt: null,
        now: new Date("2026-05-10T00:00:00.000Z"),
      }),
    ).toBe(PilotInvoiceStatus.OVERDUE);
  });

  it("keeps onboarding validation aligned with the founder checklist", () => {
    const result = pilotOnboardingSchema.safeParse({
      brandName: "Northstar Goods",
      websiteUrl: "https://northstar.example",
      storePlatform: "Shopify",
      targetGeography: "US",
      prioritySurfaces: ["Category pages", "Trust pages"],
      topCompetitors: ["Competitor A"],
      businessQuestion: "Why are we invisible for non-brand category demand?",
      supportingContext: "Major summer launch in three weeks.",
    });

    expect(result.success).toBe(true);
  });

  it("stamps invoice numbers with date and sequence", () => {
    expect(buildInvoiceNumber(7, new Date("2026-05-10T00:00:00.000Z"))).toBe("FLW-20260510-007");
  });
});
