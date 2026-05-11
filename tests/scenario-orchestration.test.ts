import {
  ApprovalStatus,
  ProofReadiness,
  ScenarioStatus,
  TaskKind,
  TaskStatus,
} from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

import {
  resolveScenarioNextAction,
  syncScenarioTaskOrchestration,
} from "@/server/scenarios/orchestration";

describe("scenario orchestration", () => {
  it("keeps intake and triage scenarios on qualification work", () => {
    expect(
      resolveScenarioNextAction({
        status: ScenarioStatus.TRIAGE,
        proofReadiness: ProofReadiness.PARTIAL,
        approvalStatus: ApprovalStatus.NOT_REQUIRED,
        blockedReason: null,
        recommendedNextAction: "Confirm the signal and tighten the brief.",
        defaultTaskKind: TaskKind.DRAFT,
      }),
    ).toMatchObject({
      scenarioStatus: ScenarioStatus.TRIAGE,
      blockedReason: null,
      task: {
        kind: TaskKind.QUALIFY,
        title: "Confirm the signal and tighten the brief.",
      },
    });
  });

  it("blocks execution-ready scenarios when proof is incomplete", () => {
    expect(
      resolveScenarioNextAction({
        status: ScenarioStatus.READY_FOR_DRAFT,
        proofReadiness: ProofReadiness.PARTIAL,
        approvalStatus: ApprovalStatus.NOT_REQUIRED,
        blockedReason: "Methodology proof is still incomplete.",
        recommendedNextAction: "Draft the comparison page.",
        defaultTaskKind: TaskKind.DRAFT,
      }),
    ).toMatchObject({
      scenarioStatus: ScenarioStatus.BLOCKED,
      blockedReason: "Methodology proof is still incomplete.",
      task: {
        kind: TaskKind.QUALIFY,
        title: "Close the proof gaps before execution.",
      },
    });
  });

  it("activates the playbook default task once the scenario is ready", () => {
    expect(
      resolveScenarioNextAction({
        status: ScenarioStatus.READY_FOR_DRAFT,
        proofReadiness: ProofReadiness.READY,
        approvalStatus: ApprovalStatus.NOT_REQUIRED,
        blockedReason: null,
        recommendedNextAction: "Draft the comparison page.",
        defaultTaskKind: TaskKind.DRAFT,
      }),
    ).toMatchObject({
      scenarioStatus: ScenarioStatus.ACTIVE,
      blockedReason: null,
      task: {
        kind: TaskKind.DRAFT,
        title: "Draft the comparison page.",
      },
    });
  });

  it("creates or updates one active orchestrated task and cancels stale open work", async () => {
    const scenarioUpdate = vi.fn().mockResolvedValue(undefined);
    const taskCreate = vi.fn().mockResolvedValue({ id: "task-2" });
    const taskUpdate = vi.fn().mockResolvedValue({ id: "task-1" });
    const taskUpdateMany = vi.fn().mockResolvedValue(undefined);
    const auditCreate = vi.fn().mockResolvedValue(undefined);

    const result = await syncScenarioTaskOrchestration(
      {
        scenario: {
          findUnique: vi.fn().mockResolvedValue({
            id: "scenario-1",
            title: "Trust proof refresh",
            status: ScenarioStatus.READY_FOR_DRAFT,
            proofReadiness: ProofReadiness.READY,
            approvalStatus: ApprovalStatus.NOT_REQUIRED,
            blockedReason: null,
            recommendedNextAction: "Draft the trust update.",
            ownerId: "user-1",
            firstTaskAt: null,
            blockedAt: null,
            sourceOpportunity: {
              dueDate: new Date("2026-05-14T00:00:00.000Z"),
            },
            playbook: {
              defaultTaskKind: TaskKind.DRAFT,
            },
          }),
          update: scenarioUpdate,
        },
        task: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: "task-1",
              title: "Old qualification task",
              kind: TaskKind.QUALIFY,
              status: TaskStatus.IN_PROGRESS,
            },
            {
              id: "task-stale",
              title: "Old review task",
              kind: TaskKind.REVIEW,
              status: TaskStatus.TODO,
            },
          ]),
          create: taskCreate,
          update: taskUpdate,
          updateMany: taskUpdateMany,
        },
        auditEvent: {
          create: auditCreate,
        },
      },
      {
        scenarioId: "scenario-1",
        actorId: "user-1",
      },
    );

    expect(scenarioUpdate).toHaveBeenCalledWith({
      where: { id: "scenario-1" },
      data: {
        status: ScenarioStatus.ACTIVE,
        blockedReason: null,
        blockedAt: null,
        firstTaskAt: expect.any(Date),
      },
    });

    expect(taskCreate).toHaveBeenCalledWith({
      data: {
        scenarioId: "scenario-1",
        title: "Draft the trust update.",
        summary: "Create the first execution artifact for this scenario.",
        kind: TaskKind.DRAFT,
        status: TaskStatus.TODO,
        ownerId: "user-1",
        dueAt: new Date("2026-05-14T00:00:00.000Z"),
        createdAt: expect.any(Date),
      },
      select: { id: true },
    });

    expect(taskUpdate).not.toHaveBeenCalled();
    expect(taskUpdateMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: ["task-1", "task-stale"],
        },
      },
      data: {
        status: TaskStatus.CANCELED,
      },
    });

    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        entityType: "Scenario",
        entityId: "scenario-1",
        action: "next_action_orchestrated",
        actorId: "user-1",
      }),
    });

    expect(result).toEqual({
      scenarioStatus: ScenarioStatus.ACTIVE,
      blockedReason: null,
      activeTaskId: "task-2",
      canceledTaskIds: ["task-1", "task-stale"],
    });
  });

  it("reuses the matching task kind and preserves in-progress state", async () => {
    const taskUpdate = vi.fn().mockResolvedValue({ id: "task-1" });

    await syncScenarioTaskOrchestration(
      {
        scenario: {
          findUnique: vi.fn().mockResolvedValue({
            id: "scenario-1",
            title: "Comparison refresh",
            status: ScenarioStatus.ACTIVE,
            proofReadiness: ProofReadiness.READY,
            approvalStatus: ApprovalStatus.NOT_REQUIRED,
            blockedReason: null,
            recommendedNextAction: "Draft the comparison update.",
            ownerId: "user-1",
            firstTaskAt: new Date("2026-05-09T12:00:00.000Z"),
            blockedAt: null,
            sourceOpportunity: {
              dueDate: null,
            },
            playbook: {
              defaultTaskKind: TaskKind.DRAFT,
            },
          }),
          update: vi.fn().mockResolvedValue(undefined),
        },
        task: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: "task-1",
              title: "Existing draft task",
              kind: TaskKind.DRAFT,
              status: TaskStatus.IN_PROGRESS,
            },
          ]),
          create: vi.fn().mockResolvedValue({ id: "task-new" }),
          update: taskUpdate,
          updateMany: vi.fn().mockResolvedValue(undefined),
        },
        auditEvent: {
          create: vi.fn().mockResolvedValue(undefined),
        },
      },
      {
        scenarioId: "scenario-1",
        actorId: "user-1",
      },
    );

    expect(taskUpdate).toHaveBeenCalledWith({
      where: { id: "task-1" },
      data: {
        title: "Draft the comparison update.",
        summary: "Create the first execution artifact for this scenario.",
        kind: TaskKind.DRAFT,
        status: TaskStatus.IN_PROGRESS,
        ownerId: "user-1",
        dueAt: null,
      },
      select: { id: true },
    });
  });
});
