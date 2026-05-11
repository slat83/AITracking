import {
  ApprovalStatus,
  Prisma,
  ProofReadiness,
  ScenarioStatus,
  TaskKind,
  TaskStatus,
} from "@prisma/client";

type OpenTaskRecord = {
  id: string;
  title: string;
  kind: TaskKind;
  status: TaskStatus;
};

type ScenarioOrchestrationDb = {
  scenario: {
    findUnique: (args: {
      where: { id: string };
      select: {
        id: true;
        title: true;
        status: true;
        proofReadiness: true;
        approvalStatus: true;
        blockedReason: true;
        recommendedNextAction: true;
        ownerId: true;
        firstTaskAt: true;
        blockedAt: true;
        sourceOpportunity: {
          select: {
            dueDate: true;
          };
        };
        playbook: {
          select: {
            defaultTaskKind: true;
          };
        };
      };
    }) => Promise<{
      id: string;
      title: string;
      status: ScenarioStatus;
      proofReadiness: ProofReadiness;
      approvalStatus: ApprovalStatus;
      blockedReason: string | null;
      recommendedNextAction: string | null;
      ownerId: string | null;
      firstTaskAt: Date | null;
      blockedAt: Date | null;
      sourceOpportunity: { dueDate: Date | null } | null;
      playbook: { defaultTaskKind: TaskKind | null } | null;
    } | null>;
    update: (args: {
      where: { id: string };
      data: {
        status: ScenarioStatus;
        blockedReason: string | null;
        firstTaskAt?: Date | null;
        blockedAt?: Date | null;
      };
    }) => Promise<unknown>;
  };
  task: {
    findMany: (args: {
      where: {
        scenarioId: string;
        status: { in: TaskStatus[] };
      };
      orderBy: Array<{ createdAt: "asc" }>;
      select: {
        id: true;
        title: true;
        kind: true;
        status: true;
      };
    }) => Promise<OpenTaskRecord[]>;
    create: (args: {
      data: {
        scenarioId: string;
        title: string;
        summary: string | null;
        kind: TaskKind;
        status: TaskStatus;
        ownerId: string | null;
        dueAt: Date | null;
        createdAt?: Date;
      };
      select: { id: true };
    }) => Promise<{ id: string }>;
    update: (args: {
      where: { id: string };
      data: {
        title: string;
        summary: string | null;
        kind: TaskKind;
        status: TaskStatus;
        ownerId: string | null;
        dueAt: Date | null;
      };
      select: { id: true };
    }) => Promise<{ id: string }>;
    updateMany: (args: {
      where: {
        id: { in: string[] };
      };
      data: {
        status: TaskStatus;
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

type NextActionTaskPlan = {
  title: string;
  summary: string | null;
  kind: TaskKind;
  status: TaskStatus;
};

type NextActionPlan = {
  scenarioStatus: ScenarioStatus;
  blockedReason: string | null;
  task: NextActionTaskPlan | null;
  rationale: string;
};

function getDefaultTaskSummary(kind: TaskKind) {
  if (kind === TaskKind.DRAFT) {
    return "Create the first execution artifact for this scenario.";
  }

  if (kind === TaskKind.REVIEW) {
    return "Review the scenario package, guardrails, and evidence before execution.";
  }

  if (kind === TaskKind.RESPOND) {
    return "Prepare and send the response through an approved execution path.";
  }

  if (kind === TaskKind.OUTREACH) {
    return "Coordinate the required outreach for this scenario.";
  }

  if (kind === TaskKind.PUBLISH) {
    return "Publish the approved artifact through an allowed target.";
  }

  if (kind === TaskKind.ESCALATE) {
    return "Escalate the blocker to the appropriate owner before continuing.";
  }

  if (kind === TaskKind.MEASURE) {
    return "Record the outcome and decide whether follow-up is needed.";
  }

  return "Qualify the scenario and complete the missing context.";
}

function buildTaskPlan(kind: TaskKind, title: string | null | undefined, summary: string): NextActionTaskPlan {
  const trimmedTitle = title?.trim();

  return {
    title: trimmedTitle && trimmedTitle.length > 0 ? trimmedTitle : summary,
    summary,
    kind,
    status: TaskStatus.TODO,
  };
}

export function resolveScenarioNextAction(input: {
  status: ScenarioStatus;
  proofReadiness: ProofReadiness;
  approvalStatus: ApprovalStatus;
  blockedReason: string | null;
  recommendedNextAction: string | null;
  defaultTaskKind: TaskKind | null;
}) {
  if (input.status === ScenarioStatus.ARCHIVED || input.status === ScenarioStatus.RESOLVED) {
    return {
      scenarioStatus: input.status,
      blockedReason: null,
      task: null,
      rationale: "Scenario is terminal, so no active task should remain.",
    } satisfies NextActionPlan;
  }

  if (input.status === ScenarioStatus.IN_OBSERVATION) {
    return {
      scenarioStatus: ScenarioStatus.IN_OBSERVATION,
      blockedReason: null,
      task: buildTaskPlan(
        TaskKind.MEASURE,
        input.recommendedNextAction,
        getDefaultTaskSummary(TaskKind.MEASURE),
      ),
      rationale: "Observation scenarios should roll into measurement rather than new execution work.",
    } satisfies NextActionPlan;
  }

  if (input.approvalStatus === ApprovalStatus.REJECTED) {
    return {
      scenarioStatus: ScenarioStatus.BLOCKED,
      blockedReason: input.blockedReason ?? "Execution was rejected and must be revised or escalated.",
      task: buildTaskPlan(
        TaskKind.ESCALATE,
        "Resolve the rejected approval before continuing.",
        "Execution is blocked until the rejected approval is addressed.",
      ),
      rationale: "Rejected approvals block execution and require escalation or revision.",
    } satisfies NextActionPlan;
  }

  if (input.proofReadiness === ProofReadiness.RESTRICTED) {
    return {
      scenarioStatus: ScenarioStatus.BLOCKED,
      blockedReason: input.blockedReason ?? "Proof exists but is restricted for this execution path.",
      task: buildTaskPlan(
        TaskKind.ESCALATE,
        "Resolve the restricted proof or choose a safe execution path.",
        "Execution is blocked by restricted proof or channel constraints.",
      ),
      rationale: "Restricted proof is a hard blocker until risk or channel constraints are resolved.",
    } satisfies NextActionPlan;
  }

  if (input.approvalStatus === ApprovalStatus.PENDING) {
    return {
      scenarioStatus: ScenarioStatus.BLOCKED,
      blockedReason: input.blockedReason ?? "An approval is still pending before execution can continue.",
      task: buildTaskPlan(
        TaskKind.REVIEW,
        "Secure approval before execution.",
        "Execution is blocked until the required approval is granted.",
      ),
      rationale: "Pending approvals block public-facing or governed work.",
    } satisfies NextActionPlan;
  }

  if (
    (input.status === ScenarioStatus.READY_FOR_DRAFT
      || input.status === ScenarioStatus.ACTIVE
      || input.status === ScenarioStatus.BLOCKED)
    && input.proofReadiness !== ProofReadiness.READY
  ) {
    return {
      scenarioStatus: ScenarioStatus.BLOCKED,
      blockedReason: input.blockedReason ?? "Required proof is incomplete for the next execution step.",
      task: buildTaskPlan(
        TaskKind.QUALIFY,
        "Close the proof gaps before execution.",
        "Execution is blocked until the required proof is complete and usable.",
      ),
      rationale: "Execution-ready scenarios should not progress until required proof is ready.",
    } satisfies NextActionPlan;
  }

  if (input.status === ScenarioStatus.INTAKE || input.status === ScenarioStatus.TRIAGE) {
    return {
      scenarioStatus: input.status,
      blockedReason: null,
      task: buildTaskPlan(
        TaskKind.QUALIFY,
        input.recommendedNextAction,
        getDefaultTaskSummary(TaskKind.QUALIFY),
      ),
      rationale: "Early-stage scenarios need qualification before downstream execution tasks.",
    } satisfies NextActionPlan;
  }

  const taskKind = input.defaultTaskKind ?? TaskKind.QUALIFY;

  return {
    scenarioStatus: ScenarioStatus.ACTIVE,
    blockedReason: null,
    task: buildTaskPlan(taskKind, input.recommendedNextAction, getDefaultTaskSummary(taskKind)),
    rationale: "Scenario is ready for the default playbook execution step.",
  } satisfies NextActionPlan;
}

function getDesiredTaskStatus(plan: NextActionPlan, existingTask: OpenTaskRecord | null) {
  if (!plan.task) {
    return null;
  }

  if (plan.scenarioStatus === ScenarioStatus.BLOCKED) {
    return TaskStatus.BLOCKED;
  }

  if (existingTask?.status === TaskStatus.IN_PROGRESS) {
    return TaskStatus.IN_PROGRESS;
  }

  return TaskStatus.TODO;
}

export async function syncScenarioTaskOrchestration(
  db: ScenarioOrchestrationDb,
  input: {
    scenarioId: string;
    actorId: string | null;
  },
) {
  const scenario = await db.scenario.findUnique({
    where: { id: input.scenarioId },
    select: {
      id: true,
      title: true,
      status: true,
      proofReadiness: true,
      approvalStatus: true,
      blockedReason: true,
      recommendedNextAction: true,
      ownerId: true,
      firstTaskAt: true,
      blockedAt: true,
      sourceOpportunity: {
        select: {
          dueDate: true,
        },
      },
      playbook: {
        select: {
          defaultTaskKind: true,
        },
      },
    },
  });

  if (!scenario) {
    throw new Error("Scenario not found.");
  }

  const plan = resolveScenarioNextAction({
    status: scenario.status,
    proofReadiness: scenario.proofReadiness,
    approvalStatus: scenario.approvalStatus,
    blockedReason: scenario.blockedReason,
    recommendedNextAction: scenario.recommendedNextAction,
    defaultTaskKind: scenario.playbook?.defaultTaskKind ?? null,
  });

  const openTasks = await db.task.findMany({
    where: {
      scenarioId: scenario.id,
      status: {
        in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED],
      },
    },
    orderBy: [{ createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      kind: true,
      status: true,
    },
  });

  const matchingTask = plan.task
    ? openTasks.find((task) => task.kind === plan.task?.kind)
    : null;
  const taskStatus = getDesiredTaskStatus(plan, matchingTask ?? null);

  let activeTaskId: string | null = null;
  let firstTaskAt = scenario.firstTaskAt;
  const blockedAt =
    plan.scenarioStatus === ScenarioStatus.BLOCKED
      ? scenario.blockedAt ?? new Date()
      : scenario.blockedAt;

  if (plan.task && taskStatus) {
    const taskData = {
      title: plan.task.title,
      summary: plan.task.summary,
      kind: plan.task.kind,
      status: taskStatus,
      ownerId: scenario.ownerId,
      dueAt: scenario.sourceOpportunity?.dueDate ?? null,
    };

    if (matchingTask) {
      const updatedTask = await db.task.update({
        where: { id: matchingTask.id },
        data: taskData,
        select: { id: true },
      });
      activeTaskId = updatedTask.id;
    } else {
      const createdAt = new Date();
      const createdTask = await db.task.create({
        data: {
          scenarioId: scenario.id,
          ...taskData,
          createdAt,
        },
        select: { id: true },
      });
      activeTaskId = createdTask.id;
      if (!firstTaskAt) {
        firstTaskAt = createdAt;
      }
    }
  }

  await db.scenario.update({
    where: { id: scenario.id },
    data: {
      status: plan.scenarioStatus,
      blockedReason: plan.blockedReason,
      blockedAt,
      firstTaskAt,
    },
  });

  const canceledTaskIds = openTasks
    .filter((task) => task.id !== activeTaskId)
    .map((task) => task.id);

  if (canceledTaskIds.length > 0) {
    await db.task.updateMany({
      where: {
        id: {
          in: canceledTaskIds,
        },
      },
      data: {
        status: TaskStatus.CANCELED,
      },
    });
  }

  await db.auditEvent.create({
    data: {
      entityType: "Scenario",
      entityId: scenario.id,
      action: "next_action_orchestrated",
      actorId: input.actorId,
      payload: {
        scenarioStatus: plan.scenarioStatus,
        blockedReason: plan.blockedReason,
        taskId: activeTaskId,
        taskKind: plan.task?.kind ?? null,
        rationale: plan.rationale,
        canceledTaskIds,
      } as Prisma.InputJsonValue,
    },
  });

  return {
    scenarioStatus: plan.scenarioStatus,
    blockedReason: plan.blockedReason,
    activeTaskId,
    canceledTaskIds,
  };
}
