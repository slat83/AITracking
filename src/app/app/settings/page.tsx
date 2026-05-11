import { AppShellNav } from "@/components/app-shell-nav";
import { requireUser } from "@/server/auth";
import { prisma } from "@/server/db/client";
import {
  getGovernanceCapabilities,
  summarizeRestrictedChannels,
  summarizeTemplateGovernance,
} from "@/server/governance/summary";
import { getReleaseMetadata } from "@/server/release";

export const runtime = "nodejs";

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split(/[_-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatReleaseTimestamp(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  });
}

export default async function SettingsPage() {
  const session = await requireUser("VIEWER");
  const release = getReleaseMetadata();
  const [users, scenarioTypes, executionTargets] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ role: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        role: true,
      },
    }),
    prisma.scenarioType.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        name: true,
        family: true,
        launchPack: true,
        launchLabel: true,
        evidenceAssets: {
          select: {
            proofAssetType: true,
            readiness: true,
            restrictedChannels: true,
            allowedUsage: true,
          },
        },
        playbooks: {
          where: {
            isActive: true,
            isDefault: true,
          },
          take: 1,
          select: {
            prerequisites: {
              where: {
                isActive: true,
              },
              select: {
                prerequisiteType: true,
                requiredProofAssetType: true,
                ownerRole: true,
                isRequired: true,
              },
            },
          },
        },
      },
    }),
    prisma.executionTarget.findMany({
      orderBy: [{ status: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        targetType: true,
        status: true,
        account: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);
  const templateGovernance = summarizeTemplateGovernance(
    scenarioTypes.map((scenarioType) => ({
      id: scenarioType.id,
      name: scenarioType.name,
      family: scenarioType.family,
      launchPack: scenarioType.launchPack,
      launchLabel: scenarioType.launchLabel,
      evidenceAssets: scenarioType.evidenceAssets,
      prerequisites: scenarioType.playbooks.flatMap((playbook) => playbook.prerequisites),
    })),
  );
  const restrictedChannels = summarizeRestrictedChannels(templateGovernance);
  const governanceCapabilities = getGovernanceCapabilities();
  const governedTemplateCount = templateGovernance.filter(
    (template) => template.safetyStatus !== "ready",
  ).length;

  return (
    <main className="shell dashboard workflowPage">
      <header className="topbar workspaceHeader">
        <div className="topbarInner workspaceHeaderInner">
          <div>
            <div className="eyebrow">Settings</div>
            <h1 style={{ fontSize: "2.5rem", margin: "12px 0 0" }}>Taxonomy, permissions, and execution targets</h1>
            <p className="muted workspaceIntro">
              This area exposes the operating configuration behind the shell so product decisions
              about roles, channels, and taxonomy can be reviewed without hiding them in code.
            </p>
          </div>
          <div className="workspaceHeaderActions">
            <div className="pill">{session.user.role}</div>
          </div>
        </div>
        <AppShellNav activeKey="settings" />
      </header>

      <section className="statsGrid dashboardHeader workspaceStats">
        <article className="card dashboardCard">
          <p className="muted">Users</p>
          <p className="statValue">{users.length}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Scenario types</p>
          <p className="statValue">{scenarioTypes.length}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Governed templates</p>
          <p className="statValue">{governedTemplateCount}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Execution targets</p>
          <p className="statValue">{executionTargets.length}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Restricted channels</p>
          <p className="statValue">{restrictedChannels.length}</p>
        </article>
      </section>

      <section className="shellGrid">
        <article className="shellSection">
          <div className="shellSectionHeader">
            <div>
              <h2>Roles and access</h2>
              <p className="muted" style={{ marginTop: 8 }}>
                The shell still runs on coarse roles. This view makes the current coverage explicit
                and shows the permission split the product should evolve toward.
              </p>
            </div>
          </div>
          <div className="workspaceChecklist">
            {governanceCapabilities.map((capability) => (
              <article className="workspaceChecklistItem" key={capability.action}>
                <div className="workspaceChecklistHeader">
                  <strong>{capability.action}</strong>
                  <span className="pill">{capability.currentRoleCoverage}</span>
                </div>
                <p className="muted">Recommended scope: {capability.recommendedScope}</p>
                <p className="muted">{capability.operatingRule}</p>
              </article>
            ))}
            {users.map((user) => (
              <article className="workspaceChecklistItem" key={user.id}>
                <div className="workspaceChecklistHeader">
                  <strong>{user.name}</strong>
                  <span className="pill">{formatEnumLabel(user.role)}</span>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="shellSection">
          <div className="shellSectionHeader">
            <div>
              <h2>Restricted-channel governance</h2>
              <p className="muted" style={{ marginTop: 8 }}>
                Evidence restrictions stay visible here so public or community work does not look
                universally safe just because a template exists.
              </p>
            </div>
          </div>
          <div className="workspaceChecklist">
            {restrictedChannels.length > 0 ? (
              restrictedChannels.map((channel) => (
                <article className="workspaceChecklistItem" key={channel.channel}>
                  <div className="workspaceChecklistHeader">
                    <strong>{formatEnumLabel(channel.channel)}</strong>
                    <span className="pill">{channel.templateCount} templates</span>
                  </div>
                  <p className="muted">
                    Restricted by evidence on: {channel.templateNames.join(" · ")}
                  </p>
                  <p className="muted">
                    Public execution for this channel should stay manual or explicitly
                    approval-gated.
                  </p>
                </article>
              ))
            ) : (
              <article className="workspaceChecklistItem">
                <strong>No restricted channels are configured yet.</strong>
                <p className="muted">
                  Add channel restrictions on evidence assets before policy-sensitive work reaches
                  public execution.
                </p>
              </article>
            )}
          </div>
        </article>

        <article className="shellSection">
          <div className="shellSectionHeader">
            <div>
              <h2>Release identity</h2>
              <p className="muted" style={{ marginTop: 8 }}>
                Live runtime metadata stays visible here so operators can verify what production
                release is actually running without leaving the app shell.
              </p>
            </div>
          </div>
          <div className="workspaceChecklist">
            <article className="workspaceChecklistItem">
              <div className="workspaceChecklistHeader">
                <strong>Version</strong>
                <span className="pill">{release.version}</span>
              </div>
              <p className="muted">Release ID: {release.releaseId}</p>
            </article>
            <article className="workspaceChecklistItem">
              <div className="workspaceChecklistHeader">
                <strong>Commit SHA</strong>
                <span className="pill">{release.gitSha ?? "Unavailable"}</span>
              </div>
              <p className="muted">Built at: {formatReleaseTimestamp(release.builtAt)}</p>
            </article>
            <article className="workspaceChecklistItem">
              <div className="workspaceChecklistHeader">
                <strong>Runtime environment</strong>
                <span className="pill">{release.environment}</span>
              </div>
              <p className="muted">Service: {release.service}</p>
            </article>
          </div>
        </article>

        <article className="shellSection shellSectionSpan2">
          <div className="shellSectionHeader">
            <div>
              <h2>Execution targets</h2>
              <p className="muted" style={{ marginTop: 8 }}>
                Approved destinations stay visible as operating configuration rather than hidden
                channel assumptions. Manual execution remains the default control plane.
              </p>
            </div>
          </div>
          <div className="shellGrid">
            {executionTargets.map((target) => (
              <article className="workspaceInlineCard" key={target.id}>
                <div className="workspaceChecklistHeader">
                  <strong>{target.name}</strong>
                  <span className="pill">{formatEnumLabel(target.status)}</span>
                </div>
                <p className="muted">
                  {target.targetType} · {target.account?.name ?? "Workspace-wide target"}
                </p>
                <p className="muted">
                  Governance: manual owner action on an approved target, with any public-channel
                  approval handled before execution.
                </p>
              </article>
            ))}
          </div>
        </article>

        <article className="shellSection shellSectionSpan2">
          <div className="shellSectionHeader">
            <div>
              <h2>Template governance baseline</h2>
              <p className="muted" style={{ marginTop: 8 }}>
                Launch packs remain seeded content. Their proof gaps, approval gates, and channel
                restrictions are visible here before anyone treats them as reusable defaults.
              </p>
            </div>
          </div>
          <div className="shellGrid">
            {templateGovernance.map((template) => (
              <article className="workspaceInlineCard" key={template.id}>
                <div className="workspaceChecklistHeader">
                  <strong>{template.launchLabel ?? template.name}</strong>
                  <span className="pill">{template.safetyLabel}</span>
                </div>
                <p className="muted">
                  {template.launchPack ?? "Universal"} · {template.family}
                </p>
                <p className="muted">
                  Proof coverage: {template.coveredProofCount}/{template.requiredProofCount || template.evidenceAssetCount} tracked
                </p>
                <p className="muted">
                  Approval gate: {template.hasApprovalPrerequisite ? "Required" : "Not modeled"}
                </p>
                <p className="muted">
                  Restricted channels: {template.restrictedChannels.length > 0 ? template.restrictedChannels.join(", ") : "None"}
                </p>
              </article>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
