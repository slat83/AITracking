import { PilotContactStatus, PilotInvoiceStatus, PilotStatus } from "@prisma/client";

import { mapInvoiceLifecycle } from "@/server/pilots/workflow";

export type PilotInvoiceLike = {
  id: string;
  invoiceNumber: string;
  status: PilotInvoiceStatus;
  amountCents: number;
  description: string;
  dueAt: Date | null;
  sentAt: Date | null;
  paidAt: Date | null;
  voidedAt: Date | null;
  issuedAt: Date | null;
};

export type PilotContactLike = {
  userId: string | null;
  email: string;
  isPrimary: boolean;
  status: PilotContactStatus;
  acceptedAt: Date | null;
};

export type PilotCommercialLike = {
  status: PilotStatus;
  workspaceId: string | null;
  deliveredAt: Date | null;
  primaryContactUserId: string | null;
  contacts: PilotContactLike[];
  invoices: PilotInvoiceLike[];
};

export type PilotCommercialEntitlementKey =
  | "FOUNDER_WORKSPACE"
  | "AUDIT_RESULTS"
  | "FOLLOW_UP";

export type PilotCommercialEntitlement = {
  key: PilotCommercialEntitlementKey;
  status: "PENDING" | "ACTIVE";
  source: "MANUAL_PILOT_POLICY";
};

export type PilotWorkspaceAccessDecision = {
  hasAccess: boolean;
  source: "MANUAL_PILOT_POLICY";
  reason: string;
};

export type PilotBillingSummary = {
  provider: "MANUAL";
  status: PilotInvoiceStatus | "NONE";
  openInvoiceCount: number;
  outstandingAmountCents: number;
  activeInvoice: (PilotInvoiceLike & { status: PilotInvoiceStatus }) | null;
};

export function resolvePilotInvoiceStatus(invoice: Pick<PilotInvoiceLike, "status" | "dueAt" | "paidAt" | "voidedAt">) {
  return mapInvoiceLifecycle({
    status: invoice.status,
    dueAt: invoice.dueAt,
    paidAt: invoice.paidAt,
    voidedAt: invoice.voidedAt,
  });
}

export function resolvePilotBillingSummary(pilot: Pick<PilotCommercialLike, "invoices">): PilotBillingSummary {
  const invoices = pilot.invoices.map((invoice) => ({
    ...invoice,
    status: resolvePilotInvoiceStatus(invoice),
  }));

  const openInvoices = invoices.filter(
    (invoice) => invoice.status !== PilotInvoiceStatus.PAID && invoice.status !== PilotInvoiceStatus.VOID,
  );

  const activeInvoice =
    openInvoices.sort((left, right) => compareInvoicePriority(left.status, right.status))[0] ?? null;

  let status: PilotBillingSummary["status"] = "NONE";
  if (activeInvoice) {
    status = activeInvoice.status;
  } else if (invoices.some((invoice) => invoice.status === PilotInvoiceStatus.PAID)) {
    status = PilotInvoiceStatus.PAID;
  } else if (invoices.some((invoice) => invoice.status === PilotInvoiceStatus.VOID)) {
    status = PilotInvoiceStatus.VOID;
  }

  return {
    provider: "MANUAL",
    status,
    openInvoiceCount: openInvoices.length,
    outstandingAmountCents: openInvoices.reduce((total, invoice) => total + invoice.amountCents, 0),
    activeInvoice,
  };
}

export function resolvePilotCommercialEntitlements(
  pilot: Pick<PilotCommercialLike, "contacts" | "status" | "workspaceId" | "deliveredAt">,
): PilotCommercialEntitlement[] {
  const hasAcceptedFounder = pilot.contacts.some(
    (contact) => contact.status === PilotContactStatus.ACTIVE && Boolean(contact.acceptedAt),
  );
  const hasDeliveryAccess =
    Boolean(pilot.deliveredAt)
    || pilot.status === PilotStatus.DELIVERY_READY
    || pilot.status === PilotStatus.DELIVERED
    || pilot.status === PilotStatus.FOLLOW_UP;

  return [
    {
      key: "FOUNDER_WORKSPACE",
      status: pilot.workspaceId && hasAcceptedFounder ? "ACTIVE" : "PENDING",
      source: "MANUAL_PILOT_POLICY",
    },
    {
      key: "AUDIT_RESULTS",
      status: hasDeliveryAccess ? "ACTIVE" : "PENDING",
      source: "MANUAL_PILOT_POLICY",
    },
    {
      key: "FOLLOW_UP",
      status: pilot.status === PilotStatus.FOLLOW_UP ? "ACTIVE" : "PENDING",
      source: "MANUAL_PILOT_POLICY",
    },
  ];
}

export function resolvePilotWorkspaceAccess(
  pilot: Pick<PilotCommercialLike, "contacts" | "primaryContactUserId" | "status" | "workspaceId">,
  userId: string,
): PilotWorkspaceAccessDecision {
  const contact = pilot.contacts.find((candidate) => candidate.userId === userId);

  if (!pilot.workspaceId) {
    return {
      hasAccess: false,
      source: "MANUAL_PILOT_POLICY",
      reason: "Workspace access is pending until the pilot workspace is provisioned.",
    };
  }

  if (!contact && pilot.primaryContactUserId !== userId) {
    return {
      hasAccess: false,
      source: "MANUAL_PILOT_POLICY",
      reason: "No founder contact is linked to this pilot for the signed-in user.",
    };
  }

  if (!contact || contact.status !== PilotContactStatus.ACTIVE || !contact.acceptedAt) {
    return {
      hasAccess: false,
      source: "MANUAL_PILOT_POLICY",
      reason: "The founder invite must be accepted before workspace access is granted.",
    };
  }

  if (pilot.status === PilotStatus.DECLINED) {
    return {
      hasAccess: false,
      source: "MANUAL_PILOT_POLICY",
      reason: "This pilot was declined, so the workspace entitlement is no longer active.",
    };
  }

  return {
    hasAccess: true,
    source: "MANUAL_PILOT_POLICY",
    reason: "Manual pilot policy grants workspace access to accepted founder contacts.",
  };
}

export function resolvePilotCommercialState(pilot: PilotCommercialLike, userId?: string) {
  return {
    billing: resolvePilotBillingSummary(pilot),
    entitlements: resolvePilotCommercialEntitlements(pilot),
    workspaceAccess: userId ? resolvePilotWorkspaceAccess(pilot, userId) : null,
  };
}

function compareInvoicePriority(left: PilotInvoiceStatus, right: PilotInvoiceStatus) {
  return getInvoicePriority(right) - getInvoicePriority(left);
}

function getInvoicePriority(status: PilotInvoiceStatus) {
  if (status === PilotInvoiceStatus.OVERDUE) {
    return 3;
  }

  if (status === PilotInvoiceStatus.SENT) {
    return 2;
  }

  if (status === PilotInvoiceStatus.DRAFT) {
    return 1;
  }

  return 0;
}
