import { AppShellNav } from "@/components/app-shell-nav";
import { requireUser } from "@/server/auth";
import { prisma } from "@/server/db/client";

export const runtime = "nodejs";

type LaunchPackGroup = {
  name: string;
  items: Array<{
    id: string;
    name: string;
    launchLabel: string | null;
    description: string | null;
    playbookName: string | null;
    nextAction: string | null;
  }>;
};

export default async function TemplatesPage() {
  const session = await requireUser("VIEWER");
  const scenarioTypes = await prisma.scenarioType.findMany({
    where: {
      isActive: true,
      launchPack: {
        not: null,
      },
    },
    orderBy: [{ launchPack: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      launchPack: true,
      launchLabel: true,
      description: true,
      playbooks: {
        where: {
          isDefault: true,
          isActive: true,
        },
        select: {
          name: true,
          recommendedNextAction: true,
        },
        take: 1,
      },
    },
  });

  const launchPacks = scenarioTypes.reduce<LaunchPackGroup[]>((groups, scenarioType) => {
    const packName = scenarioType.launchPack ?? "Unassigned";
    const group = groups.find((entry) => entry.name === packName);
    const item = {
      id: scenarioType.id,
      name: scenarioType.name,
      launchLabel: scenarioType.launchLabel,
      description: scenarioType.description,
      playbookName: scenarioType.playbooks[0]?.name ?? null,
      nextAction: scenarioType.playbooks[0]?.recommendedNextAction ?? null,
    };

    if (group) {
      group.items.push(item);
      return groups;
    }

    groups.push({
      name: packName,
      items: [item],
    });
    return groups;
  }, []);

  return (
    <main className="shell dashboard workflowPage">
      <header className="topbar workspaceHeader">
        <div className="topbarInner workspaceHeaderInner">
          <div>
            <div className="eyebrow">Templates</div>
            <h1 style={{ fontSize: "2.5rem", margin: "12px 0 0" }}>Launch packs and seeded scenario templates</h1>
            <p className="muted workspaceIntro">
              Launch-specific material stays here as seeded templates, not in the global CRM
              navigation or the permanent product taxonomy.
            </p>
          </div>
          <div className="workspaceHeaderActions">
            <div className="pill">{session.user.role}</div>
          </div>
        </div>
        <AppShellNav activeKey="templates" />
      </header>

      <section className="statsGrid dashboardHeader workspaceStats">
        <article className="card dashboardCard">
          <p className="muted">Launch packs</p>
          <p className="statValue">{launchPacks.length}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Seeded templates</p>
          <p className="statValue">{scenarioTypes.length}</p>
        </article>
      </section>

      <section className="shellSection">
        <div className="shellSectionHeader">
          <div>
            <h2>Available launch packs</h2>
            <p className="muted" style={{ marginTop: 8 }}>
              Each pack can seed scenario definitions, recommended actions, and proof expectations
              without narrowing the shell to one business forever.
            </p>
          </div>
        </div>
        <div className="shellGrid">
          {launchPacks.map((pack) => (
            <article className="workspaceInlineCard" key={pack.name}>
              <div className="workspaceChecklistHeader">
                <strong>{pack.name}</strong>
                <span className="pill">{pack.items.length} templates</span>
              </div>
              <div className="workspaceChecklist">
                {pack.items.map((item) => (
                  <article className="workspaceChecklistItem" key={item.id}>
                    <strong>{item.launchLabel ?? item.name}</strong>
                    <p className="muted">
                      Scenario type: {item.name}
                    </p>
                    <p>{item.description ?? "No template description is attached yet."}</p>
                    <p className="muted">
                      Default playbook: {item.playbookName ?? "No default playbook linked."}
                    </p>
                    <p className="muted">
                      Starting action: {item.nextAction ?? "No starting action configured yet."}
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
