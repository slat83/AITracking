import {
  OpportunityPriority,
  OpportunityStatus,
  Prisma,
  ScenarioPriority,
  ScenarioStatus,
  ScenarioUrgency,
  BusinessImpact,
  ProofReadiness,
  ApprovalStatus,
} from "@prisma/client";

const DEFAULT_WORKSPACE_SLUG = "default-workspace";
const DEFAULT_ACCOUNT_SLUG = "default-launch-account";

function normalizeRecommendedNextAction(value: string | null | undefined) {
  const trimmed = value?.trim();

  return trimmed && trimmed.length > 0 ? trimmed : null;
}

type ScenarioTypeOption = {
  id: string;
  slug: string;
  name: string;
  family: string;
  launchLabel: string | null;
  isActive: boolean;
};

type OpportunityScenarioSource = {
  id: string;
  title: string;
  summary: string;
  sourceName: string;
  scenario: string | null;
  whyNow: string | null;
  suggestedAssetAngle: string | null;
  briefQuestion: string | null;
  proofRequirement: string | null;
  status: OpportunityStatus;
  priority: OpportunityPriority;
  ownerId: string | null;
  capturedAt: Date;
};

type ScenarioSyncDb = {
  workspace: {
    upsert: (args: {
      where: { slug: string };
      update: { name: string; isDefault: boolean };
      create: { slug: string; name: string; isDefault: boolean };
    }) => Promise<{ id: string }>;
  };
  account: {
    upsert: (args: {
      where: { workspaceId_slug: { workspaceId: string; slug: string } };
      update: { name: string; isDefault: boolean };
      create: { workspaceId: string; slug: string; name: string; isDefault: boolean };
    }) => Promise<{ id: string }>;
  };
  scenarioType: {
    findMany: (args: {
      where: { isActive: boolean };
      orderBy: Array<{ family: "asc" } | { name: "asc" }>;
      select: {
        id: true;
        slug: true;
        name: true;
        family: true;
        launchLabel: true;
        isActive: true;
      };
    }) => Promise<ScenarioTypeOption[]>;
  };
  playbook: {
    findFirst: (args: {
      where: { scenarioTypeId: string; isActive: boolean; isDefault: boolean };
      select: { id: true; recommendedNextAction: true };
    }) => Promise<{ id: string; recommendedNextAction: string | null } | null>;
  };
  scenario: {
    findUnique: (args: {
      where: { sourceOpportunityId: string };
      select: {
        id: true;
        triagedAt: true;
        recommendedNextAction: true;
      };
    }) => Promise<{ id: string; triagedAt: Date | null; recommendedNextAction: string | null } | null>;
    upsert: (args: {
      where: { sourceOpportunityId: string };
      update: Prisma.ScenarioUpdateInput;
      create: Prisma.ScenarioCreateInput;
      select: { id: true };
    }) => Promise<{ id: string }>;
  };
  auditEvent: {
    create: (args: {
      data: {
        entityType: string;
        entityId: string;
        action: string;
        actorId: string | null;
        payload: Prisma.InputJsonValue;
      };
    }) => Promise<unknown>;
  };
};

export function getScenarioTypeOptionLabel(type: Pick<ScenarioTypeOption, "launchLabel" | "name">) {
  return type.launchLabel?.trim() || type.name;
}

export function mapOpportunityStatusToScenarioStatus(status: OpportunityStatus): ScenarioStatus {
  if (status === OpportunityStatus.INTAKE) {
    return ScenarioStatus.INTAKE;
  }

  if (status === OpportunityStatus.TRIAGE) {
    return ScenarioStatus.TRIAGE;
  }

  if (status === OpportunityStatus.READY_FOR_DRAFT) {
    return ScenarioStatus.READY_FOR_DRAFT;
  }

  return ScenarioStatus.ARCHIVED;
}

function mapOpportunityPriority(value: OpportunityPriority): {
  priority: ScenarioPriority;
  urgency: ScenarioUrgency;
  businessImpact: BusinessImpact;
} {
  if (value === OpportunityPriority.HIGH) {
    return {
      priority: ScenarioPriority.HIGH,
      urgency: ScenarioUrgency.HIGH,
      businessImpact: BusinessImpact.HIGH,
    };
  }

  if (value === OpportunityPriority.LOW) {
    return {
      priority: ScenarioPriority.LOW,
      urgency: ScenarioUrgency.LOW,
      businessImpact: BusinessImpact.LOW,
    };
  }

  return {
    priority: ScenarioPriority.MEDIUM,
    urgency: ScenarioUrgency.MEDIUM,
    businessImpact: BusinessImpact.MEDIUM,
  };
}

