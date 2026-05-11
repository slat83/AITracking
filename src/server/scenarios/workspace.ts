import { ApprovalStatus, Prisma, ProofReadiness, ScenarioStatus, type PrismaClient } from "@prisma/client";

export const WORKSPACE_VIEWS = [
  {
    key: "my-work",
    label: "My work",
    description: "Scenarios currently assigned to you.",
  },
  {
    key: "needs-triage",
    label: "Needs triage",
    description: "New and in-flight scenarios that still need qualification.",
  },
  {
    key: "waiting-on-approval",
    label: "Waiting on approval",
    description: "Scenarios paused on a pending approval decision.",
  },
  {
    key: "blocked",
    label: "Blocked",
    description: "Scenarios with proof, approval, or dependency blockers.",
  },
  {
    key: "recently-updated",
    label: "Recently updated",
    description: "Latest activity across the active scenario queue.",
  },
] as const;

export type WorkspaceViewKey = (typeof WORKSPACE_VIEWS)[number]["key"];

const TERMINAL_SCENARIO_STATUSES = [ScenarioStatus.ARCHIVED, ScenarioStatus.RESOLVED] as const;
const TRIAGE_SCENARIO_STATUSES = [ScenarioStatus.INTAKE, ScenarioStatus.TRIAGE] as const;

function isWorkspaceViewKey(value: string): value is WorkspaceViewKey {
  return WORKSPACE_VIEWS.some((view) => view.key === value);
}

export function parseWorkspaceView(value: string | string[] | undefined): WorkspaceViewKey {
  const selected = Array.isArray(value) ? value[0] : value;
  return selected && isWorkspaceViewKey(selected) ? selected : "my-work";
}

export function getWorkspaceViewMeta(view: WorkspaceViewKey) {
  return WORKSPACE_VIEWS.find((item) => item.key === view) ?? WORKSPACE_VIEWS[0];
}

export const workspaceScenarioSelect = Prisma.validator<Prisma.ScenarioSelect>()({
  id: true,
  title: true,
  summary: true,
  status: true,
  priority: true,
  urgency: true,
  businessImpact: true,
  proofReadiness: true,
  approvalStatus: true,
  blockedReason: true,
  scenarioGoal: true,
  signalSummary: true,
  recommendedNextAction: true,
  capturedAt: true,
  createdAt: true,
  updatedAt: true,
  owner: {
    select: {
      id: true,
      name: true,
      role: true,
    },
  },
  account: {
    select: {
      id: true,
      name: true,
    },
  },
  scenarioType: {
    select: {
      id: true,
      name: true,
      family: true,
    },
  },
  playbook: {
    select: {
      id: true,
      name: true,
      summary: true,
      recommendedNextAction: true,
      proofGuidance: true,
    },
  },
  sourceOpportunity: {
    select: {
      id: true,
      sourceName: true,
      sourceUrl: true,
      whyNow: true,
      briefAudience: true,
      briefQuestion: true,
      proofRequirement: true,
      targetCta: true,
      dueDate: true,
      capturedAt: true,
    },
  },
  tasks: {
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      summary: true,
      kind: true,
      status: true,
      dueAt: true,
      createdAt: true,
      updatedAt: true,
      owner: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  },
  artifacts: {
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      artifactType: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  evidenceLinks: {
    orderBy: [{ createdAt: "asc" }],
    select: {
      isPrimary: true,
      usageSummary: true,
      createdAt: true,
      evidenceAsset: {
        select: {
          id: true,
          title: true,
          proofAssetType: true,
          claimSupported: true,
          sourceUrl: true,
          readiness: true,
          allowedUsage: true,
          restrictedChannels: true,
          lastVerifiedAt: true,
        },
      },
    },
  },
  prerequisites: {
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      description: true,
      prerequisiteType: true,
      status: true,
      blockingReason: true,
      satisfiedAt: true,
      waivedAt: true,
      createdAt: true,
      updatedAt: true,
      owner: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
      playbookPrerequisite: {
        select: {
          ownerRole: true,
          requiredProofAssetType: true,
        },
      },
      evidenceAsset: {
        select: {
          id: true,
          title: true,
          proofAssetType: true,
          readiness: true,
        },
      },
    },
  },
  outcome: {
    select: {
      id: true,
      status: true,
      summary: true,
      observedAt: true,
      resolvedAt: true,
      updatedAt: true,
    },
  },
});

export type WorkspaceScenario = Prisma.ScenarioGetPayload<{
  select: typeof workspaceScenarioSelect;
}>;

function getWorkspaceViewWhere(view: WorkspaceViewKey, userId: string) {
  if (view === "my-work") {
    return {
      ownerId: userId,
      status: {
        notIn: [...TERMINAL_SCENARIO_STATUSES],
      },
    };
  }

  if (view === "needs-triage") {
    return {
      status: {
        in: [...TRIAGE_SCENARIO_STATUSES],
      },
    };
  }

  if (view === "waiting-on-approval") {
    return {
      approvalStatus: ApprovalStatus.PENDING,
      status: {
        notIn: [...TERMINAL_SCENARIO_STATUSES],
      },
    };
  }

  if (view === "blocked") {
    return {
      status: {
        notIn: [...TERMINAL_SCENARIO_STATUSES],
      },
      OR: [
        {
          status: ScenarioStatus.BLOCKED,
        },
        {
          approvalStatus: ApprovalStatus.PENDING,
        },
        {
          approvalStatus: ApprovalStatus.REJECTED,
        },
        {
          proofReadiness: ProofReadiness.RESTRICTED,
        },
        {
          blockedReason: {
            not: null,
          },
        },
      ],
    };
  }

  return {
    status: {
      notIn: [...TERMINAL_SCENARIO_STATUSES],
    },
  };
}

function getWorkspaceViewOrderBy(view: WorkspaceViewKey) {
  if (view === "recently-updated") {
    return [{ updatedAt: "desc" as const }];
  }

  return [
    { priority: "desc" as const },
    { urgency: "desc" as const },
    { updatedAt: "desc" as const },
  ];
}

export async function getScenarioWorkspaceData(
  db: PrismaClient,
  input: {
    userId: string;
    view: WorkspaceViewKey;
    selectedScenarioId?: string;
  },
) {
  const scenarioWhere = getWorkspaceViewWhere(input.view, input.userId);

  const [viewCounts, scenarios] = await Promise.all([
    Promise.all(
      WORKSPACE_VIEWS.map(async (view) => ({
        key: view.key,
        count: await db.scenario.count({
          where: getWorkspaceViewWhere(view.key, input.userId),
        }),
      })),
    ),
    db.scenario.findMany({
      where: scenarioWhere,
      orderBy: getWorkspaceViewOrderBy(input.view),
      take: 24,
      select: workspaceScenarioSelect,
    }),
  ]);

  const selectedScenario =
    scenarios.find((scenario) => scenario.id === input.selectedScenarioId) ?? scenarios[0] ?? null;

  return {
    viewCounts,
    scenarios,
    selectedScenario,
  };
}
