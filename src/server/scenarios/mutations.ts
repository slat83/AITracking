import { Prisma, ScenarioStatus, TaskKind, TaskStatus, UserRole } from "@prisma/client";
import { z } from "zod";

const OPEN_ESCALATION_TASK_STATUSES: TaskStatus[] = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED];

const reasonSchema = z
  .string()
  .trim()
  .min(12, "Add a short sentence explaining why this change is needed.")
  .refine((value) => /\s/.test(value), "Add a short sentence explaining why this change is needed.");

type ScenarioMutationDb = {
  scenario: {
    findUnique: (args: {
      where: { id: string };
      select: {
        id: true;
        title: true;
        status: true;
        ownerId: true;
        owner: {
          select: {
            id: true;
            name: true;
          };
        };
        sourceOpportunity: {
          select: {
            dueDate: true;
          };
        };
      };
    }) => Promise<{
      id: string;
      title: string;
      status: ScenarioStatus;
      ownerId: string | null;
      owner: { id: string; name: string } | null;
      sourceOpportunity: { dueDate: Date | null } | null;
    } | null>;
    update: (args: {
      where: { id: string };
      data: {
        ownerId?: string | null;
      };
    }) => Promise<unknown>;
  };
  user: {
    findUnique: (args: {
      where: { id: string };
      select: {
        id: true;
        name: true;
        role: true;
      };
    }) => Promise<{
      id: string;
      name: string;
      role: UserRole;
    } | null>;
  };
  task: {
    findFirst: (args: {
      where: {
        scenarioId: string;
        kind: TaskKind;
        status: {
          in: TaskStatus[];
        };
      };
      orderBy: [{ updatedAt: "desc" }];
      select: {
        id: true;
      };
    }) => Promise<{ id: string } | null>;
    create: (args: {
      data: {
        scenarioId: string;
        title: string;
        summary: string;
        kind: TaskKind;
        status: TaskStatus;
        ownerId: string;
        dueAt: Date | null;
      };
    }) => Promise<unknown>;
    update: (args: {
      where: { id: string };
      data: {
        title: string;
        summary: string;
        status: TaskStatus;
        ownerId: string;
        dueAt: Date | null;
      };
    }) => Promise<unknown>;
  };
  auditEvent: {
    create: (args: {
      data: {
        entityType: string;
        entityId: string;
        action: string;
        actorId: string;
        payload: Prisma.InputJsonValue;
      };
    }) => Promise<unknown>;
  };
};

function canManageScenarioOwnership(input: {
  actorRole: UserRole;
  actorId: string;
  scenarioOwnerId: string | null;
}) {
  return input.actorRole === UserRole.ADMIN
    || (input.actorRole === UserRole.EDITOR && input.scenarioOwnerId === input.actorId);
}

function assertReason(value: string) {
  const parsed = reasonSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "A reason is required.");
  }

  return parsed.data;
}

function isImmutableScenarioStatus(status: ScenarioStatus) {
  return status === ScenarioStatus.ARCHIVED || status === ScenarioStatus.RESOLVED;
}

function isEligibleInternalRole(role: UserRole) {
  return role === UserRole.ADMIN || role === UserRole.EDITOR;
}

async function getMutableScenario(
  db: ScenarioMutationDb,
  input: {
    scenarioId: string;
    actorId: string;
    actorRole: UserRole;
  },
) {
  const scenario = await db.scenario.findUnique({
    where: { id: input.scenarioId },
    select: {
      id: true,
      title: true,
      status: true,
      ownerId: true,
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
      sourceOpportunity: {
        select: {
          dueDate: true,
        },
      },
    },
  });

  if (!scenario) {
    throw new Error("Scenario not found.");
  }

  if (isImmutableScenarioStatus(scenario.status)) {
    throw new Error("This scenario is read-only because it is already closed.");
  }

  if (
    !canManageScenarioOwnership({
      actorRole: input.actorRole,
      actorId: input.actorId,
      scenarioOwnerId: scenario.ownerId,
    })
  ) {
    throw new Error("You can view ownership history, but only authorized leads can reassign or escalate this scenario.");
  }

  return scenario;
}

async function getEligibleInternalUser(
  db: ScenarioMutationDb,
  userId: string,
  emptyStateMessage: string,
) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      role: true,
    },
  });

  if (!user || !isEligibleInternalRole(user.role)) {
    throw new Error(emptyStateMessage);
  }

  return user;
}

