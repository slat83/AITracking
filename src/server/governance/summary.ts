import { ProofReadiness, PrerequisiteType } from "@prisma/client";

import type { AppRole } from "@/server/auth/roles";

type GovernanceEvidenceAsset = {
  proofAssetType: string;
  readiness: ProofReadiness;
  restrictedChannels: string[];
  allowedUsage: string | null;
};

type GovernancePrerequisite = {
  prerequisiteType: PrerequisiteType;
  requiredProofAssetType: string | null;
  ownerRole: string | null;
  isRequired: boolean;
};

export type TemplateGovernanceInput = {
  id: string;
  name: string;
  family: string;
  launchPack: string | null;
  launchLabel: string | null;
  evidenceAssets: GovernanceEvidenceAsset[];
  prerequisites: GovernancePrerequisite[];
};

export type TemplateSafetyStatus =
  | "needs-proof"
  | "approval-gated"
  | "restricted"
  | "ready";

export type TemplateGovernanceSummary = {
  id: string;
  name: string;
  family: string;
  launchPack: string | null;
  launchLabel: string | null;
  safetyStatus: TemplateSafetyStatus;
  safetyLabel: string;
  evidenceAssetCount: number;
  requiredProofCount: number;
  coveredProofCount: number;
  missingProofTypes: string[];
  restrictedChannelCount: number;
  restrictedChannels: string[];
  hasApprovalPrerequisite: boolean;
  ownerRoles: string[];
  allowedUsageNotes: string[];
};

export type ChannelRestrictionSummary = {
  channel: string;
  templateCount: number;
  templateNames: string[];
};

export type GovernanceCapability = {
  action: string;
  currentRoleCoverage: string;
  recommendedScope: string;
  operatingRule: string;
};

function normalizeChannelName(value: string) {
  return value.trim().toLowerCase();
}

function uniqueSorted(values: Iterable<string>) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

export function summarizeTemplateGovernance(
  templates: TemplateGovernanceInput[],
): TemplateGovernanceSummary[] {
  return templates.map((template) => {
    const requiredProofTypes = uniqueSorted(
      template.prerequisites
        .filter(
          (prerequisite) =>
            prerequisite.isRequired
            && prerequisite.prerequisiteType === PrerequisiteType.EVIDENCE
            && prerequisite.requiredProofAssetType,
        )
        .map((prerequisite) => prerequisite.requiredProofAssetType as string),
    );

    const coveredProofTypes = uniqueSorted(
      template.evidenceAssets
        .filter((asset) => asset.readiness === ProofReadiness.READY || asset.readiness === ProofReadiness.RESTRICTED)
        .map((asset) => asset.proofAssetType),
    );

    const missingProofTypes = requiredProofTypes.filter(
      (proofAssetType) => !coveredProofTypes.includes(proofAssetType),
    );

    const restrictedChannels = uniqueSorted(
      template.evidenceAssets.flatMap((asset) =>
        asset.restrictedChannels.map((channel) => normalizeChannelName(channel))),
    );

    const hasApprovalPrerequisite = template.prerequisites.some(
      (prerequisite) =>
        prerequisite.isRequired && prerequisite.prerequisiteType === PrerequisiteType.APPROVAL,
    );

    const ownerRoles = uniqueSorted(
      template.prerequisites
        .map((prerequisite) => prerequisite.ownerRole?.trim())
        .filter((role): role is string => Boolean(role)),
    );

    const allowedUsageNotes = uniqueSorted(
      template.evidenceAssets
        .map((asset) => asset.allowedUsage?.trim())
        .filter((note): note is string => Boolean(note)),
    );

    let safetyStatus: TemplateSafetyStatus = "ready";

    if (missingProofTypes.length > 0) {
      safetyStatus = "needs-proof";
    } else if (hasApprovalPrerequisite) {
      safetyStatus = "approval-gated";
    } else if (restrictedChannels.length > 0) {
      safetyStatus = "restricted";
    }

    return {
      id: template.id,
      name: template.name,
      family: template.family,
      launchPack: template.launchPack,
      launchLabel: template.launchLabel,
      safetyStatus,
      safetyLabel:
        safetyStatus === "needs-proof"
          ? "Needs proof coverage"
          : safetyStatus === "approval-gated"
            ? "Approval gated"
            : safetyStatus === "restricted"
              ? "Restricted channels"
              : "Ready with guardrails",
      evidenceAssetCount: template.evidenceAssets.length,
      requiredProofCount: requiredProofTypes.length,
      coveredProofCount: coveredProofTypes.filter((proofType) => requiredProofTypes.includes(proofType)).length,
      missingProofTypes,
      restrictedChannelCount: restrictedChannels.length,
      restrictedChannels,
      hasApprovalPrerequisite,
      ownerRoles,
      allowedUsageNotes,
    };
  });
}

export function summarizeRestrictedChannels(
  templates: TemplateGovernanceSummary[],
): ChannelRestrictionSummary[] {
  const channelMap = new Map<string, ChannelRestrictionSummary>();

  for (const template of templates) {
    for (const channel of template.restrictedChannels) {
      const existing = channelMap.get(channel);

      if (existing) {
        existing.templateCount += 1;
        existing.templateNames = uniqueSorted([...existing.templateNames, template.name]);
        continue;
      }

      channelMap.set(channel, {
        channel,
        templateCount: 1,
        templateNames: [template.name],
      });
    }
  }

  return [...channelMap.values()].sort((left, right) => left.channel.localeCompare(right.channel));
}

export function getGovernanceCapabilities(): GovernanceCapability[] {
  const currentRoles: Record<AppRole, string> = {
    ADMIN: "Admin",
    EDITOR: "Editor",
    VIEWER: "Viewer",
  };

  return [
    {
      action: "Approve governed work",
      currentRoleCoverage: currentRoles.ADMIN,
      recommendedScope: "Reviewer or admin, separated from drafting",
      operatingRule: "Public-facing or policy-sensitive work should clear an explicit approval gate.",
    },
    {
      action: "Publish to approved targets",
      currentRoleCoverage: `${currentRoles.ADMIN} + ${currentRoles.EDITOR}`,
      recommendedScope: "Channel manager on specific targets, with audit trail",
      operatingRule: "Public execution stays manual and tied to an approved owner and account.",
    },
    {
      action: "Respond in public or community channels",
      currentRoleCoverage: `${currentRoles.ADMIN} + ${currentRoles.EDITOR}`,
      recommendedScope: "Scenario operator plus target-specific channel authorization",
      operatingRule: "Trust, comparison, and community responses should stay evidence-backed and target-scoped.",
    },
    {
      action: "Reassign or override blocked work",
      currentRoleCoverage: currentRoles.ADMIN,
      recommendedScope: "Admin or escalation owner with reason capture",
      operatingRule: "Overrides should remain auditable instead of hiding risk transitions.",
    },
  ];
}
