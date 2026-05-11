import { PilotContactStatus, PilotInvoiceStatus, PilotStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  resolvePilotBillingSummary,
  resolvePilotCommercialEntitlements,
  resolvePilotWorkspaceAccess,
} from "@/server/pilots/commercial";

describe("pilot commercial seam", () => {
  it("promotes overdue invoices into the billing summary", () => {
    const summary = resolvePilotBillingSummary({
      invoices: [
        {
          id: "invoice_1",
          invoiceNumber: "FLW-20260510-001",
          status: PilotInvoiceStatus.SENT,
          amountCents: 150000,
          description: "Pilot invoice",
          dueAt: new Date("2026-05-01T00:00:00.000Z"),
          sentAt: new Date("2026-05-01T00:00:00.000Z"),
          paidAt: null,
          voidedAt: null,
          issuedAt: new Date("2026-04-28T00:00:00.000Z"),
        },
      ],
    });

    expect(summary.provider).toBe("MANUAL");
    expect(summary.status).toBe(PilotInvoiceStatus.OVERDUE);
    expect(summary.openInvoiceCount).toBe(1);
    expect(summary.outstandingAmountCents).toBe(150000);
  });

  it("derives manual entitlements from accepted pilot state", () => {
    const entitlements = resolvePilotCommercialEntitlements({
      workspaceId: "ws_1",
      status: PilotStatus.DELIVERED,
      deliveredAt: new Date("2026-05-10T00:00:00.000Z"),
      contacts: [
        {
          userId: "user_1",
          email: "founder@example.com",
          isPrimary: true,
          status: PilotContactStatus.ACTIVE,
          acceptedAt: new Date("2026-05-02T00:00:00.000Z"),
        },
      ],
    });

    expect(entitlements).toEqual([
      { key: "FOUNDER_WORKSPACE", status: "ACTIVE", source: "MANUAL_PILOT_POLICY" },
      { key: "AUDIT_RESULTS", status: "ACTIVE", source: "MANUAL_PILOT_POLICY" },
      { key: "FOLLOW_UP", status: "PENDING", source: "MANUAL_PILOT_POLICY" },
    ]);
  });

  it("denies workspace access before invite acceptance", () => {
    const decision = resolvePilotWorkspaceAccess(
      {
        workspaceId: "ws_1",
        primaryContactUserId: null,
        status: PilotStatus.INVITE_SENT,
        contacts: [
          {
            userId: "user_1",
            email: "founder@example.com",
            isPrimary: true,
            status: PilotContactStatus.INVITED,
            acceptedAt: null,
          },
        ],
      },
      "user_1",
    );

    expect(decision.hasAccess).toBe(false);
    expect(decision.reason).toContain("invite must be accepted");
  });
});
