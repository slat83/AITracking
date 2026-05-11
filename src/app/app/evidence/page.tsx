import { ProofReadiness } from "@prisma/client";

import { AppShellNav } from "@/components/app-shell-nav";
import { requireUser } from "@/server/auth";
import { prisma } from "@/server/db/client";

export const runtime = "nodejs";

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: Date | null) {
  if (!value) {
    return "Not verified";
  }

  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function EvidencePage() {
  const session = await requireUser("VIEWER");
  const evidenceAssets = await prisma.evidenceAsset.findMany({
    orderBy: [{ readiness: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      proofAssetType: true,
      claimSupported: true,
      allowedUsage: true,
      restrictedChannels: true,
      readiness: true,
      lastVerifiedAt: true,
      scenarioType: {
        select: {
          name: true,
        },
      },
      account: {
        select: {
          name: true,
        },
      },
      evidenceOwner: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          scenarioLinks: true,
          satisfiedRequirements: true,
        },
      },
    },
  });

  const readyCount = evidenceAssets.filter((asset) => asset.readiness === ProofReadiness.READY).length;
  const restrictedCount = evidenceAssets.filter(
    (asset) => asset.readiness === ProofReadiness.RESTRICTED,
  ).length;
  const needsWorkCount = evidenceAssets.filter(
    (asset) => asset.readiness === ProofReadiness.MISSING || asset.readiness === ProofReadiness.PARTIAL,
  ).length;

  return (
    <main className="shell dashboard workflowPage">
      <header className="topbar workspaceHeader">
        <div className="topbarInner workspaceHeaderInner">
          <div>
            <div className="eyebrow">Evidence</div>
            <h1 style={{ fontSize: "2.5rem", margin: "12px 0 0" }}>Proof library</h1>
            <p className="muted workspaceIntro">
              Reusable proof assets stay outside individual tasks so operators can see what is
              safe to reuse, what is restricted, and which scenarios still depend on missing proof.
            </p>
          </div>
          <div className="workspaceHeaderActions">
            <div className="pill">{session.user.role}</div>
          </div>
        </div>
        <AppShellNav activeKey="evidence" />
      </header>

      <section className="statsGrid dashboardHeader workspaceStats">
        <article className="card dashboardCard">
          <p className="muted">Assets in library</p>
          <p className="statValue">{evidenceAssets.length}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Ready to use</p>
          <p className="statValue">{readyCount}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Restricted</p>
          <p className="statValue">{restrictedCount}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Needs proof work</p>
          <p className="statValue">{needsWorkCount}</p>
        </article>
      </section>

      <section className="shellSection">
        <div className="shellSectionHeader">
          <div>
            <h2>Evidence assets</h2>
            <p className="muted" style={{ marginTop: 8 }}>
              Each asset shows readiness, usage scope, and where it is currently supporting live
              scenario work.
            </p>
          </div>
        </div>
        <div className="shellGrid">
          {evidenceAssets.map((asset) => (
            <article className="workspaceInlineCard" key={asset.id}>
              <div className="workspaceChecklistHeader">
                <strong>{asset.title}</strong>
                <span
                  className={`workspaceToneBadge ${
                    asset.readiness === ProofReadiness.READY
                      ? "workspaceToneBadgesuccess"
                      : asset.readiness === ProofReadiness.RESTRICTED
                        ? "workspaceToneBadgedanger"
                        : "workspaceToneBadgewarning"
                  }`}
                >
                  {formatEnumLabel(asset.readiness)}
                </span>
              </div>
              <p className="muted">
                {asset.proofAssetType} · {asset.scenarioType?.name ?? "Reusable across scenario types"}
              </p>
              <p>{asset.claimSupported}</p>
              <div className="workspaceQueueMeta">
                <span>Owner: {asset.evidenceOwner?.name ?? "Unassigned"}</span>
                <span>Verified: {formatDate(asset.lastVerifiedAt)}</span>
              </div>
              <div className="workspaceQueueMeta">
                <span>Linked scenarios: {asset._count.scenarioLinks}</span>
                <span>Requirements satisfied: {asset._count.satisfiedRequirements}</span>
              </div>
              <p className="muted">
                Usage: {asset.allowedUsage ?? "Usage guidance not written yet."}
              </p>
              <p className="muted">
                Restricted channels:{" "}
                {asset.restrictedChannels.length > 0 ? asset.restrictedChannels.join(", ") : "None"}
              </p>
              <p className="muted">Account: {asset.account?.name ?? "Workspace-wide asset"}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
