import { PilotStatus } from "@prisma/client";

import { AppShellNav } from "@/components/app-shell-nav";
import { requireUser } from "@/server/auth";
import { prisma } from "@/server/db/client";
import { resolvePilotCommercialState, resolvePilotInvoiceStatus } from "@/server/pilots/commercial";
import { formatEnumLabel } from "@/server/pilots/workflow";

import {
  createPilotAction,
  createPilotInvoiceAction,
  updatePilotAction,
  updatePilotInvoiceAction,
} from "./actions";

export const runtime = "nodejs";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getMessage(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDateInput(value: Date | null | undefined) {
  if (!value) {
    return "";
  }

  return value.toISOString().slice(0, 10);
}

function formatDate(value: Date | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return value.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export default async function PilotsPage({ searchParams }: PageProps) {
  const session = await requireUser("EDITOR");
  const params = (await searchParams) ?? {};
  const error = getMessage(params.error);
  const notice = getMessage(params.notice);
  const invite = getMessage(params.invite);

  const pilots = await prisma.pilot.findMany({
    include: {
      contacts: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      },
      invites: {
        where: {
          acceptedAt: null,
        },
        orderBy: [{ sentAt: "desc" }],
        take: 1,
      },
      invoices: {
        orderBy: [{ createdAt: "desc" }],
      },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });

  const grouped = Object.values(PilotStatus).map((status) => ({
    status,
    items: pilots.filter((pilot) => pilot.status === status),
  }));

  return (
    <main className="shell dashboard workflowPage">
      <header className="topbar">
        <div className="topbarInner">
          <div>
            <div className="eyebrow">Pilot operations</div>
            <h1 style={{ fontSize: "2.5rem", margin: "12px 0 0" }}>Provisioning and manual invoicing</h1>
            <p className="muted" style={{ marginTop: 10, maxWidth: 760 }}>
              Create founder-led pilot records, provision invite-only workspaces, track honest
              service state, and manage manual invoices without touching the database directly.
            </p>
          </div>
          <div className="stack" style={{ justifyItems: "end" }}>
            <div className="pill">{session.user.role}</div>
          </div>
        </div>
        <AppShellNav activeKey="pilots" />
      </header>

      <section className="statsGrid dashboardHeader">
        <article className="card dashboardCard">
          <p className="muted">Pilots</p>
          <p className="statValue">{pilots.length}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Awaiting invite</p>
          <p className="statValue">
            {pilots.filter((pilot) => pilot.status === PilotStatus.ACCEPTED_PENDING_INVITE).length}
          </p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Waiting on founder</p>
          <p className="statValue">
            {pilots.filter((pilot) => pilot.status === PilotStatus.WAITING_ON_FOUNDER).length}
          </p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Manual invoices</p>
          <p className="statValue">{pilots.reduce((total, pilot) => total + pilot.invoices.length, 0)}</p>
        </article>
      </section>

      {error ? (
        <section className="card dashboardCard workflowMessage workflowMessageError">{error}</section>
      ) : null}
      {notice ? (
        <section className="card dashboardCard workflowMessage workflowMessageNotice">
          <p style={{ margin: 0 }}>{notice}</p>
          {invite ? (
            <p style={{ margin: "8px 0 0" }}>
              Invite link: <code>{invite}</code>
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="card dashboardCard workflowSection">
        <div className="workflowSectionHeader">
          <div>
            <h2>Capture pilot request</h2>
            <p className="muted" style={{ marginTop: 8 }}>
              This is the internal intake surface for the first founder-led pilot cohort.
            </p>
          </div>
        </div>
        <form action={createPilotAction} className="stack">
          <div className="workflowFormGrid">
            <label className="field">
              <span>Brand name</span>
              <input name="brandName" required />
            </label>
            <label className="field">
              <span>Website URL</span>
              <input name="websiteUrl" placeholder="https://brand.com" required />
            </label>
            <label className="field">
              <span>Primary contact</span>
              <input name="primaryContactName" required />
            </label>
            <label className="field">
              <span>Contact email</span>
              <input name="primaryContactEmail" type="email" required />
            </label>
            <label className="field">
              <span>Role</span>
              <input name="primaryContactRole" placeholder="Founder, CEO, Head of Growth" />
            </label>
            <label className="field">
              <span>Store platform</span>
              <input name="storePlatform" placeholder="Shopify, WooCommerce" />
            </label>
            <label className="field">
              <span>Product category</span>
              <input name="productCategory" />
            </label>
            <label className="field">
              <span>Monthly revenue band</span>
              <input name="monthlyRevenueBand" placeholder="$50k-$250k" />
            </label>
            <label className="field">
              <span>Target geography</span>
              <input name="targetGeography" placeholder="US, UK, EU" />
            </label>
            <label className="field workflowFieldSpan2">
              <span>Top competitors</span>
              <textarea name="topCompetitors" rows={2} placeholder="One per line or comma-separated" />
            </label>
            <label className="field workflowFieldSpan2">
              <span>Primary business question</span>
              <textarea name="businessQuestion" rows={2} required />
            </label>
            <label className="field workflowFieldSpan2">
              <span>Urgency or launch notes</span>
              <textarea name="urgencyNotes" rows={2} />
            </label>
          </div>
          <div className="buttonRow">
            <button className="button buttonPrimary" type="submit">
              Capture pilot
            </button>
          </div>
        </form>
      </section>

      <section className="stack">
        {grouped.map((group) => (
          <section className="card dashboardCard workflowSection" key={group.status}>
            <div className="workflowSectionHeader">
              <div>
                <h2>{formatEnumLabel(group.status)}</h2>
                <p className="muted" style={{ marginTop: 8 }}>
                  {group.items.length} pilot{group.items.length === 1 ? "" : "s"} in this state.
                </p>
              </div>
            </div>
            {group.items.length === 0 ? (
              <p className="muted">No pilots in this state.</p>
            ) : (
              <div className="stack">
                {group.items.map((pilot) => {
                  const primaryContact = pilot.contacts.find((contact) => contact.isPrimary) ?? pilot.contacts[0];
                  const commercial = resolvePilotCommercialState(pilot);
                  const workspaceEntitlement = commercial.entitlements.find(
                    (entitlement) => entitlement.key === "FOUNDER_WORKSPACE",
                  );

                  return (
                    <article className="workflowOpportunityCard" key={pilot.id}>
                      <div className="workflowOpportunityHeader">
                        <div>
                          <h3 style={{ margin: 0 }}>{pilot.brandName}</h3>
                          <p className="muted" style={{ marginTop: 8 }}>
                            {pilot.primaryContactName} · {pilot.primaryContactEmail}
                          </p>
                        </div>
                        <div className="workflowPillRow">
                          <span className="pill">{formatEnumLabel(pilot.status)}</span>
                          <span className="pill">{pilot.workspaceId ? "Workspace ready" : "Not provisioned"}</span>
                          <span className="pill">
                            {workspaceEntitlement ? `Workspace ${workspaceEntitlement.status.toLowerCase()}` : "Workspace pending"}
                          </span>
                          <span className="pill">
                            Billing {commercial.billing.status === "NONE" ? "none" : formatEnumLabel(commercial.billing.status).toLowerCase()}
                          </span>
                        </div>
                      </div>

                      <div className="workflowScenarioGrid">
                        <article className="workflowScenarioCard">
                          <span className="metaLabel">Current founder ask</span>
                          <p className="metaValue">{pilot.currentRequest ?? "No open founder request."}</p>
                        </article>
                        <article className="workflowScenarioCard">
                          <span className="metaLabel">Next milestone</span>
                          <p className="metaValue">{formatDate(pilot.targetDeliveryDate)}</p>
                        </article>
                        <article className="workflowScenarioCard">
                          <span className="metaLabel">Latest invite</span>
                          <p className="metaValue">{primaryContact?.lastInviteSentAt ? formatDate(primaryContact.lastInviteSentAt) : "Not sent"}</p>
                        </article>
                        <article className="workflowScenarioCard">
                          <span className="metaLabel">Commercial seam</span>
                          <p className="metaValue">
                            {commercial.billing.provider} billing · {workspaceEntitlement?.source ?? "Manual pilot policy"}
                          </p>
                        </article>
                      </div>

                      <form action={updatePilotAction} className="stack" style={{ marginTop: 20 }}>
                        <input name="pilotId" type="hidden" value={pilot.id} />
                        <div className="workflowFormGrid">
                          <label className="field">
                            <span>Brand name</span>
                            <input defaultValue={pilot.brandName} name="brandName" required />
                          </label>
                          <label className="field">
                            <span>Website URL</span>
                            <input defaultValue={pilot.websiteUrl} name="websiteUrl" required />
                          </label>
                          <label className="field">
                            <span>Primary contact</span>
                            <input defaultValue={pilot.primaryContactName} name="primaryContactName" required />
                          </label>
                          <label className="field">
                            <span>Contact email</span>
                            <input defaultValue={pilot.primaryContactEmail} name="primaryContactEmail" type="email" required />
                          </label>
                          <label className="field">
                            <span>Role</span>
                            <input defaultValue={pilot.primaryContactRole ?? ""} name="primaryContactRole" />
                          </label>
                          <label className="field">
                            <span>Store platform</span>
                            <input defaultValue={pilot.storePlatform ?? ""} name="storePlatform" />
                          </label>
                          <label className="field">
                            <span>Product category</span>
                            <input defaultValue={pilot.productCategory ?? ""} name="productCategory" />
                          </label>
                          <label className="field">
                            <span>Monthly revenue band</span>
                            <input defaultValue={pilot.monthlyRevenueBand ?? ""} name="monthlyRevenueBand" />
                          </label>
                          <label className="field">
                            <span>Target geography</span>
                            <input defaultValue={pilot.targetGeography ?? ""} name="targetGeography" />
                          </label>
                          <label className="field">
                            <span>Target delivery date</span>
                            <input defaultValue={formatDateInput(pilot.targetDeliveryDate)} name="targetDeliveryDate" type="date" />
                          </label>
                          <label className="field workflowFieldSpan2">
                            <span>Top competitors</span>
                            <textarea defaultValue={pilot.topCompetitors.join("\n")} name="topCompetitors" rows={2} />
                          </label>
                          <label className="field workflowFieldSpan2">
                            <span>Priority surfaces</span>
                            <textarea defaultValue={pilot.prioritySurfaces.join("\n")} name="prioritySurfaces" rows={2} />
                          </label>
                          <label className="field workflowFieldSpan2">
                            <span>Primary business question</span>
                            <textarea defaultValue={pilot.businessQuestion} name="businessQuestion" rows={2} required />
                          </label>
                          <label className="field workflowFieldSpan2">
                            <span>Urgency notes</span>
                            <textarea defaultValue={pilot.urgencyNotes ?? ""} name="urgencyNotes" rows={2} />
                          </label>
                          <label className="field workflowFieldSpan2">
                            <span>Review notes</span>
                            <textarea defaultValue={pilot.reviewNotes ?? ""} name="reviewNotes" rows={2} />
                          </label>
                          <label className="field workflowFieldSpan2">
                            <span>Clarification request</span>
                            <textarea defaultValue={pilot.clarificationRequest ?? ""} name="clarificationRequest" rows={2} />
                          </label>
                          <label className="field workflowFieldSpan2">
                            <span>Current founder request</span>
                            <textarea defaultValue={pilot.currentRequest ?? ""} name="currentRequest" rows={2} />
                          </label>
                          <label className="field workflowFieldSpan2">
                            <span>Current stage note</span>
                            <textarea defaultValue={pilot.currentStageNote ?? ""} name="currentStageNote" rows={2} />
                          </label>
                          <label className="field workflowFieldSpan2">
                            <span>Supporting context</span>
                            <textarea defaultValue={pilot.supportingContext ?? ""} name="supportingContext" rows={2} />
                          </label>
                          <label className="field workflowFieldSpan2">
                            <span>Findings summary</span>
                            <textarea defaultValue={pilot.findingsSummary ?? ""} name="findingsSummary" rows={4} />
                          </label>
                          <label className="field workflowFieldSpan2">
                            <span>30-day action plan</span>
                            <textarea defaultValue={pilot.actionPlan ?? ""} name="actionPlan" rows={4} />
                          </label>
                          <label className="field workflowFieldSpan2">
                            <span>Delivery notes</span>
                            <textarea defaultValue={pilot.deliveryNotes ?? ""} name="deliveryNotes" rows={2} />
                          </label>
                          <label className="field workflowFieldSpan2">
                            <span>Pause reason</span>
                            <textarea defaultValue={pilot.pauseReason ?? ""} name="pauseReason" rows={2} />
                          </label>
                        </div>

                        <div className="buttonRow">
                          <button className="button buttonSecondary" name="intent" type="submit" value="save">
                            Save details
                          </button>
                          {!pilot.workspaceId ? (
                            <button className="button buttonPrimary" name="intent" type="submit" value="provision">
                              Provision workspace
                            </button>
                          ) : null}
                          {pilot.workspaceId ? (
                            <button className="button buttonSecondary" name="intent" type="submit" value="send-invite">
                              Send or resend invite
                            </button>
                          ) : null}
                          <button className="button buttonSecondary" name="intent" type="submit" value="request-clarification">
                            Request clarification
                          </button>
                          <button className="button buttonSecondary" name="intent" type="submit" value="mark-onboarding">
                            Mark onboarding
                          </button>
                          <button className="button buttonSecondary" name="intent" type="submit" value="mark-ready">
                            Mark ready
                          </button>
                          <button className="button buttonSecondary" name="intent" type="submit" value="mark-audit">
                            Mark audit in progress
                          </button>
                          <button className="button buttonSecondary" name="intent" type="submit" value="mark-waiting">
                            Mark waiting on founder
                          </button>
                          <button className="button buttonSecondary" name="intent" type="submit" value="mark-delivery-ready">
                            Mark delivery ready
                          </button>
                          <button className="button buttonPrimary" name="intent" type="submit" value="mark-delivered">
                            Mark delivered
                          </button>
                          <button className="button buttonSecondary" name="intent" type="submit" value="mark-follow-up">
                            Move to follow-up
                          </button>
                          <button className="button buttonSecondary" name="intent" type="submit" value="pause">
                            Pause
                          </button>
                          <button className="button buttonSecondary" name="intent" type="submit" value="decline">
                            Decline
                          </button>
                        </div>
                      </form>

                      <section className="workflowScenarioSummary">
                        <div className="workflowScenarioSummaryHeader">
                          <div>
                            <div className="eyebrow">Manual invoices</div>
                            <strong>Commercial controls for this pilot</strong>
                          </div>
                        </div>
                        <div className="stack">
                          <article className="workflowScenarioCard">
                            <div className="workflowScenarioSummaryHeader">
                              <strong>Derived commercial state</strong>
                              <span className="pill">{commercial.billing.provider}</span>
                            </div>
                            <p className="muted" style={{ margin: "12px 0 0" }}>
                              Billing status {commercial.billing.status === "NONE" ? "not started" : formatEnumLabel(commercial.billing.status).toLowerCase()}
                              {" · "}
                              {commercial.billing.openInvoiceCount} open invoice{commercial.billing.openInvoiceCount === 1 ? "" : "s"}
                              {" · "}
                              ${ (commercial.billing.outstandingAmountCents / 100).toFixed(2) } outstanding
                            </p>
                            <p className="muted" style={{ margin: "8px 0 0" }}>
                              Workspace entitlement {workspaceEntitlement?.status.toLowerCase() ?? "pending"} via manual pilot policy.
                            </p>
                          </article>

                          <form action={createPilotInvoiceAction} className="stack">
                            <input name="pilotId" type="hidden" value={pilot.id} />
                            <div className="workflowFormGrid">
                              <label className="field">
                                <span>Amount (USD)</span>
                                <input min="0" name="amountDollars" placeholder="1500" step="0.01" type="number" required />
                              </label>
                              <label className="field">
                                <span>Due date</span>
                                <input name="dueDate" type="date" required />
                              </label>
                              <label className="field workflowFieldSpan2">
                                <span>Description</span>
                                <input name="description" placeholder="Founder-led AI Visibility Audit" required />
                              </label>
                              <label className="field workflowFieldSpan2">
                                <span>Notes</span>
                                <textarea name="notes" rows={2} />
                              </label>
                            </div>
                            <div className="buttonRow">
                              <button className="button buttonSecondary" type="submit">
                                Create invoice draft
                              </button>
                            </div>
                          </form>

                          {pilot.invoices.map((invoice) => {
                            const invoiceStatus = resolvePilotInvoiceStatus(invoice);

                            return (
                              <form action={updatePilotInvoiceAction} className="workflowScenarioCard" key={invoice.id}>
                                <input name="invoiceId" type="hidden" value={invoice.id} />
                                <div className="workflowScenarioSummaryHeader">
                                  <strong>{invoice.invoiceNumber}</strong>
                                  <span className="pill">{formatEnumLabel(invoiceStatus)}</span>
                                </div>
                                <div className="workflowFormGrid" style={{ marginTop: 16 }}>
                                  <label className="field">
                                    <span>Amount (USD)</span>
                                    <input defaultValue={(invoice.amountCents / 100).toFixed(2)} name="amountDollars" step="0.01" type="number" />
                                  </label>
                                  <label className="field">
                                    <span>Due date</span>
                                    <input defaultValue={formatDateInput(invoice.dueAt)} name="dueDate" type="date" />
                                  </label>
                                  <label className="field workflowFieldSpan2">
                                    <span>Description</span>
                                    <input defaultValue={invoice.description} name="description" />
                                  </label>
                                  <label className="field workflowFieldSpan2">
                                    <span>Notes</span>
                                    <textarea defaultValue={invoice.notes ?? ""} name="notes" rows={2} />
                                  </label>
                                </div>
                                <p className="muted" style={{ margin: "12px 0 0" }}>
                                  Issued {formatDate(invoice.issuedAt)} · Sent {formatDate(invoice.sentAt)} · Paid {formatDate(invoice.paidAt)}
                                </p>
                                <div className="buttonRow">
                                  <button className="button buttonSecondary" name="intent" type="submit" value="save">
                                    Save
                                  </button>
                                  <button className="button buttonSecondary" name="intent" type="submit" value="send">
                                    Mark sent
                                  </button>
                                  <button className="button buttonPrimary" name="intent" type="submit" value="mark-paid">
                                    Mark paid
                                  </button>
                                  <button className="button buttonSecondary" name="intent" type="submit" value="void">
                                    Void
                                  </button>
                                </div>
                              </form>
                            );
                          })}
                        </div>
                      </section>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </section>
    </main>
  );
}
