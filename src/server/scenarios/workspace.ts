import {
  ApprovalStatus,
  ArtifactStatus,
  DraftStatus,
  Prisma,
  ProofReadiness,
  ScenarioPrerequisiteStatus,
  ScenarioPriority,
  ScenarioStatus,
  ScenarioUrgency,
  TaskKind,
  TaskStatus,
  UserRole,
  type PrismaClient,
} from "@prisma/client";

export const WORKSPACE_VIEWS = [
  {
    key: "my-work",
    label: "My work",
    description: "Scenarios currently assigned to you.",
  },
  {
    key: "needs-triage",
    label: "Needs triage",
    description: "New and in-flight scenarios that still need qualification.",
  },
  {
    key: "waiting-on-approval",
    label: "Waiting on approval",
    description: "Scenarios paused on a pending approval decision.",
  },
  {
    key: "blocked",
    label: "Blocked",
    description: "Scenarios with proof, approval, or dependency blockers.",
  },
  {
    key: "recently-updated",
    label: "Recently updated",
    description: "Latest activity across the active scenario queue.",
  },
] as const;

export type WorkspaceViewKey = (typeof WORKSPACE_VIEWS)[number]["key"];

export const WORKSPACE_SORTS = [
  { key: "sla-risk", label: "SLA risk" },
  { key: "urgency", label: "Urgency" },
  { key: "evidence-readiness", label: "Evidence readiness" },
  { key: "approval-risk", label: "Approval risk" },
  { key: "last-activity", label: "Last activity" },
] as const;

export const WORKSPACE_FRESHNESS_WINDOWS = [
  { key: "any", label: "Any age", hours: null },
  { key: "4h", label: "Updated in 4h", hours: 4 },
  { key: "24h", label: "Updated in 24h", hours: 24 },
  { key: "3d", label: "Updated in 3d", hours: 72 },
  { key: "7d", label: "Updated in 7d", hours: 168 },
] as const;

export type WorkspaceSortKey = (typeof WORKSPACE_SORTS)[number]["key"];
export type WorkspaceFreshnessKey = (typeof WORKSPACE_FRESHNESS_WINDOWS)[number]["key"];

export type WorkspaceQueueFilters = {
  scenarioTypeId?: string;
  urgency?: ScenarioUrgency;
  ownerId?: string;
  accountId?: string;
  freshness: WorkspaceFreshnessKey;
  sort: WorkspaceSortKey;
};

export type WorkspaceQueueOption = {
  value: string;
  label: string;
};

export type WorkspaceQueueOptions = {
  scenarioTypes: WorkspaceQueueOption[];
  owners: WorkspaceQueueOption[];
  accounts: WorkspaceQueueOption[];
};

export type WorkspaceOwnershipOption = {
  value: string;
  label: string;
  role: UserRole;
};

export type WorkspaceOwnershipAuditEvent = {
  id: string;
  action: "owner_reassigned" | "escalation_requested";
  createdAt: Date;
  actorName: string | null;
  summary: string;
  detail: string;
  reason: string | null;
  anchorId: string;
  targetLabel: string;
};

const TERMINAL_SCENARIO_STATUSES = [ScenarioStatus.ARCHIVED, ScenarioStatus.RESOLVED] as const;
const TRIAGE_SCENARIO_STATUSES = [ScenarioStatus.INTAKE, ScenarioStatus.TRIAGE] as const;
const WORKSPACE_DEFAULT_SORT: WorkspaceSortKey = "sla-risk";

function isWorkspaceViewKey(value: string): value is WorkspaceViewKey {
  return WORKSPACE_VIEWS.some((view) => view.key === value);
}

function isWorkspaceSortKey(value: string): value is WorkspaceSortKey {
  return WORKSPACE_SORTS.some((sort) => sort.key === value);
}

function isWorkspaceFreshnessKey(value: string): value is WorkspaceFreshnessKey {
  return WORKSPACE_FRESHNESS_WINDOWS.some((window) => window.key === value);
}

function isScenarioUrgency(value: string): value is ScenarioUrgency {
  return Object.values(ScenarioUrgency).includes(value as ScenarioUrgency);
}

function getQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseWorkspaceView(value: string | string[] | undefined): WorkspaceViewKey {
  const selected = getQueryValue(value);
  return selected && isWorkspaceViewKey(selected) ? selected : "my-work";
}

export function getWorkspaceViewMeta(view: WorkspaceViewKey) {
  return WORKSPACE_VIEWS.find((item) => item.key === view) ?? WORKSPACE_VIEWS[0];
}

export function parseWorkspaceQueueFilters(params: Record<string, string | string[] | undefined>): WorkspaceQueueFilters {
  const scenarioTypeId = getQueryValue(params.scenarioType);
  const urgency = getQueryValue(params.urgency);
  const ownerId = getQueryValue(params.owner);
  const accountId = getQueryValue(params.account);
  const freshness = getQueryValue(params.freshness);
  const sort = getQueryValue(params.sort);

  return {
    scenarioTypeId: scenarioTypeId || undefined,
    urgency: urgency && isScenarioUrgency(urgency) ? urgency : undefined,
    ownerId: ownerId || undefined,
    accountId: accountId || undefined,
    freshness: freshness && isWorkspaceFreshnessKey(freshness) ? freshness : "any",
    sort: sort && isWorkspaceSortKey(sort) ? sort : WORKSPACE_DEFAULT_SORT,
  };
}

