import { AppShellNav } from "@/components/app-shell-nav";
import { requireUser } from "@/server/auth";
import { prisma } from "@/server/db/client";
import { summarizeTemplateGovernance } from "@/server/governance/summary";

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
    safetyLabel: string;
    missingProofTypes: string[];
    restrictedChannels: string[];
    hasApprovalPrerequisite: boolean;
    ownerRoles: string[];
    allowedUsageNotes: string[];
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
      family: true,
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
          isDefault: true,
          isActive: true,
        },
        select: {
          name: true,
          recommendedNextAction: true,
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
        take: 1,
      },
    },
  });
  const governanceByScenarioType = new Map(
    summarizeTemplateGovernance(
      scenarioTypes.map((scenarioType) => ({
        id: scenarioType.id,
        name: scenarioType.name,
        family: scenarioType.family,
        launchPack: scenarioType.launchPack,
        launchLabel: scenarioType.launchLabel,
        evidenceAssets: scenarioType.evidenceAssets,
        prerequisites: scenarioType.playbooks.flatMap((playbook) => playbook.prerequisites),
      })),
    ).map((summary) => [summary.id, summary]),
  );

  const launchPacks = scenarioTypes.reduce<LaunchPackGroup[]>((groups, scenarioType) => {
    const packName = scenarioType.launchPack ?? "Unassigned";
    const group = groups.find((entry) => entry.name === packName);
    const governance = governanceByScenarioType.get(scenarioType.id);
    const item = {
      id: scenarioType.id,
      name: scenarioType.name,
      launchLabel: scenarioType.launchLabel,
      description: scenarioType.description,
      playbookName: scenarioType.playbooks[0]?.name ?? null,
      nextAction: scenarioType.playbooks[0]?.recommendedNextAction ?? null,
      safetyLabel: governance?.safetyLabel ?? "Safety review pending",
      missingProofTypes: governance?.missingProofTypes ?? [],
      restrictedChannels: governance?.restrictedChannels ?? [],
      hasApprovalPrerequisite: governance?.hasApprovalPrerequisite ?? false,
      ownerRoles: governance?.ownerRoles ?? [],
      allowedUsageNotes: governance?.allowedUsageNotes ?? [],
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
        <article className="card dashboardCard">
          <p className="muted">Approval-gated templates</p>
          <p className="statValue">
            {
              [...governanceByScenarioType.values()].filter(
                (summary) => summary.hasApprovalPrerequisite,
              ).length
            }
          </p>
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
                    <div className="workspaceChecklistHeader">
                      <strong>{item.launchLabel ?? item.name}</strong>
                      <span className="pill">{item.safetyLabel}</span>
                    </div>
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
                    <p className="muted">
                      Approval gate: {item.hasApprovalPrerequisite ? "Required before execution" : "No explicit approval prerequisite"}
                    </p>
                    <p className="muted">
                      Missing proof: {item.missingProofTypes.length > 0 ? item.missingProofTypes.join(", ") : "None"}
                    </p>
                    <p className="muted">
                      Restricted channels: {item.restrictedChannels.length > 0 ? item.restrictedChannels.join(", ") : "None"}
                    </p>
                    <p className="muted">
                      Owner roles: {item.ownerRoles.length > 0 ? item.ownerRoles.join(", ") : "No owner role modeled"}
                    </p>
                    <p className="muted">
                      Usage notes: {item.allowedUsageNotes.length > 0 ? item.allowedUsageNotes[0] : "No usage guidance attached yet."}
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
