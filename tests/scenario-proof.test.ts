import {
  ProofReadiness,
  PrerequisiteType,
  ScenarioPrerequisiteStatus,
} from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

import {
  getScenarioPrerequisiteStatus,
  getScenarioProofReadiness,
  syncScenarioProofState,
} from "@/server/scenarios/proof";

describe("scenario proof service", () => {
  it("maps evidence readiness onto prerequisite status", () => {
    expect(
      getScenarioPrerequisiteStatus({
        prerequisiteType: PrerequisiteType.EVIDENCE,
        evidenceAsset: {
          id: "asset-1",
          proofAssetType: "methodology",
          readiness: ProofReadiness.READY,
          title: "Methodology proof",
        },
      }),
    ).toEqual({
      status: ScenarioPrerequisiteStatus.SATISFIED,
      blockingReason: null,
    });

    expect(
      getScenarioPrerequisiteStatus({
        prerequisiteType: PrerequisiteType.EVIDENCE,
        evidenceAsset: {
          id: "asset-2",
          proofAssetType: "approval proof",
          readiness: ProofReadiness.RESTRICTED,
          title: "Approval record",
        },
      }),
    ).toEqual({
      status: ScenarioPrerequisiteStatus.BLOCKED,
      blockingReason: "Approval record exists but is restricted for some usage contexts.",
    });
  });

  it("derives proof readiness from required prerequisite status", () => {
    expect(
      getScenarioProofReadiness([
        { isRequired: true, status: ScenarioPrerequisiteStatus.MISSING },
        { isRequired: true, status: ScenarioPrerequisiteStatus.MISSING },
      ]),
    ).toBe(ProofReadiness.MISSING);

    expect(
      getScenarioProofReadiness([
        { isRequired: true, status: ScenarioPrerequisiteStatus.SATISFIED },
        { isRequired: true, status: ScenarioPrerequisiteStatus.MISSING },
      ]),
    ).toBe(ProofReadiness.PARTIAL);

    expect(
      getScenarioProofReadiness([
        { isRequired: true, status: ScenarioPrerequisiteStatus.SATISFIED },
        { isRequired: true, status: ScenarioPrerequisiteStatus.BLOCKED },
      ]),
    ).toBe(ProofReadiness.RESTRICTED);

    expect(
      getScenarioProofReadiness([
        { isRequired: true, status: ScenarioPrerequisiteStatus.SATISFIED },
        { isRequired: true, status: ScenarioPrerequisiteStatus.WAIVED },
      ]),
    ).toBe(ProofReadiness.READY);
  });

  it("materializes playbook prerequisites and updates scenario proof readiness", async () => {
    const scenarioUpdate = vi.fn().mockResolvedValue(undefined);
    const prerequisiteUpsert = vi.fn().mockResolvedValue(undefined);
    const prerequisiteDeleteMany = vi.fn().mockResolvedValue(undefined);
    const auditCreate = vi.fn().mockResolvedValue(undefined);

    const result = await syncScenarioProofState(
      {
        scenario: {
          findUnique: vi.fn().mockResolvedValue({
            id: "scenario-1",
            playbookId: "playbook-1",
            blockedAt: null,
            evidenceLinks: [
              {
                isPrimary: true,
                evidenceAsset: {
                  id: "asset-1",
                  proofAssetType: "methodology",
                  readiness: ProofReadiness.READY,
                  title: "Methodology proof",
                },
              },
              {
                isPrimary: false,
                evidenceAsset: {
                  id: "asset-2",
                  proofAssetType: "approval proof",
                  readiness: ProofReadiness.RESTRICTED,
                  title: "Approval record",
                },
              },
            ],
          }),
          update: scenarioUpdate,
        },
        playbookPrerequisite: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: "prereq-1",
              title: "Methodology proof is linked",
              description: "Need methodology proof.",
              prerequisiteType: PrerequisiteType.EVIDENCE,
              requiredProofAssetType: "methodology",
              ownerRole: "EDITOR",
              isRequired: true,
            },
            {
              id: "prereq-2",
              title: "Approval proof is linked",
              description: "Need approval proof.",
              prerequisiteType: PrerequisiteType.EVIDENCE,
              requiredProofAssetType: "approval proof",
              ownerRole: "ADMIN",
              isRequired: true,
            },
          ]),
        },
        scenarioPrerequisite: {
          upsert: prerequisiteUpsert,
          deleteMany: prerequisiteDeleteMany,
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

    expect(prerequisiteUpsert).toHaveBeenCalledTimes(2);
    expect(scenarioUpdate).toHaveBeenLastCalledWith({
      where: { id: "scenario-1" },
      data: {
        proofReadiness: ProofReadiness.RESTRICTED,
        blockedReason:
          "Approval proof is linked: Approval record exists but is restricted for some usage contexts.",
        blockedAt: expect.any(Date),
      },
    });
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        entityType: "Scenario",
        entityId: "scenario-1",
        action: "proof_state_synced",
        actorId: "user-1",
      }),
    });
    expect(result).toEqual({
      proofReadiness: ProofReadiness.RESTRICTED,
      blockedReason:
        "Approval proof is linked: Approval record exists but is restricted for some usage contexts.",
      prerequisitesSynced: 2,
    });
  });
});