export function buildScenarioTypeLookupKey(value: string) {
  return value.trim().toLowerCase();
}

function resolveScenarioTypeOption(types: ScenarioTypeOption[], selectedScenario: string | null) {
  const lookup = buildScenarioTypeLookupKey(selectedScenario ?? "");

  return types.find((type) => {
    return [
      type.slug,
      type.name,
      type.launchLabel ?? "",
    ].some((candidate) => buildScenarioTypeLookupKey(candidate) === lookup);
  });
}

async function ensureDefaultScenarioContext(db: ScenarioSyncDb) {
  const workspace = await db.workspace.upsert({
    where: { slug: DEFAULT_WORKSPACE_SLUG },
    update: {
      name: "Default Workspace",
      isDefault: true,
    },
    create: {
      slug: DEFAULT_WORKSPACE_SLUG,
      name: "Default Workspace",
      isDefault: true,
    },
  });

  const account = await db.account.upsert({
    where: {
      workspaceId_slug: {
        workspaceId: workspace.id,
        slug: DEFAULT_ACCOUNT_SLUG,
      },
    },
    update: {
      name: "EpicVIN Launch Pack",
      isDefault: true,
    },
    create: {
      workspaceId: workspace.id,
      slug: DEFAULT_ACCOUNT_SLUG,
      name: "EpicVIN Launch Pack",
      isDefault: true,
    },
  });

  return {
    workspaceId: workspace.id,
    accountId: account.id,
  };
}

