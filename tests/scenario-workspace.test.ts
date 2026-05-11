import {
  ApprovalStatus,
  ArtifactStatus,
  DraftStatus,
  ProofReadiness,
  ScenarioPrerequisiteStatus,
  ScenarioPriority,
  ScenarioStatus,
  ScenarioUrgency,
  TaskKind,
  TaskStatus,
} from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  getWorkspaceApprovals,
  getWorkspaceBlockers,
  getWorkspaceChildArtifacts,
  parseWorkspaceQueueFilters,
  sortWorkspaceScenarios,
  type WorkspaceScenario,
} from "@/server/scenarios/workspace";

describe("scenario workspace child artifacts", () => {
  it("merges scenario artifacts with legacy intake drafts for handoff rendering", () => {
    const scenario = {
      artifacts: [
        {
          id: "artifact-1",
          title: "Trust brief",
          artifactType: "Brief",
          status: ArtifactStatus.IN_REVIEW,
          createdAt: new Date("2026-05-10T08:00:00.000Z"),
          updatedAt: new Date("2026-05-10T10:00:00.000Z"),
          createdBy: {
            id: "user-1",
            name: "Avery",
          },
        },
      ],
      sourceOpportunity: {
        id: "opp-1",
        title: "Trust objections from support",
        sourceName: "Support queue",
        sourceUrl: null,
        whyNow: "Complaints are increasing.",
        briefAudience: null,
        briefQuestion: null,
        proofRequirement: null,
        targetCta: null,
        status: "READY_FOR_DRAFT",
        owner: {
          id: "user-2",
          name: "Jordan",
        },
        dueDate: null,
        capturedAt: new Date("2026-05-10T07:00:00.000Z"),
        drafts: [
          {
            id: "draft-1",
            title: "Legacy trust draft",
            status: DraftStatus.OUTLINE,
            createdAt: new Date("2026-05-10T09:00:00.000Z"),
            updatedAt: new Date("2026-05-10T11:00:00.000Z"),
            createdBy: {
              id: "user-3",
              name: "Morgan",
            },
            reviewer: null,
          },
        ],
      },
    } as WorkspaceScenario;

    expect(getWorkspaceChildArtifacts(scenario)).toEqual([
      expect.objectContaining({
        id: "draft-draft-1",
        title: "Legacy trust draft",
        artifactType: "Draft",
        statusLabel: "Drafting",
        relationshipLabel: "Inherited from the source intake handoff",
        source: "draft",
        ownerName: "Morgan",
      }),
      expect.objectContaining({
        id: "artifact-1",
        title: "Trust brief",
        artifactType: "Brief",
        statusLabel: "In Review",
        relationshipLabel: "Created from this scenario",
        source: "artifact",
        ownerName: "Avery",
      }),
    ]);
  });
});

describe("workspace queue controls", () => {
  it("falls back to safe defaults for invalid queue filters", () => {
    expect(
      parseWorkspaceQueueFilters({
        scenarioType: ["scenario-type-1"],
        urgency: "INVALID",
        owner: "",
        account: "account-1",
        freshness: "2w",
        sort: "random",
      }),
    ).toEqual({
      scenarioTypeId: "scenario-type-1",
      urgency: undefined,
      ownerId: undefined,
      accountId: "account-1",
      freshness: "any",
      sort: "sla-risk",
    });
  });

  it("sorts by sla risk so stale blocked and approval-gated work rises first", () => {
    const now = Date.now();
    const scenarios = [
      makeWorkspaceScenario({
        id: "routine",
        title: "Routine follow-up",
        status: ScenarioStatus.ACTIVE,
        priority: ScenarioPriority.MEDIUM,
        urgency: ScenarioUrgency.LOW,
        proofReadiness: ProofReadiness.READY,
        approvalStatus: ApprovalStatus.NOT_REQUIRED,
        updatedAt: new Date(now - 2 * 60 * 60 * 1000),
      }),
      makeWorkspaceScenario({
        id: "blocked",
        title: "Blocked legal review",
        status: ScenarioStatus.BLOCKED,
        blockedReason: "Legal review is overdue.",
        priority: ScenarioPriority.HIGH,
        urgency: ScenarioUrgency.HIGH,
        proofReadiness: ProofReadiness.RESTRICTED,
        approvalStatus: ApprovalStatus.PENDING,
        updatedAt: new Date(now - 36 * 60 * 60 * 1000),
        approvalRequestedAt: new Date(now - 30 * 60 * 60 * 1000),
      }),
      makeWorkspaceScenario({
        id: "triage",
        title: "Fresh triage",
        status: ScenarioStatus.TRIAGE,
        priority: ScenarioPriority.HIGH,
        urgency: ScenarioUrgency.MEDIUM,
        proofReadiness: ProofReadiness.MISSING,
        approvalStatus: ApprovalStatus.NOT_REQUIRED,
        updatedAt: new Date(now - 3 * 60 * 60 * 1000),
      }),
    ];

    expect(sortWorkspaceScenarios(scenarios, "my-work", "sla-risk").map((scenario) => scenario.id)).toEqual([
      "blocked",
      "triage",
      "routine",
    ]);
  });
});

