import { TaskKind, TaskStatus, UserRole } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

import { escalateScenario, reassignScenarioOwner } from "@/server/scenarios/mutations";

function makeScenario(overrides: Partial<{
  id: string;
  title: string;
  status: "ACTIVE" | "ARCHIVED" | "RESOLVED";
  ownerId: string | null;
  owner: { id: string; name: string } | null;
  dueDate: Date | null;
}> = {}) {
  return {
    id: overrides.id ?? "scenario-1",
    title: overrides.title ?? "Scenario one",
    status: overrides.status ?? "ACTIVE",
    ownerId: overrides.ownerId ?? "owner-1",
    owner: overrides.owner ?? { id: "owner-1", name: "Morgan" },
    sourceOpportunity: { dueDate: overrides.dueDate ?? new Date("2026-05-12T00:00:00.000Z") },
  };
}

function createDb({
  scenario = makeScenario(),
  users = {
    "owner-2": { id: "owner-2", name: "Avery", role: UserRole.EDITOR },
    "lead-1": { id: "lead-1", name: "Taylor", role: UserRole.ADMIN },
  } as Record<string, { id: string; name: string; role: UserRole }>,
  escalationTask = null as { id: string } | null,
} = {}) {
  return {
    scenario: {
      findUnique: vi.fn().mockResolvedValue(scenario),
      update: vi.fn().mockResolvedValue(undefined),
    },
    user: {
      findUnique: vi.fn().mockImplementation(({ where }: { where: { id: string } }) => Promise.resolve(users[where.id] ?? null)),
    },
    task: {
      findFirst: vi.fn().mockResolvedValue(escalationTask),
      create: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
    },
    auditEvent: {
      create: vi.fn().mockResolvedValue(undefined),
    },
  };
}

describe("scenario mutations", () => {
  it("reassigns the scenario owner and records an audit event", async () => {
    const db = createDb();

    await reassignScenarioOwner(db as never, {
      scenarioId: "scenario-1",
      actorId: "owner-1",
      actorRole: UserRole.EDITOR,
      newOwnerId: "owner-2",
      reason: "Morgan is out and Avery owns the next operator step.",
    });

    expect(db.scenario.update).toHaveBeenCalledWith({
      where: { id: "scenario-1" },
      data: { ownerId: "owner-2" },
    });
    expect(db.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        entityType: "Scenario",
        entityId: "scenario-1",
        action: "owner_reassigned",
        actorId: "owner-1",
      }),
    });
  });

  it("blocks no-op reassignment to the current owner", async () => {
    const db = createDb();

    await expect(
      reassignScenarioOwner(db as never, {
        scenarioId: "scenario-1",
        actorId: "owner-1",
        actorRole: UserRole.EDITOR,
        newOwnerId: "owner-1",
        reason: "Morgan is still the right owner for this step.",
      }),
    ).rejects.toThrow("Choose a different owner before submitting the reassignment.");
  });

  it("creates an escalation task and audit event", async () => {
    const db = createDb();

    await escalateScenario(db as never, {
      scenarioId: "scenario-1",
      actorId: "owner-1",
      actorRole: UserRole.EDITOR,
      escalationTargetId: "lead-1",
      escalationOwnerId: "lead-1",
      reason: "This needs admin review before the scenario can move forward.",
    });

    expect(db.task.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        scenarioId: "scenario-1",
        kind: TaskKind.ESCALATE,
        status: TaskStatus.IN_PROGRESS,
        ownerId: "lead-1",
      }),
    });
    expect(db.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        entityType: "Scenario",
        entityId: "scenario-1",
        action: "escalation_requested",
        actorId: "owner-1",
      }),
    });
  });

  it("updates the latest open escalation task when one already exists", async () => {
    const db = createDb({
      escalationTask: { id: "task-1" },
    });

    await escalateScenario(db as never, {
      scenarioId: "scenario-1",
      actorId: "owner-1",
      actorRole: UserRole.EDITOR,
      escalationTargetId: "lead-1",
      escalationOwnerId: "lead-1",
      reason: "The scenario is blocked pending cross-team approval.",
    });

    expect(db.task.update).toHaveBeenCalledWith({
      where: { id: "task-1" },
      data: expect.objectContaining({
        status: TaskStatus.IN_PROGRESS,
        ownerId: "lead-1",
      }),
    });
    expect(db.task.create).not.toHaveBeenCalled();
  });
});
