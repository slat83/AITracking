import {
  ApprovalStatus,
  OutcomeStatus,
  ProofReadiness,
  ScenarioStatus,
} from "@prisma/client";
import { describe, expect, it } from "vitest";

import { buildScenarioReportingMetrics } from "@/server/scenarios/reporting";

describe("scenario reporting", () => {
  it("aggregates latency, outcome, and blocker metrics from lifecycle timestamps", () => {
    const periodStart = new Date("2026-05-01T00:00:00.000Z");
    const periodEnd = new Date("2026-06-01T00:00:00.000Z");

    const metrics = buildScenarioReportingMetrics(
      [
        {
          id: "scenario-1",
          capturedAt: new Date("2026-05-01T00:00:00.000Z"),
          triagedAt: new Date("2026-05-01T06:00:00.000Z"),
          firstTaskAt: new Date("2026-05-01T10:00:00.000Z"),
          blockedAt: null,
          blockedReason: null,
          approvalStatus: ApprovalStatus.NOT_REQUIRED,
          approvalRequestedAt: null,
          approvalResolvedAt: null,
          proofReadiness: ProofReadiness.READY,
          status: ScenarioStatus.ACTIVE,
          firstOutcomeAt: new Date("2026-05-03T00:00:00.000Z"),
          outcome: {
            status: OutcomeStatus.RESOLVED,
          },
        },
        {
          id: "scenario-2",
          capturedAt: new Date("2026-05-02T00:00:00.000Z"),
          triagedAt: new Date("2026-05-02T12:00:00.000Z"),
          firstTaskAt: new Date("2026-05-03T00:00:00.000Z"),
          blockedAt: new Date("2026-05-03T03:00:00.000Z"),
          blockedReason: "Approval is still pending from legal review.",
          approvalStatus: ApprovalStatus.PENDING,
          approvalRequestedAt: new Date("2026-05-03T01:00:00.000Z"),
          approvalResolvedAt: new Date("2026-05-03T07:00:00.000Z"),
          proofReadiness: ProofReadiness.RESTRICTED,
          status: ScenarioStatus.BLOCKED,
          firstOutcomeAt: new Date("2026-05-04T00:00:00.000Z"),
          outcome: {
            status: OutcomeStatus.PARTIALLY_RESOLVED,
          },
        },
      ],
      periodStart,
      periodEnd,
    );

    expect(metrics.scenariosCaptured).toBe(2);
    expect(metrics.scenariosTriaged).toBe(2);
    expect(metrics.scenariosActivated).toBe(2);
    expect(metrics.approvalsResolved).toBe(1);
    expect(metrics.scenariosBlocked).toBe(1);
    expect(metrics.outcomesRecorded).toBe(2);
    expect(metrics.outcomeCaptureRate).toBe(100);
    expect(metrics.resolvedOutcomeRate).toBe(100);
    expect(metrics.avgTimeToTriageHours).toBe(9);
    expect(metrics.avgTimeToNextActionHours).toBe(17);
    expect(metrics.avgApprovalLatencyHours).toBe(6);
    expect(metrics.outcomeBreakdown).toEqual({
      IN_OBSERVATION: 0,
      RESOLVED: 1,
      PARTIALLY_RESOLVED: 1,
      NO_EFFECT: 0,
      BRANCHED: 0,
    });
    expect(metrics.blockerCauseBreakdown).toEqual({
      "Approval pending": 1,
    });
  });
});
