import { OpportunityPriority, OpportunityStatus, ScenarioStatus } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

import {
  buildScenarioTypeLookupKey,
  getScenarioTypeOptionLabel,
  mapOpportunityStatusToScenarioStatus,
  syncScenarioFromOpportunity,
} from "@/server/scenarios/service";

describe("scenario service", () => {
  it("uses launch labels for operator-facing scenario options when available", () => {
    expect(
      getScenarioTypeOptionLabel({
        name: "Trust and legitimacy validation",
        launchLabel: "is EpicVIN legit",
      }),
    ).toBe("is EpicVIN legit");
  });

  it("normalizes scenario lookup keys", () => {
    expect(buildScenarioTypeLookupKey("  EpicVIN vs Carfax ")).toBe("epicvin vs carfax");
  });

  it("maps opportunity states onto scenario states", () => {
    expect(mapOpportunityStatusToScenarioStatus(OpportunityStatus.INTAKE)).toBe(ScenarioStatus.INTAKE);
    expect(mapOpportunityStatusToScenarioStatus(OpportunityStatus.TRIAGE)).toBe(ScenarioStatus.TRIAGE);
    expect(mapOpportunityStatusToScenarioStatus(OpportunityStatus.READY_FOR_DRAFT)).toBe(
      ScenarioStatus.READY_FOR_DRAFT,
    );
    expect(mapOpportunityStatusToScenarioStatus(OpportunityStatus.ARCHIVED)).toBe(ScenarioStatus.ARCHIVED);
  });

  it("creates or updates a linked scenario from an opportunity record", async () => {
    const scenarioUpsert = vi.fn().mockResolvedValue({ id: "scenario-1" });
    const auditCreate = vi.fn().mockResolvedValue(undefined);

    await syncScenarioFromOpportunity(
      {
        workspace: {
          upsert: vi.fn().mockResolvedValue({ id: "workspace-1" }),
        },
        account: {
          upsert: vi.fn().mockResolvedValue({ id: "account-1" }),
        },
        scenarioType: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: "type-1",
              slug: "trust-and-legitimacy-validation",
              name: "Trust and legitimacy validation",
              family: "trust_and_legitimacy_validation",
              launchLabel: "is EpicVIN legit",
              isActive: true,
            },
          ]),
        },
        playbook: {
          findFirst: vi.fn().mockResolvedValue({
            id: "playbook-1",
            recommendedNextAction: "Gather proof and update trust assets.",
          }),
        },
        scenario: {
          findUnique: vi.fn().mockResolvedValue(null),
          upsert: scenarioUpsert,
        },
        auditEvent: {
          create: auditCreate,
        },
      },
      {
        actorId: "user-1",
        opportunity: {
          id: "opp-1",
          title: "Launch customer proof queue",
          summary: "Capture early customer stories and route them into draft production.",
          sourceName: "Manual intake",
          scenario: "is EpicVIN legit",
          whyNow: "Trust objections are blocking comparison flow.",
          suggestedAssetAngle: "Build a customer-proof queue for trust assets.",
          briefQuestion: "What proof would improve buyer trust?",
          proofRequirement: "Use customer proof only.",
          status: OpportunityStatus.TRIAGE,
          priority: OpportunityPriority.HIGH,
          ownerId: "user-1",
          capturedAt: new Date("2026-05-10T12:00:00.000Z"),
        },
      },
    );

    expect(scenarioUpsert).toHaveBeenCalledTimes(1);
    expect(scenarioUpsert.mock.calls[0][0].where).toEqual({
      sourceOpportunityId: "opp-1",
    });

    expect(scenarioUpsert.mock.calls[0][0].create).toMatchObject({
      title: "Launch customer proof queue",
      status: ScenarioStatus.TRIAGE,
      sourceOpportunity: {
        connect: { id: "opp-1" },
      },
      scenarioType: {
        connect: { id: "type-1" },
      },
      playbook: {
        connect: { id: "playbook-1" },
      },
    });

    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        entityType: "Scenario",
        entityId: "scenario-1",
        action: "synced_from_opportunity",
        actorId: "user-1",
      }),
    });
  });
});