export async function reassignScenarioOwner(
  db: ScenarioMutationDb,
  input: {
    scenarioId: string;
    actorId: string;
    actorRole: UserRole;
    newOwnerId: string;
    reason: string;
  },
) {
  const scenario = await getMutableScenario(db, input);
  const reason = assertReason(input.reason);

  if (!input.newOwnerId) {
    throw new Error("Choose a new owner before submitting the reassignment.");
  }

  if (scenario.ownerId === input.newOwnerId) {
    throw new Error("Choose a different owner before submitting the reassignment.");
  }

  const newOwner = await getEligibleInternalUser(
    db,
    input.newOwnerId,
    "No eligible owners are available right now. Ask an admin to update scenario routing.",
  );

  await db.scenario.update({
    where: { id: scenario.id },
    data: {
      ownerId: newOwner.id,
    },
  });

  await db.auditEvent.create({
    data: {
      entityType: "Scenario",
      entityId: scenario.id,
      action: "owner_reassigned",
      actorId: input.actorId,
      payload: {
        previousOwnerId: scenario.owner?.id ?? null,
        previousOwnerName: scenario.owner?.name ?? null,
        newOwnerId: newOwner.id,
        newOwnerName: newOwner.name,
        reason,
      } as Prisma.InputJsonValue,
    },
  });

  return {
    scenarioId: scenario.id,
    scenarioTitle: scenario.title,
    previousOwnerName: scenario.owner?.name ?? null,
    newOwnerName: newOwner.name,
  };
}

export async function escalateScenario(
  db: ScenarioMutationDb,
  input: {
    scenarioId: string;
    actorId: string;
    actorRole: UserRole;
    escalationTargetId: string;
    escalationOwnerId: string;
    reason: string;
  },
) {
  const scenario = await getMutableScenario(db, input);
  const reason = assertReason(input.reason);

  if (!input.escalationTargetId) {
    throw new Error("Choose an escalation target before submitting.");
  }

  if (!input.escalationOwnerId) {
    throw new Error("Choose an escalation owner before submitting.");
  }

  const [escalationTarget, escalationOwner] = await Promise.all([
    getEligibleInternalUser(
      db,
      input.escalationTargetId,
      "No eligible owners are available right now. Ask an admin to update scenario routing.",
    ),
    getEligibleInternalUser(
      db,
      input.escalationOwnerId,
      "No eligible owners are available right now. Ask an admin to update scenario routing.",
    ),
  ]);

  const taskTitle = `Escalation: ${scenario.title}`;
  const taskSummary = `Escalated to ${escalationTarget.name}. ${reason}`;
  const existingEscalationTask = await db.task.findFirst({
    where: {
      scenarioId: scenario.id,
      kind: TaskKind.ESCALATE,
      status: {
        in: OPEN_ESCALATION_TASK_STATUSES,
      },
    },
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
    },
  });

  if (existingEscalationTask) {
    await db.task.update({
      where: { id: existingEscalationTask.id },
      data: {
        title: taskTitle,
        summary: taskSummary,
        status: TaskStatus.IN_PROGRESS,
        ownerId: escalationOwner.id,
        dueAt: scenario.sourceOpportunity?.dueDate ?? null,
      },
    });
  } else {
    await db.task.create({
      data: {
        scenarioId: scenario.id,
        title: taskTitle,
        summary: taskSummary,
        kind: TaskKind.ESCALATE,
        status: TaskStatus.IN_PROGRESS,
        ownerId: escalationOwner.id,
        dueAt: scenario.sourceOpportunity?.dueDate ?? null,
      },
    });
  }

  await db.auditEvent.create({
    data: {
      entityType: "Scenario",
      entityId: scenario.id,
      action: "escalation_requested",
      actorId: input.actorId,
      payload: {
        scenarioOwnerId: scenario.owner?.id ?? null,
        scenarioOwnerName: scenario.owner?.name ?? null,
        escalationTargetId: escalationTarget.id,
        escalationTargetName: escalationTarget.name,
        escalationOwnerId: escalationOwner.id,
        escalationOwnerName: escalationOwner.name,
        reason,
      } as Prisma.InputJsonValue,
    },
  });

  return {
    scenarioId: scenario.id,
    scenarioTitle: scenario.title,
    escalationTargetName: escalationTarget.name,
    escalationOwnerName: escalationOwner.name,
  };
}