export async function listActiveScenarioTypes(db: Pick<ScenarioSyncDb, "scenarioType">) {
  return db.scenarioType.findMany({
    where: { isActive: true },
    orderBy: [{ family: "asc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      family: true,
      launchLabel: true,
      isActive: true,
    },
  });
}

export async function syncScenarioFromOpportunity(
  db: ScenarioSyncDb,
  input: {
    actorId: string | null;
    opportunity: OpportunityScenarioSource;
  },
) {
  const { workspaceId, accountId } = await ensureDefaultScenarioContext(db);
  const scenarioTypes = await listActiveScenarioTypes(db);
  const existingScenario = await db.scenario.findUnique({
    where: {
      sourceOpportunityId: input.opportunity.id,
    },
    select: {
      id: true,
      triagedAt: true,
      recommendedNextAction: true,
    },
  });
  const scenarioType = resolveScenarioTypeOption(scenarioTypes, input.opportunity.scenario);

  if (!scenarioType) {
    throw new Error("Selected scenario type is not available. Reseed scenario types and try again.");
  }

  const playbook = await db.playbook.findFirst({
    where: {
      scenarioTypeId: scenarioType.id,
      isActive: true,
      isDefault: true,
    },
    select: {
      id: true,
      recommendedNextAction: true,
    },
  });

  const priority = mapOpportunityPriority(input.opportunity.priority);
  const baseRecommendedNextAction = normalizeRecommendedNextAction(input.opportunity.suggestedAssetAngle);
  const resolvedRecommendedNextAction =
    baseRecommendedNextAction
    ?? normalizeRecommendedNextAction(playbook?.recommendedNextAction)
    ?? normalizeRecommendedNextAction(existingScenario?.recommendedNextAction)
    ?? null;

  const proofReadiness = input.opportunity.proofRequirement
    ? ProofReadiness.PARTIAL
    : ProofReadiness.MISSING;
  const mappedStatus = mapOpportunityStatusToScenarioStatus(input.opportunity.status);
  const triagedAt =
    existingScenario?.triagedAt
    ?? (mappedStatus !== ScenarioStatus.INTAKE && mappedStatus !== ScenarioStatus.ARCHIVED
      ? new Date()
      : null);

  const scenario = await db.scenario.upsert({
    where: {
      sourceOpportunityId: input.opportunity.id,
    },
    update: {
      workspace: {
        connect: { id: workspaceId },
      },
      account: {
        connect: { id: accountId },
      },
      scenarioType: {
        connect: { id: scenarioType.id },
      },
      playbook: playbook
        ? {
            connect: { id: playbook.id },
          }
        : {
            disconnect: true,
          },
      title: input.opportunity.title,
      summary: input.opportunity.summary,
      status: mappedStatus,
      priority: priority.priority,
      urgency: priority.urgency,
      businessImpact: priority.businessImpact,
      proofReadiness,
      approvalStatus: ApprovalStatus.NOT_REQUIRED,
      blockedReason: null,
      scenarioGoal: input.opportunity.briefQuestion ?? input.opportunity.whyNow ?? null,
      signalSummary: `${input.opportunity.sourceName ?? ""}`.trim()
        ? `${input.opportunity.sourceName}: ${input.opportunity.summary}`
        : input.opportunity.summary,
      recommendedNextAction: resolvedRecommendedNextAction,
      owner: input.opportunity.ownerId
        ? {
            connect: { id: input.opportunity.ownerId },
          }
        : {
            disconnect: true,
          },
      capturedAt: input.opportunity.capturedAt,
      triagedAt,
      lastSyncedAt: new Date(),
    },
    create: {
      workspace: {
        connect: { id: workspaceId },
      },
      account: {
        connect: { id: accountId },
      },
      sourceOpportunity: {
        connect: { id: input.opportunity.id },
      },
      scenarioType: {
        connect: { id: scenarioType.id },
      },
      playbook: playbook
        ? {
            connect: { id: playbook.id },
          }
        : undefined,
      title: input.opportunity.title,
      summary: input.opportunity.summary,
      status: mappedStatus,
      priority: priority.priority,
      urgency: priority.urgency,
      businessImpact: priority.businessImpact,
      proofReadiness,
      approvalStatus: ApprovalStatus.NOT_REQUIRED,
      scenarioGoal: input.opportunity.briefQuestion ?? input.opportunity.whyNow ?? null,
      signalSummary: `${input.opportunity.sourceName ?? ""}`.trim()
        ? `${input.opportunity.sourceName}: ${input.opportunity.summary}`
        : input.opportunity.summary,
      recommendedNextAction: resolvedRecommendedNextAction,
      owner: input.opportunity.ownerId
        ? {
            connect: { id: input.opportunity.ownerId },
          }
        : undefined,
      capturedAt: input.opportunity.capturedAt,
      triagedAt,
      lastSyncedAt: new Date(),
    },
    select: {
      id: true,
    },
  });

  await db.auditEvent.create({
    data: {
      entityType: "Scenario",
      entityId: scenario.id,
      action: "synced_from_opportunity",
      actorId: input.actorId,
      payload: {
        sourceOpportunityId: input.opportunity.id,
        scenarioTypeId: scenarioType.id,
        playbookId: playbook?.id ?? null,
        status: mappedStatus,
      } as Prisma.InputJsonValue,
    },
  });

  return scenario;
}

export async function backfillScenariosFromOpportunities(
  db: ScenarioSyncDb & {
    opportunity: {
      findMany: (args: {
        select: {
          id: true;
          title: true;
          summary: true;
          scenario: true;
          whyNow: true;
          suggestedAssetAngle: true;
          briefQuestion: true;
          proofRequirement: true;
          status: true;
          priority: true;
          ownerId: true;
          capturedAt: true;
          sourceName: true;
        };
      }) => Promise<Array<OpportunityScenarioSource & { sourceName: string }>>;
    };
  },
  options?: {
    skipUnresolvableScenarioType?: boolean;
  },
) {
  const opportunities = await db.opportunity.findMany({
    select: {
      id: true,
      title: true,
      summary: true,
      scenario: true,
      whyNow: true,
      suggestedAssetAngle: true,
      briefQuestion: true,
      proofRequirement: true,
      status: true,
      priority: true,
      ownerId: true,
      capturedAt: true,
      sourceName: true,
    },
  });

  const unresolved: Array<{ id: string; scenario: string | null }> = [];

  for (const opportunity of opportunities) {
    try {
      await syncScenarioFromOpportunity(db, {
        actorId: opportunity.ownerId ?? null,
        opportunity,
      });
    } catch (error) {
      const shouldSkip =
        options?.skipUnresolvableScenarioType
        && error instanceof Error
        && error.message.includes("Selected scenario type is not available.");

      if (!shouldSkip) {
        throw error;
      }

      unresolved.push({
        id: opportunity.id,
        scenario: opportunity.scenario,
      });
    }
  }

  if (unresolved.length > 0) {
    const details = unresolved
      .map((entry) => `${entry.id} (${entry.scenario ?? "null"})`)
      .join(", ");
    console.warn(
      `Skipped ${unresolved.length} opportunity scenario syncs with unresolved scenario types: ${details}`,
    );
  }
}