describe("workspace approval and blocker modules", () => {
  it("derives first-class approval metadata from scenario state and review tasks", () => {
    const scenario = makeWorkspaceScenario({
      title: "Pricing clarification",
      approvalStatus: ApprovalStatus.PENDING,
      approvalRequestedAt: new Date("2026-05-10T09:00:00.000Z"),
      blockedReason: "Approval is still pending on the pricing clarification.",
      sourceOpportunity: {
        id: "opp-1",
        title: "Pricing intake",
        sourceName: "Sales call",
        sourceUrl: null,
        whyNow: null,
        briefAudience: null,
        briefQuestion: null,
        proofRequirement: "Approval proof",
        targetCta: null,
        status: "READY_FOR_DRAFT",
        owner: {
          id: "user-2",
          name: "Jordan",
        },
        dueDate: new Date("2026-05-12T12:00:00.000Z"),
        capturedAt: new Date("2026-05-10T07:00:00.000Z"),
        drafts: [],
      },
      tasks: [
        {
          id: "task-review",
          title: "Review the pricing scope",
          summary: "Secure approval before execution.",
          kind: TaskKind.REVIEW,
          status: TaskStatus.BLOCKED,
          dueAt: new Date("2026-05-12T12:00:00.000Z"),
          createdAt: new Date("2026-05-10T08:00:00.000Z"),
          updatedAt: new Date("2026-05-10T09:30:00.000Z"),
          owner: {
            id: "user-2",
            name: "Jordan",
            role: "EDITOR",
          },
        },
      ],
    });

    expect(getWorkspaceApprovals(scenario)).toEqual([
      expect.objectContaining({
        statusLabel: "Pending",
        typeLabel: "Execution approval",
        approverName: "Jordan",
        targetLabel: "Pricing clarification",
        note: "Approval is still pending on the pricing clarification.",
        tone: "warning",
      }),
    ]);
  });

  it("surfaces approval, prerequisite, and blocked task items in the blocker rail", () => {
    const scenario = makeWorkspaceScenario({
      title: "Comparison refresh",
      approvalStatus: ApprovalStatus.PENDING,
      blockedReason: "Approval is still pending on the comparison refresh.",
      blockedAt: new Date("2026-05-10T10:00:00.000Z"),
      approvalRequestedAt: new Date("2026-05-10T09:00:00.000Z"),
      owner: {
        id: "user-1",
        name: "Avery",
        role: "EDITOR",
      },
      prerequisites: [
        {
          id: "prereq-1",
          title: "Approval proof",
          description: "Need an approval record before republishing.",
          prerequisiteType: "EVIDENCE",
          status: ScenarioPrerequisiteStatus.MISSING,
          blockingReason: "Approval proof is still missing.",
          satisfiedAt: null,
          waivedAt: null,
          createdAt: new Date("2026-05-10T08:00:00.000Z"),
          updatedAt: new Date("2026-05-10T11:00:00.000Z"),
          owner: null,
          playbookPrerequisite: {
            ownerRole: "Compliance",
            requiredProofAssetType: "approval proof",
          },
          evidenceAsset: null,
        },
      ],
      tasks: [
        {
          id: "task-1",
          title: "Resolve policy question",
          summary: "Need policy confirmation from legal before continuing.",
          kind: TaskKind.ESCALATE,
          status: TaskStatus.BLOCKED,
          dueAt: null,
          createdAt: new Date("2026-05-10T08:30:00.000Z"),
          updatedAt: new Date("2026-05-10T11:30:00.000Z"),
          owner: {
            id: "user-3",
            name: "Morgan",
            role: "EDITOR",
          },
        },
      ],
    });

    expect(getWorkspaceBlockers(scenario)).toEqual([
      expect.objectContaining({
        id: "task-task-1",
        summary: "Need policy confirmation from legal before continuing.",
        ownerName: "Morgan",
        linkedObjectLabel: "Resolve policy question",
      }),
      expect.objectContaining({
        id: "prerequisite-prereq-1",
        summary: "Approval proof is still missing.",
        typeLabel: "Missing evidence",
        ownerName: "Compliance",
        linkedObjectLabel: "Approval proof",
      }),
      expect.objectContaining({
        id: "approval-scenario-1",
        summary: "Approval is still pending on the comparison refresh.",
        typeLabel: "Missing approval",
        ownerName: "Morgan",
        linkedObjectLabel: "Comparison refresh",
      }),
    ]);
  });
});

function makeWorkspaceScenario(overrides: Partial<WorkspaceScenario>) {
  return {
    id: "scenario-1",
    title: "Scenario",
    summary: "Summary",
    status: ScenarioStatus.ACTIVE,
    priority: ScenarioPriority.MEDIUM,
    urgency: ScenarioUrgency.MEDIUM,
    businessImpact: "MEDIUM",
    proofReadiness: ProofReadiness.PARTIAL,
    approvalStatus: ApprovalStatus.NOT_REQUIRED,
    blockedReason: null,
    blockedAt: null,
    scenarioGoal: null,
    signalSummary: null,
    recommendedNextAction: null,
    approvalRequestedAt: null,
    approvalResolvedAt: null,
    capturedAt: new Date("2026-05-10T08:00:00.000Z"),
    createdAt: new Date("2026-05-10T08:00:00.000Z"),
    firstTaskAt: null,
    triagedAt: null,
    updatedAt: new Date("2026-05-10T08:00:00.000Z"),
    owner: null,
    account: {
      id: "account-1",
      name: "EpicVIN",
    },
    scenarioType: {
      id: "scenario-type-1",
      name: "Trust validation",
      family: "Trust",
    },
    playbook: null,
    sourceOpportunity: null,
    tasks: [],
    artifacts: [],
    evidenceLinks: [],
    prerequisites: [],
    outcome: null,
    ...overrides,
  } as unknown as WorkspaceScenario;
}
