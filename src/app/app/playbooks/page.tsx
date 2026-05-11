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

export default async function PlaybooksPage() {
  const session = await requireUser("VIEWER");
  const scenarioTypes = await prisma.scenarioType.findMany({
    where: {
      isActive: true,
    },
    orderBy: [{ launchPack: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      family: true,
      description: true,
      launchPack: true,
      launchLabel: true,
      _count: {
        select: {
          scenarios: true,
          evidenceAssets: true,
        },
      },
      playbooks: {
        where: {
          isActive: true,
        },
        orderBy: [{ isDefault: "desc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          summary: true,
          recommendedNextAction: true,
          defaultTaskKind: true,
          proofGuidance: true,
          isDefault: true,
          prerequisites: {
            where: {
              isActive: true,
            },
            orderBy: [{ sortOrder: "asc" }],
            select: {
              id: true,
              title: true,
              ownerRole: true,
            },
          },
        },
      },
    },
  });

  const playbookCount = scenarioTypes.reduce((sum, type) => sum + type.playbooks.length, 0);
  const defaultPlaybookCount = scenarioTypes.reduce(
    (sum, type) => sum + type.playbooks.filter((playbook) => playbook.isDefault).length,
    0,
  );

  return (
    <main className="shell dashboard workflowPage">
      <header className="topbar workspaceHeader">
        <div className="topbarInner workspaceHeaderInner">
          <div>
            <div className="eyebrow">Playbooks</div>
            <h1 style={{ fontSize: "2.5rem", margin: "12px 0 0" }}>Scenario rules and next actions</h1>
            <p className="muted workspaceIntro">
              Playbooks define the recommended action, proof expectations, and operator ownership
              rules that keep the CRM explainable instead of opaque.
            </p>
          </div>
          <div className="workspaceHeaderActions">
            <div className="pill">{session.user.role}</div>
          </div>
        </div>
        <AppShellNav activeKey="playbooks" />
      </header>

      <section className="statsGrid dashboardHeader workspaceStats">
        <article className="card dashboardCard">
          <p className="muted">Scenario types</p>
          <p className="statValue">{scenarioTypes.length}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Active playbooks</p>
          <p className="statValue">{playbookCount}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Default playbooks</p>
          <p className="statValue">{defaultPlaybookCount}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Scenario families</p>
          <p className="statValue">
            {new Set(scenarioTypes.map((type) => type.family)).size}
          </p>
        </article>
      </section>

      <section className="shellSection">
        <div className="shellSectionHeader">
          <div>
            <h2>Active playbooks by scenario type</h2>
            <p className="muted" style={{ marginTop: 8 }}>
              Recommended actions stay attached to reusable scenario types rather than hard-coded
              launch-specific screens.
            </p>
          </div>
        </div>
        <div className="shellGrid">
          {scenarioTypes.map((scenarioType) => (
            <article className="workspaceInlineCard" key={scenarioType.id}>
              <div className="workspaceChecklistHeader">
                <div>
                  <strong>{scenarioType.name}</strong>
                  <p className="muted" style={{ marginTop: 6 }}>
                    {scenarioType.launchPack ?? "Universal"} · {scenarioType.launchLabel ?? scenarioType.family}
                  </p>
                </div>
                <span className="pill">{scenarioType._count.scenarios} scenarios</span>
              </div>
              <p>{scenarioType.description ?? "No description is attached yet."}</p>
              <p className="muted">
                Evidence assets: {scenarioType._count.evidenceAssets}
              </p>
              <div className="workspaceChecklist">
                {scenarioType.playbooks.map((playbook) => (
                  <article className="workspaceChecklistItem" key={playbook.id}>
                    <div className="workspaceChecklistHeader">
                      <strong>{playbook.name}</strong>
                      <span className="pill">
                        {playbook.isDefault ? "Default" : formatEnumLabel(playbook.defaultTaskKind ?? "todo")}
                      </span>
                    </div>
                    <p>{playbook.summary}</p>
                    <p className="muted">
                      Next action: {playbook.recommendedNextAction ?? "No next action configured yet."}
                    </p>
                    <p className="muted">
                      Proof guidance: {playbook.proofGuidance ?? "No proof guidance attached yet."}
                    </p>
                    <p className="muted">
                      Prerequisites:{" "}
                      {playbook.prerequisites.length > 0
                        ? playbook.prerequisites.map((prerequisite) => prerequisite.title).join(" · ")
                        : "No active prerequisites"}
                    </p>
                  </article>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
