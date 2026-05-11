import { AppShellNav } from "@/components/app-shell-nav";
import { requireUser } from "@/server/auth";
import { prisma } from "@/server/db/client";
import { getReleaseMetadata } from "@/server/release";

export const runtime = "nodejs";

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
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
          <p className="muted">Execution targets</p>
          <p className="statValue">{executionTargets.length}</p>
        </article>
      </section>

      <section className="shellGrid">
        <article className="shellSection">
          <div className="shellSectionHeader">
            <div>
              <h2>Roles and access</h2>
              <p className="muted" style={{ marginTop: 8 }}>
                The shell currently runs on coarse roles. Finer permissions can be layered later
                without changing the navigation model again.
              </p>
            </div>
          </div>
          <div className="workspaceChecklist">
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
              <h2>Scenario taxonomy</h2>
              <p className="muted" style={{ marginTop: 8 }}>
                Scenario naming now lives in records instead of static shell labels.
              </p>
            </div>
          </div>
          <div className="workspaceChecklist">
            {scenarioTypes.map((scenarioType) => (
              <article className="workspaceChecklistItem" key={scenarioType.id}>
                <strong>{scenarioType.name}</strong>
                <p className="muted">{scenarioType.family}</p>
              </article>
            ))}
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
                channel assumptions.
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
              </article>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