export const workspaceScenarioSelect = Prisma.validator<Prisma.ScenarioSelect>()({
  id: true,
  title: true,
  summary: true,
  status: true,
  priority: true,
  urgency: true,
  businessImpact: true,
  proofReadiness: true,
  approvalStatus: true,
  blockedReason: true,
  blockedAt: true,
  scenarioGoal: true,
  signalSummary: true,
  recommendedNextAction: true,
  approvalRequestedAt: true,
  approvalResolvedAt: true,
  capturedAt: true,
  createdAt: true,
  firstTaskAt: true,
  triagedAt: true,
  updatedAt: true,
  owner: {
    select: {
      id: true,
      name: true,
      role: true,
    },
  },
  account: {
    select: {
      id: true,
      name: true,
    },
  },
  scenarioType: {
    select: {
      id: true,
      name: true,
      family: true,
    },
  },
  playbook: {
    select: {
      id: true,
      name: true,
      summary: true,
      recommendedNextAction: true,
      proofGuidance: true,
    },
  },
  sourceOpportunity: {
    select: {
      id: true,
      title: true,
      sourceName: true,
      sourceUrl: true,
      whyNow: true,
      briefAudience: true,
      briefQuestion: true,
      proofRequirement: true,
      targetCta: true,
      status: true,
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
      dueDate: true,
      capturedAt: true,
      drafts: {
        orderBy: [{ updatedAt: "desc" }],
        select: {
          id: true,
          title: true,
          status: true,
          updatedAt: true,
          createdAt: true,
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  },
  tasks: {
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      summary: true,
      kind: true,
      status: true,
      dueAt: true,
      createdAt: true,
      updatedAt: true,
      owner: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  },
  artifacts: {
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      artifactType: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  evidenceLinks: {
    orderBy: [{ createdAt: "asc" }],
    select: {
      isPrimary: true,
      usageSummary: true,
      createdAt: true,
      evidenceAsset: {
        select: {
          id: true,
          title: true,
          proofAssetType: true,
          claimSupported: true,
          sourceUrl: true,
          readiness: true,
          allowedUsage: true,
          restrictedChannels: true,
          lastVerifiedAt: true,
        },
      },
    },
  },
  prerequisites: {
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      description: true,
      prerequisiteType: true,
      status: true,
      blockingReason: true,
      satisfiedAt: true,
      waivedAt: true,
      createdAt: true,
      updatedAt: true,
      owner: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
      playbookPrerequisite: {
        select: {
          ownerRole: true,
          requiredProofAssetType: true,
        },
      },
      evidenceAsset: {
        select: {
          id: true,
          title: true,
          proofAssetType: true,
          readiness: true,
        },
      },
    },
  },
  outcome: {
    select: {
      id: true,
      status: true,
      summary: true,
      observedAt: true,
      resolvedAt: true,
      updatedAt: true,
    },
  },
});

export type WorkspaceScenario = Prisma.ScenarioGetPayload<{
  select: typeof workspaceScenarioSelect;
}>;

export type WorkspaceChildArtifact = {
  id: string;
  title: string;
  artifactType: string;
  statusLabel: string;
  relationshipLabel: string;
  updatedAt: Date;
  createdAt: Date;
  source: "artifact" | "draft";
  ownerName: string | null;
};

export type WorkspaceModuleTone = "success" | "warning" | "danger" | "neutral";

export type WorkspaceBlockerModuleItem = {
  id: string;
  summary: string;
  typeLabel: string;
  ownerName: string | null;
  raisedAt: Date | null;
  linkedObjectLabel: string;
  note: string;
  tone: WorkspaceModuleTone;
};

export type WorkspaceApprovalModuleItem = {
  id: string;
  summary: string;
  statusLabel: string;
  typeLabel: string;
  approverName: string | null;
  targetLabel: string;
  requestedAt: Date | null;
  resolvedAt: Date | null;
  deadlineAt: Date | null;
  note: string;
  tone: WorkspaceModuleTone;
};

type ScenarioOwnershipAuditRecord = {
  id: string;
  action: string;
  createdAt: Date;
  payload: Prisma.JsonValue;
  actor: {
    id: string;
    name: string;
  } | null;
};

const WORKSPACE_OWNERSHIP_AUDIT_ACTIONS = ["owner_reassigned", "escalation_requested"] as const;

function getLegacyDraftStatusLabel(status: DraftStatus) {
  if (status === DraftStatus.OUTLINE) {
    return "Drafting";
  }

  if (status === DraftStatus.IN_REVIEW) {
    return "In review";
  }

  if (status === DraftStatus.APPROVED) {
    return "Approved";
  }

  if (status === DraftStatus.SCHEDULED) {
    return "Scheduled later";
  }

  return "Published later";
}

function getJsonString(payload: Prisma.JsonValue, key: string) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const value = payload[key as keyof typeof payload];
  return typeof value === "string" && value.trim() ? value : null;
}

function formatOwnershipAuditEvent(record: ScenarioOwnershipAuditRecord): WorkspaceOwnershipAuditEvent | null {
  if (record.action === "owner_reassigned") {
    const previousOwnerName = getJsonString(record.payload, "previousOwnerName");
    const newOwnerName = getJsonString(record.payload, "newOwnerName");
    const reason = getJsonString(record.payload, "reason");

    if (!newOwnerName) {
      return null;
    }

    return {
      id: record.id,
      action: "owner_reassigned",
      createdAt: record.createdAt,
      actorName: record.actor?.name ?? null,
      summary: `Reassigned to ${newOwnerName}`,
      detail: `${record.actor?.name ?? "System"} reassigned ownership${previousOwnerName ? ` from ${previousOwnerName}` : ""} to ${newOwnerName}.${reason ? ` Reason: ${reason}` : ""}`,
      reason,
      anchorId: `audit-${record.id}`,
      targetLabel: newOwnerName,
    };
  }

  if (record.action === "escalation_requested") {
    const escalationTargetName = getJsonString(record.payload, "escalationTargetName");
    const escalationOwnerName = getJsonString(record.payload, "escalationOwnerName");
    const reason = getJsonString(record.payload, "reason");

    if (!escalationTargetName) {
      return null;
    }

    return {
      id: record.id,
      action: "escalation_requested",
      createdAt: record.createdAt,
      actorName: record.actor?.name ?? null,
      summary: `Escalated to ${escalationTargetName}`,
      detail: `${record.actor?.name ?? "System"} escalated this scenario to ${escalationTargetName}${escalationOwnerName ? ` with ${escalationOwnerName} owning follow-through` : ""}.${reason ? ` Reason: ${reason}` : ""}`,
      reason,
      anchorId: `audit-${record.id}`,
      targetLabel: escalationTargetName,
    };
  }

  return null;
}

export function getWorkspaceOwnershipAuditEvents(records: ScenarioOwnershipAuditRecord[]) {
  return records
    .map(formatOwnershipAuditEvent)
    .filter((record): record is WorkspaceOwnershipAuditEvent => Boolean(record))
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
}

export function getLatestWorkspaceEscalation(events: WorkspaceOwnershipAuditEvent[]) {
  return events.find((event) => event.action === "escalation_requested") ?? null;
}

export function getWorkspaceChildArtifacts(scenario: WorkspaceScenario): WorkspaceChildArtifact[] {
  const scenarioArtifacts = scenario.artifacts.map((artifact) => ({
    id: artifact.id,
    title: artifact.title,
    artifactType: artifact.artifactType,
    statusLabel: artifact.status
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" "),
    relationshipLabel: "Created from this scenario",
    updatedAt: artifact.updatedAt,
    createdAt: artifact.createdAt,
    source: "artifact" as const,
    ownerName: artifact.createdBy?.name ?? null,
  }));

  const legacyDraftArtifacts = (scenario.sourceOpportunity?.drafts ?? []).map((draft) => ({
    id: `draft-${draft.id}`,
    title: draft.title,
    artifactType: "Draft",
    statusLabel: getLegacyDraftStatusLabel(draft.status),
    relationshipLabel: "Inherited from the source intake handoff",
    updatedAt: draft.updatedAt,
    createdAt: draft.createdAt,
    source: "draft" as const,
    ownerName: draft.reviewer?.name ?? draft.createdBy?.name ?? null,
  }));

  return [...scenarioArtifacts, ...legacyDraftArtifacts].sort(
    (left, right) => right.updatedAt.getTime() - left.updatedAt.getTime(),
  );
}

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getApprovalSupportTask(scenario: WorkspaceScenario) {
  return scenario.tasks.find((task) => task.kind === TaskKind.REVIEW || task.kind === TaskKind.ESCALATE) ?? null;
}

function getApprovalTargetLabel(scenario: WorkspaceScenario) {
  const primaryArtifact =
    scenario.artifacts.find((artifact) => artifact.status === ArtifactStatus.IN_REVIEW)
    ?? getWorkspaceChildArtifacts(scenario)[0]
    ?? null;

  return primaryArtifact?.title ?? scenario.title;
}

function getApprovalTypeLabel(scenario: WorkspaceScenario) {
  const hasApprovalProof =
    scenario.prerequisites.some((prerequisite) =>
      prerequisite.playbookPrerequisite?.requiredProofAssetType?.toLowerCase().includes("approval"),
    )
    || scenario.evidenceLinks.some((link) => link.evidenceAsset.proofAssetType.toLowerCase().includes("approval"));

  return hasApprovalProof ? "Approval proof" : "Execution approval";
}

function getApprovalApproverName(scenario: WorkspaceScenario) {
  return getApprovalSupportTask(scenario)?.owner?.name ?? scenario.sourceOpportunity?.owner?.name ?? null;
}

function getApprovalDeadlineAt(scenario: WorkspaceScenario) {
  return getApprovalSupportTask(scenario)?.dueAt ?? scenario.sourceOpportunity?.dueDate ?? null;
}

function getApprovalStatusLabel(status: ApprovalStatus) {
  if (status === ApprovalStatus.NOT_REQUIRED) {
    return "Not required";
  }

  return formatEnumLabel(status);
}

function getApprovalSummary(scenario: WorkspaceScenario, targetLabel: string) {
  if (scenario.approvalStatus === ApprovalStatus.PENDING) {
    return `Approval is pending before ${targetLabel} can move forward.`;
  }

  if (scenario.approvalStatus === ApprovalStatus.REJECTED) {
    return `Approval was rejected for ${targetLabel}.`;
  }

  if (scenario.approvalStatus === ApprovalStatus.APPROVED) {
    return `${targetLabel} is approved for use.`;
  }

  return `No approval gate is stopping ${targetLabel} right now.`;
}

function getApprovalNote(scenario: WorkspaceScenario) {
  if (scenario.approvalStatus === ApprovalStatus.PENDING) {
    return scenario.blockedReason ?? "Awaiting an approval decision before execution can continue.";
  }

  if (scenario.approvalStatus === ApprovalStatus.REJECTED) {
    return scenario.blockedReason ?? "Revise the current version or escalate before requesting approval again.";
  }

  if (scenario.approvalStatus === ApprovalStatus.APPROVED) {
    return "Approval has cleared the current execution path.";
  }

  return "Current next action does not require a separate approval step.";
}

function getApprovalTone(status: ApprovalStatus): WorkspaceModuleTone {
  if (status === ApprovalStatus.APPROVED || status === ApprovalStatus.NOT_REQUIRED) {
    return "success";
  }

  if (status === ApprovalStatus.PENDING) {
    return "warning";
  }

  return "danger";
}

function inferBlockerTypeFromReason(reason: string | null, scenario: WorkspaceScenario) {
  const normalizedReason = reason?.trim().toLowerCase() ?? "";

  if (
    scenario.approvalStatus === ApprovalStatus.PENDING
    || scenario.approvalStatus === ApprovalStatus.REJECTED
    || normalizedReason.includes("approval")
  ) {
    return "Missing approval";
  }

  if (
    scenario.proofReadiness === ProofReadiness.RESTRICTED
    || normalizedReason.includes("restricted")
    || normalizedReason.includes("channel")
  ) {
    return "Channel restriction";
  }

  if (normalizedReason.includes("proof") || normalizedReason.includes("evidence")) {
    return "Missing evidence";
  }

  return "External dependency";
}

function getPrerequisiteBlockerType(scenario: WorkspaceScenario, prerequisite: WorkspaceScenario["prerequisites"][number]) {
  if (prerequisite.prerequisiteType === "EVIDENCE") {
    return prerequisite.status === ScenarioPrerequisiteStatus.BLOCKED
      || prerequisite.evidenceAsset?.readiness === ProofReadiness.RESTRICTED
      ? "Channel restriction"
      : "Missing evidence";
  }

  return inferBlockerTypeFromReason(prerequisite.blockingReason, scenario);
}

export function getWorkspaceBlockers(scenario: WorkspaceScenario): WorkspaceBlockerModuleItem[] {
  const blockers: WorkspaceBlockerModuleItem[] = [];
  const approvalTargetLabel = getApprovalTargetLabel(scenario);
  const approvalApproverName = getApprovalApproverName(scenario);

  if (scenario.approvalStatus === ApprovalStatus.PENDING || scenario.approvalStatus === ApprovalStatus.REJECTED) {
    blockers.push({
      id: `approval-${scenario.id}`,
      summary:
        scenario.blockedReason
        ?? (scenario.approvalStatus === ApprovalStatus.PENDING
          ? `Approval is blocking ${approvalTargetLabel}.`
          : `Approval rejection is blocking ${approvalTargetLabel}.`),
      typeLabel: "Missing approval",
      ownerName:
        scenario.approvalStatus === ApprovalStatus.PENDING
          ? approvalApproverName ?? scenario.owner?.name ?? null
          : scenario.owner?.name ?? approvalApproverName ?? null,
      raisedAt: scenario.approvalRequestedAt ?? scenario.blockedAt ?? scenario.updatedAt,
      linkedObjectLabel: approvalTargetLabel,
      note:
        scenario.approvalStatus === ApprovalStatus.PENDING
          ? "Wait for the approver decision or follow up before execution resumes."
          : "Revise the scoped work or escalate before requesting approval again.",
      tone: scenario.approvalStatus === ApprovalStatus.PENDING ? "warning" : "danger",
    });
  }

  for (const prerequisite of scenario.prerequisites) {
    if (
      prerequisite.status !== ScenarioPrerequisiteStatus.BLOCKED
      && prerequisite.status !== ScenarioPrerequisiteStatus.MISSING
    ) {
      continue;
    }

    blockers.push({
      id: `prerequisite-${prerequisite.id}`,
      summary: prerequisite.blockingReason ?? `${prerequisite.title} is still required before execution can continue.`,
      typeLabel: getPrerequisiteBlockerType(scenario, prerequisite),
      ownerName: prerequisite.owner?.name ?? prerequisite.playbookPrerequisite?.ownerRole ?? scenario.owner?.name ?? null,
      raisedAt: prerequisite.updatedAt,
      linkedObjectLabel: prerequisite.evidenceAsset?.title ?? prerequisite.title,
      note: prerequisite.description ?? `Satisfy ${prerequisite.title} to clear the blocker.`,
      tone: prerequisite.status === ScenarioPrerequisiteStatus.BLOCKED ? "danger" : "warning",
    });
  }

  for (const task of scenario.tasks) {
    if (task.status !== TaskStatus.BLOCKED) {
      continue;
    }

    blockers.push({
      id: `task-${task.id}`,
      summary: task.summary ?? `${task.title} is blocked and needs intervention before work can continue.`,
      typeLabel: "External dependency",
      ownerName: task.owner?.name ?? scenario.owner?.name ?? null,
      raisedAt: task.updatedAt,
      linkedObjectLabel: task.title,
      note: task.summary ?? "Unblock or reassign the task before continuing execution.",
      tone: "danger",
    });
  }

  if (blockers.length === 0 && scenario.blockedReason) {
    blockers.push({
      id: `scenario-${scenario.id}`,
      summary: scenario.blockedReason,
      typeLabel: inferBlockerTypeFromReason(scenario.blockedReason, scenario),
      ownerName: scenario.owner?.name ?? null,
      raisedAt: scenario.blockedAt ?? scenario.updatedAt,
      linkedObjectLabel: approvalTargetLabel,
      note: "Review the next best action and clear this scenario-level blocker before proceeding.",
      tone: "danger",
    });
  }

  const deduped = new Map<string, WorkspaceBlockerModuleItem>();
  for (const blocker of blockers) {
    const key = `${blocker.summary}::${blocker.linkedObjectLabel}`;
    if (!deduped.has(key)) {
      deduped.set(key, blocker);
    }
  }

  return [...deduped.values()].sort(
    (left, right) => (right.raisedAt?.getTime() ?? 0) - (left.raisedAt?.getTime() ?? 0),
  );
}

export function getWorkspaceApprovals(scenario: WorkspaceScenario): WorkspaceApprovalModuleItem[] {
  const targetLabel = getApprovalTargetLabel(scenario);

  return [
    {
      id: `approval-state-${scenario.id}`,
      summary: getApprovalSummary(scenario, targetLabel),
      statusLabel: getApprovalStatusLabel(scenario.approvalStatus),
      typeLabel: getApprovalTypeLabel(scenario),
      approverName: getApprovalApproverName(scenario),
      targetLabel,
      requestedAt: scenario.approvalRequestedAt ?? null,
      resolvedAt: scenario.approvalResolvedAt ?? null,
      deadlineAt: getApprovalDeadlineAt(scenario),
      note: getApprovalNote(scenario),
      tone: getApprovalTone(scenario.approvalStatus),
    },
  ];
}

function getWorkspaceViewWhere(view: WorkspaceViewKey, userId: string) {
  if (view === "my-work") {
    return {
      ownerId: userId,
      status: {
        notIn: [...TERMINAL_SCENARIO_STATUSES],
      },
    };
  }

  if (view === "needs-triage") {
    return {
      status: {
        in: [...TRIAGE_SCENARIO_STATUSES],
      },
    };
  }

  if (view === "waiting-on-approval") {
    return {
      approvalStatus: ApprovalStatus.PENDING,
      status: {
        notIn: [...TERMINAL_SCENARIO_STATUSES],
      },
    };
  }

  if (view === "blocked") {
    return {
      status: {
        notIn: [...TERMINAL_SCENARIO_STATUSES],
      },
      OR: [
        {
          status: ScenarioStatus.BLOCKED,
        },
        {
          approvalStatus: ApprovalStatus.PENDING,
        },
        {
          approvalStatus: ApprovalStatus.REJECTED,
        },
        {
          proofReadiness: ProofReadiness.RESTRICTED,
        },
        {
          blockedReason: {
            not: null,
          },
        },
      ],
    };
  }

  return {
    status: {
      notIn: [...TERMINAL_SCENARIO_STATUSES],
    },
  };
}

function getWorkspaceFreshnessDate(freshness: WorkspaceFreshnessKey) {
  const window = WORKSPACE_FRESHNESS_WINDOWS.find((entry) => entry.key === freshness);
  if (!window?.hours) {
    return null;
  }

  return new Date(Date.now() - window.hours * 60 * 60 * 1000);
}

function getWorkspaceQueueWhere(
  view: WorkspaceViewKey,
  userId: string,
  filters: WorkspaceQueueFilters,
): Prisma.ScenarioWhereInput {
  const and: Prisma.ScenarioWhereInput[] = [getWorkspaceViewWhere(view, userId)];

  if (filters.scenarioTypeId) {
    and.push({ scenarioTypeId: filters.scenarioTypeId });
  }

  if (filters.urgency) {
    and.push({ urgency: filters.urgency });
  }

  if (filters.ownerId) {
    and.push({ ownerId: filters.ownerId });
  }

  if (filters.accountId) {
    and.push({ accountId: filters.accountId });
  }

  const freshnessDate = getWorkspaceFreshnessDate(filters.freshness);
  if (freshnessDate) {
    and.push({
      updatedAt: {
        gte: freshnessDate,
      },
    });
  }

  return and.length === 1 ? and[0] : { AND: and };
}

function getUrgencyRank(value: ScenarioUrgency) {
  if (value === ScenarioUrgency.HIGH) {
    return 3;
  }

  if (value === ScenarioUrgency.MEDIUM) {
    return 2;
  }

  return 1;
}

function getPriorityRank(value: ScenarioPriority) {
  if (value === ScenarioPriority.HIGH) {
    return 3;
  }

  if (value === ScenarioPriority.MEDIUM) {
    return 2;
  }

  return 1;
}

function getProofRiskRank(value: ProofReadiness) {
  if (value === ProofReadiness.RESTRICTED) {
    return 4;
  }

  if (value === ProofReadiness.MISSING) {
    return 3;
  }

  if (value === ProofReadiness.PARTIAL) {
    return 2;
  }

  return 1;
}

function getApprovalRiskRank(value: ApprovalStatus) {
  if (value === ApprovalStatus.REJECTED) {
    return 4;
  }

  if (value === ApprovalStatus.PENDING) {
    return 3;
  }

  if (value === ApprovalStatus.NOT_REQUIRED) {
    return 2;
  }

  return 1;
}

function getScenarioAgeHours(scenario: WorkspaceScenario) {
  return Math.max(0, (Date.now() - scenario.updatedAt.getTime()) / (1000 * 60 * 60));
}

function getSlaRiskRank(scenario: WorkspaceScenario) {
  const ageHours = Math.min(240, getScenarioAgeHours(scenario));
  const intakeRisk =
    scenario.status === ScenarioStatus.INTAKE || scenario.status === ScenarioStatus.TRIAGE ? 50 : 0;
  const blockedRisk = scenario.status === ScenarioStatus.BLOCKED || scenario.blockedReason ? 40 : 0;
  const approvalRisk = scenario.approvalStatus === ApprovalStatus.PENDING ? 35 : 0;
  const approvalRejectedRisk = scenario.approvalStatus === ApprovalStatus.REJECTED ? 45 : 0;

  return (
    (getUrgencyRank(scenario.urgency) * 100)
    + (getPriorityRank(scenario.priority) * 60)
    + intakeRisk
    + blockedRisk
    + approvalRisk
    + approvalRejectedRisk
    + (getProofRiskRank(scenario.proofReadiness) * 18)
    + ageHours
  );
}

function compareByDateDesc(left: Date | null, right: Date | null) {
  return (right?.getTime() ?? 0) - (left?.getTime() ?? 0);
}

export function sortWorkspaceScenarios(
  scenarios: WorkspaceScenario[],
  view: WorkspaceViewKey,
  sort: WorkspaceSortKey,
) {
  const selectedSort = view === "recently-updated" && sort === WORKSPACE_DEFAULT_SORT ? "last-activity" : sort;

  return [...scenarios].sort((left, right) => {
    if (selectedSort === "urgency") {
      return (
        getUrgencyRank(right.urgency) - getUrgencyRank(left.urgency)
        || getPriorityRank(right.priority) - getPriorityRank(left.priority)
        || compareByDateDesc(left.updatedAt, right.updatedAt)
      );
    }

    if (selectedSort === "evidence-readiness") {
      return (
        getProofRiskRank(right.proofReadiness) - getProofRiskRank(left.proofReadiness)
        || getUrgencyRank(right.urgency) - getUrgencyRank(left.urgency)
        || compareByDateDesc(left.updatedAt, right.updatedAt)
      );
    }

    if (selectedSort === "approval-risk") {
      return (
        getApprovalRiskRank(right.approvalStatus) - getApprovalRiskRank(left.approvalStatus)
        || compareByDateDesc(left.approvalRequestedAt, right.approvalRequestedAt)
        || getUrgencyRank(right.urgency) - getUrgencyRank(left.urgency)
        || compareByDateDesc(left.updatedAt, right.updatedAt)
      );
    }

    if (selectedSort === "last-activity") {
      return compareByDateDesc(left.updatedAt, right.updatedAt);
    }

    return getSlaRiskRank(right) - getSlaRiskRank(left) || compareByDateDesc(left.updatedAt, right.updatedAt);
  });
}

function getWorkspaceQueueOptions(
  scenarios: Array<{
    owner: { id: string; name: string } | null;
    account: { id: string; name: string };
    scenarioType: { id: string; name: string };
  }>,
): WorkspaceQueueOptions {
  const owners = new Map<string, string>();
  const accounts = new Map<string, string>();
  const scenarioTypes = new Map<string, string>();

  for (const scenario of scenarios) {
    accounts.set(scenario.account.id, scenario.account.name);
    scenarioTypes.set(scenario.scenarioType.id, scenario.scenarioType.name);

    if (scenario.owner) {
      owners.set(scenario.owner.id, scenario.owner.name);
    }
  }

  const sortOptions = (entries: Iterable<[string, string]>) =>
    [...entries]
      .map(([value, label]) => ({ value, label }))
      .sort((left, right) => left.label.localeCompare(right.label));

  return {
    scenarioTypes: sortOptions(scenarioTypes.entries()),
    owners: sortOptions(owners.entries()),
    accounts: sortOptions(accounts.entries()),
  };
}

export async function getScenarioWorkspaceData(
  db: PrismaClient,
  input: {
    userId: string;
    view: WorkspaceViewKey;
    filters: WorkspaceQueueFilters;
    selectedScenarioId?: string;
  },
) {
  const baseWhere = getWorkspaceViewWhere(input.view, input.userId);
  const scenarioWhere = getWorkspaceQueueWhere(input.view, input.userId, input.filters);

  const [viewCounts, filterOptionScenarios, matchingScenarios, ownershipUsers] = await Promise.all([
    Promise.all(
      WORKSPACE_VIEWS.map(async (view) => ({
        key: view.key,
        count: await db.scenario.count({
          where: getWorkspaceViewWhere(view.key, input.userId),
        }),
      })),
    ),
    db.scenario.findMany({
      where: baseWhere,
      select: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        account: {
          select: {
            id: true,
            name: true,
          },
        },
        scenarioType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    db.scenario.findMany({
      where: scenarioWhere,
      select: workspaceScenarioSelect,
    }),
    db.user.findMany({
      where: {
        role: {
          in: [UserRole.ADMIN, UserRole.EDITOR],
        },
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
      orderBy: [{ name: "asc" }],
    }),
  ]);

  const scenarios = sortWorkspaceScenarios(matchingScenarios, input.view, input.filters.sort).slice(0, 24);

  const selectedScenario =
    scenarios.find((scenario) => scenario.id === input.selectedScenarioId) ?? scenarios[0] ?? null;
  const ownershipAuditRecords = selectedScenario
    ? await db.auditEvent.findMany({
        where: {
          entityType: "Scenario",
          entityId: selectedScenario.id,
          action: {
            in: [...WORKSPACE_OWNERSHIP_AUDIT_ACTIONS],
          },
        },
        orderBy: [{ createdAt: "desc" }],
        take: 8,
        select: {
          id: true,
          action: true,
          createdAt: true,
          payload: true,
          actor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    : [];

  return {
    viewCounts,
    scenarios,
    selectedScenario,
    queueOptions: getWorkspaceQueueOptions(filterOptionScenarios),
    ownershipOptions: ownershipUsers.map((user) => ({
      value: user.id,
      label: `${user.name} · ${formatEnumLabel(user.role)}`,
      role: user.role,
    })),
    ownershipAuditEvents: getWorkspaceOwnershipAuditEvents(ownershipAuditRecords),
  };
}
