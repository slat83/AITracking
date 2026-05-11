import { ProofReadiness, PrerequisiteType } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  getGovernanceCapabilities,
  summarizeRestrictedChannels,
  summarizeTemplateGovernance,
} from "@/server/governance/summary";

describe("governance summary", () => {
  it("marks templates with missing proof, approvals, and channel restrictions", () => {
    const summaries = summarizeTemplateGovernance([
      {
        id: "template-1",
        name: "Trust center",
        family: "Trust",
        launchPack: "EpicVIN",
        launchLabel: "Is it legit",
        evidenceAssets: [
          {
            proofAssetType: "trust proof",
            readiness: ProofReadiness.READY,
            restrictedChannels: [],
            allowedUsage: "Public trust pages.",
          },
        ],
        prerequisites: [
          {
            prerequisiteType: PrerequisiteType.EVIDENCE,
            requiredProofAssetType: "trust proof",
            ownerRole: "EDITOR",
            isRequired: true,
          },
        ],
      },
      {
        id: "template-2",
        name: "Comparison brief",
        family: "Comparison",
        launchPack: "EpicVIN",
        launchLabel: "EpicVIN vs Carfax",
        evidenceAssets: [
          {
            proofAssetType: "approval proof",
            readiness: ProofReadiness.RESTRICTED,
            restrictedChannels: ["community", "paid-ads"],
            allowedUsage: "Approved public comparison copy only.",
          },
        ],
        prerequisites: [
          {
            prerequisiteType: PrerequisiteType.EVIDENCE,
            requiredProofAssetType: "approval proof",
            ownerRole: "ADMIN",
            isRequired: true,
          },
          {
            prerequisiteType: PrerequisiteType.APPROVAL,
            requiredProofAssetType: null,
            ownerRole: "ADMIN",
            isRequired: true,
          },
        ],
      },
      {
        id: "template-3",
        name: "Pricing refresh",
        family: "Pricing",
        launchPack: "EpicVIN",
        launchLabel: "Cheap VIN check",
        evidenceAssets: [],
        prerequisites: [
          {
            prerequisiteType: PrerequisiteType.EVIDENCE,
            requiredProofAssetType: "pricing proof",
            ownerRole: "EDITOR",
            isRequired: true,
          },
        ],
      },
    ]);

    expect(summaries.map((summary) => [summary.id, summary.safetyStatus])).toEqual([
      ["template-1", "ready"],
      ["template-2", "approval-gated"],
      ["template-3", "needs-proof"],
    ]);
    expect(summaries[1]?.restrictedChannels).toEqual(["community", "paid-ads"]);
    expect(summaries[2]?.missingProofTypes).toEqual(["pricing proof"]);
  });

  it("groups restricted channels across governed templates", () => {
    const restrictedChannels = summarizeRestrictedChannels(
      summarizeTemplateGovernance([
        {
          id: "template-1",
          name: "Comparison brief",
          family: "Comparison",
          launchPack: "EpicVIN",
          launchLabel: null,
          evidenceAssets: [
            {
              proofAssetType: "approval proof",
              readiness: ProofReadiness.RESTRICTED,
              restrictedChannels: ["community", "paid-ads"],
              allowedUsage: "Approved public comparison copy only.",
            },
          ],
          prerequisites: [],
        },
        {
          id: "template-2",
          name: "Founder post",
          family: "Distribution",
          launchPack: "EpicVIN",
          launchLabel: null,
          evidenceAssets: [
            {
              proofAssetType: "disclosure proof",
              readiness: ProofReadiness.READY,
              restrictedChannels: ["community"],
              allowedUsage: "Disclosed founder channels only.",
            },
          ],
          prerequisites: [],
        },
      ]),
    );

    expect(restrictedChannels).toEqual([
      {
        channel: "community",
        templateCount: 2,
        templateNames: ["Comparison brief", "Founder post"],
      },
      {
        channel: "paid-ads",
        templateCount: 1,
        templateNames: ["Comparison brief"],
      },
    ]);
  });

  it("keeps the coarse-role governance capabilities explicit", () => {
    expect(getGovernanceCapabilities()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: "Approve governed work",
          currentRoleCoverage: "Admin",
        }),
        expect.objectContaining({
          action: "Publish to approved targets",
          currentRoleCoverage: "Admin + Editor",
        }),
      ]),
    );
  });
});
