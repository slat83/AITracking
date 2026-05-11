import {
  Prisma,
  ProofReadiness,
  PrerequisiteType,
  ScenarioPrerequisiteStatus,
} from "@prisma/client";

type ScenarioProofSyncDb = {
  scenario: {
    findUnique: (args: {
      where: { id: string };
      select: {
        id: true;
        playbookId: true;
        blockedAt: true;
        evidenceLinks: {
          select: {
            isPrimary: true;
            evidenceAsset: {
              select: {
                id: true;
                proofAssetType: true;
                readiness: true;
                title: true;
              };
            };
          };
        };
      };
    }) => Promise<{
      id: string;
      playbookId: string | null;
      blockedAt: Date | null;
      evidenceLinks: Array<{
        isPrimary: boolean;
        evidenceAsset: {
          id: string;
          proofAssetType: string;
          readiness: ProofReadiness;
          title: string;
        };
      }>;
    } | null>;
    update: (args: {
      where: { id: string };
      data: {
        proofReadiness: ProofReadiness;
        blockedReason: string | null;
        blockedAt?: Date | null;
      };
    }) => Promise<unknown>;
  };
  playbookPrerequisite: {
    findMany: (args: {
      where: { playbookId: string; isActive: boolean };
      orderBy: Array<{ sortOrder: "asc" } | { createdAt: "asc" }>;
      select: {
        id: true;
        title: true;
        description: true;
        prerequisiteType: true;
        requiredProofAssetType: true;
        ownerRole: true;
        isRequired: true;
      };
    }) => Promise<Array<{
      id: string;
      title: string;
      description: string | null;
      prerequisiteType: PrerequisiteType;
      requiredProofAssetType: string | null;
      ownerRole: string | null;
      isRequired: boolean;
    }>>;
  };
  scenarioPrerequisite: {
    upsert: (args: {
      where: {
        scenarioId_playbookPrerequisiteId: {
          scenarioId: string;
          playbookPrerequisiteId: string;
        };
      };
      create: Prisma.ScenarioPrerequisiteUncheckedCreateInput;
      update: Prisma.ScenarioPrerequisiteUncheckedUpdateInput;
    }) => Promise<unknown>;
    deleteMany: (args: {
      where: {
        scenarioId: string;
        playbookPrerequisiteId?: { notIn: string[] };
      };
    }) => Promise<unknown>;
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

type EvidenceMatch = {
  id: string;
  proofAssetType: string;
  readiness: ProofReadiness;
  title: string;
};

type PrerequisiteDefinition = {
  id: string;
  title: string;
  description: string | null;
  prerequisiteType: PrerequisiteType;
  requiredProofAssetType: string | null;
  ownerRole: string | null;
  isRequired: boolean;
};

function normalizeLookup(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function selectMatchingEvidenceAsset(
  prerequisite: PrerequisiteDefinition,
  evidenceAssets: EvidenceMatch[],
) {
  const requiredType = normalizeLookup(prerequisite.requiredProofAssetType);

  if (!requiredType) {
    return null;
  }

  const rankedMatches = evidenceAssets
    .filter((asset) => normalizeLookup(asset.proofAssetType) === requiredType)
    .sort((left, right) => {
      const readinessRank = getReadinessRank(right.readiness) - getReadinessRank(left.readiness);
      if (readinessRank !== 0) {
        return readinessRank;
      }

      return left.title.localeCompare(right.title);
    });

  return rankedMatches[0] ?? null;
}

function getReadinessRank(readiness: ProofReadiness) {
  if (readiness === ProofReadiness.READY) {
    return 4;
  }

  if (readiness === ProofReadiness.RESTRICTED) {
    return 3;
  }

  if (readiness === ProofReadiness.PARTIAL) {
    return 2;
  }

  return 1;
}

export function getScenarioPrerequisiteStatus(input: {
  prerequisiteType: PrerequisiteType;
  evidenceAsset: EvidenceMatch | null;
}) {
  if (input.prerequisiteType !== PrerequisiteType.EVIDENCE) {
    return {
      status: ScenarioPrerequisiteStatus.MISSING,
      blockingReason: "This prerequisite must be satisfied outside the evidence library.",
    };
  }

  if (!input.evidenceAsset) {
    return {
      status: ScenarioPrerequisiteStatus.MISSING,
      blockingReason: "No linked evidence asset currently satisfies this prerequisite.",
    };
  }

  if (input.evidenceAsset.readiness === ProofReadiness.READY) {
    return {
      status: ScenarioPrerequisiteStatus.SATISFIED,
      blockingReason: null,
    };
  }

  if (input.evidenceAsset.readiness === ProofReadiness.RESTRICTED) {
    return {
      status: ScenarioPrerequisiteStatus.BLOCKED,
      blockingReason: `${input.evidenceAsset.title} exists but is restricted for some usage contexts.`,
    };
  }

  return {
    status: ScenarioPrerequisiteStatus.MISSING,
    blockingReason: `${input.evidenceAsset.title} exists but is not yet verified for use.`,
  };
}

export function getScenarioProofReadiness(
  prerequisites: Array<{
    isRequired: boolean;
    status: ScenarioPrerequisiteStatus;
  }>,
) {
  const requiredPrerequisites = prerequisites.filter((item) => item.isRequired);

  if (requiredPrerequisites.length === 0) {
    return ProofReadiness.MISSING;
  }

  const blockedCount = requiredPrerequisites.filter(
    (item) => item.status === ScenarioPrerequisiteStatus.BLOCKED,
  ).length;
  const satisfiedCount = requiredPrerequisites.filter(
    (item) =>
      item.status === ScenarioPrerequisiteStatus.SATISFIED
      || item.status === ScenarioPrerequisiteStatus.WAIVED,
  ).length;

  if (blockedCount > 0) {
    return ProofReadiness.RESTRICTED;
  }

  if (satisfiedCount === 0) {
    return ProofReadiness.MISSING;
  }

  if (satisfiedCount < requiredPrerequisites.length) {
    return ProofReadiness.PARTIAL;
  }

  return ProofReadiness.READY;
}

export async function syncScenarioProofState(
  db: ScenarioProofSyncDb,
  input: {
    scenarioId: string;
    actorId: string | null;
  },
) {
  const scenario = await db.scenario.findUnique({
    where: { id: input.scenarioId },
    select: {
      id: true,
      playbookId: true,
      blockedAt: true,
      evidenceLinks: {
        select: {
          isPrimary: true,
          evidenceAsset: {
            select: {
              id: true,
              proofAssetType: true,
              readiness: true,
              title: true,
            },
          },
        },
      },
    },
  });

  if (!scenario) {
    throw new Error("Scenario not found.");
  }

  if (!scenario.playbookId) {
    await db.scenario.update({
      where: { id: scenario.id },
      data: {
        proofReadiness: ProofReadiness.MISSING,
        blockedReason: "No playbook is linked, so prerequisites cannot be evaluated yet.",
        blockedAt: scenario.blockedAt ?? new Date(),
      },
    });

    return {
      proofReadiness: ProofReadiness.MISSING,
      blockedReason: "No playbook is linked, so prerequisites cannot be evaluated yet.",
      prerequisitesSynced: 0,
    };
  }

  const prerequisiteDefinitions = await db.playbookPrerequisite.findMany({
    where: {
      playbookId: scenario.playbookId,
      isActive: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      description: true,
      prerequisiteType: true,
      requiredProofAssetType: true,
      ownerRole: true,
      isRequired: true,
    },
  });

  const evidenceAssets = scenario.evidenceLinks.map((link) => link.evidenceAsset);
  const prerequisiteStates: Array<{
    title: string;
    isRequired: boolean;
    status: ScenarioPrerequisiteStatus;
    blockingReason: string | null;
  }> = [];

  for (const prerequisite of prerequisiteDefinitions) {
    const evidenceAsset = selectMatchingEvidenceAsset(prerequisite, evidenceAssets);
    const resolved = getScenarioPrerequisiteStatus({
      prerequisiteType: prerequisite.prerequisiteType,
      evidenceAsset,
    });

    prerequisiteStates.push({
      title: prerequisite.title,
      isRequired: prerequisite.isRequired,
      status: resolved.status,
      blockingReason: resolved.blockingReason,
    });

    await db.scenarioPrerequisite.upsert({
      where: {
        scenarioId_playbookPrerequisiteId: {
          scenarioId: scenario.id,
          playbookPrerequisiteId: prerequisite.id,
        },
      },
      create: {
        scenarioId: scenario.id,
        playbookPrerequisiteId: prerequisite.id,
        evidenceAssetId: evidenceAsset?.id ?? null,
        title: prerequisite.title,
        description: prerequisite.description,
        prerequisiteType: prerequisite.prerequisiteType,
        status: resolved.status,
        blockingReason: resolved.blockingReason,
        satisfiedAt: resolved.status === ScenarioPrerequisiteStatus.SATISFIED ? new Date() : null,
      },
      update: {
        evidenceAssetId: evidenceAsset?.id ?? null,
        title: prerequisite.title,
        description: prerequisite.description,
        prerequisiteType: prerequisite.prerequisiteType,
        status: resolved.status,
        blockingReason: resolved.blockingReason,
        satisfiedAt: resolved.status === ScenarioPrerequisiteStatus.SATISFIED ? new Date() : null,
        waivedAt: null,
      },
    });
  }

  const activePrerequisiteIds = prerequisiteDefinitions.map((item) => item.id);
  await db.scenarioPrerequisite.deleteMany({
    where: activePrerequisiteIds.length > 0
      ? {
          scenarioId: scenario.id,
          playbookPrerequisiteId: {
            notIn: activePrerequisiteIds,
          },
        }
      : {
          scenarioId: scenario.id,
        },
  });

  const proofReadiness = getScenarioProofReadiness(prerequisiteStates);
  const firstBlockingItem = prerequisiteStates.find(
    (item) =>
      item.status === ScenarioPrerequisiteStatus.MISSING
      || item.status === ScenarioPrerequisiteStatus.BLOCKED,
  );
  const blockedReason = firstBlockingItem
    ? `${firstBlockingItem.title}: ${firstBlockingItem.blockingReason ?? "Prerequisite is not satisfied."}`
    : null;

  await db.scenario.update({
    where: { id: scenario.id },
    data: {
      proofReadiness,
      blockedReason,
      blockedAt: blockedReason ? scenario.blockedAt ?? new Date() : scenario.blockedAt,
    },
  });

  await db.auditEvent.create({
    data: {
      entityType: "Scenario",
      entityId: scenario.id,
      action: "proof_state_synced",
      actorId: input.actorId,
      payload: {
        proofReadiness,
        prerequisiteCount: prerequisiteDefinitions.length,
        evidenceAssetCount: evidenceAssets.length,
      } as Prisma.InputJsonValue,
    },
  });

  return {
    proofReadiness,
    blockedReason,
    prerequisitesSynced: prerequisiteDefinitions.length,
  };
}
