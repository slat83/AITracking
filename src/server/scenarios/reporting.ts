import {
  ApprovalStatus,
  OutcomeStatus,
  ProofReadiness,
  ReviewReportWindow,
  ScenarioStatus,
  type PrismaClient,
} from "@prisma/client";

type ReportingWindow = keyof typeof ReviewReportWindow;

type ScenarioReportingRecord = {
  id: string;
  capturedAt: Date;
  triagedAt: Date | null;
  firstTaskAt: Date | null;
  blockedAt: Date | null;
  blockedReason: string | null;
  approvalStatus: ApprovalStatus;
  approvalRequestedAt: Date | null;
  approvalResolvedAt: Date | null;
  proofReadiness: ProofReadiness;
  status: ScenarioStatus;
  firstOutcomeAt: Date | null;
  outcome: {
    status: OutcomeStatus;
  } | null;
};

type ScenarioOutcomeBreakdown = Record<OutcomeStatus, number>;

export type ScenarioReportingMetrics = {
  periodStart: Date;
  periodEnd: Date;
  scenariosCaptured: number;
  scenariosTriaged: number;
  scenariosActivated: number;
  approvalsResolved: number;
  scenariosBlocked: number;
  outcomesRecorded: number;
  outcomeCaptureRate: number;
  resolvedOutcomeRate: number;
  avgTimeToTriageHours: number;
  avgTimeToNextActionHours: number;
  avgApprovalLatencyHours: number;
  outcomeBreakdown: ScenarioOutcomeBreakdown;
  blockerCauseBreakdown: Record<string, number>;
};

function startOfUtcDay(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function roundMetric(value: number) {
  return Number(value.toFixed(2));
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return roundMetric(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function diffHours(start: Date, end: Date) {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

function isWithinPeriod(value: Date | null, periodStart: Date, periodEnd: Date) {
  return value !== null && value >= periodStart && value < periodEnd;
}

function toRate(numerator: number, denominator: number) {
  if (denominator === 0) {
    return 0;
  }

  return roundMetric((numerator / denominator) * 100);
}

function getScenarioReportPeriod(window: ReportingWindow, anchorDate = new Date()) {
  const date = startOfUtcDay(anchorDate);

  if (window === "WEEK") {
    const day = date.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;
    const periodStart = new Date(date);
    periodStart.setUTCDate(periodStart.getUTCDate() + diff);
    const periodEnd = new Date(periodStart);
    periodEnd.setUTCDate(periodEnd.getUTCDate() + 7);

    return { periodStart, periodEnd };
  }

  const periodStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const periodEnd = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));

  return { periodStart, periodEnd };
}

function classifyBlockerCause(record: Pick<
  ScenarioReportingRecord,
  "approvalStatus" | "proofReadiness" | "blockedReason" | "status"
>) {
  if (record.approvalStatus === ApprovalStatus.PENDING) {
    return "Approval pending";
  }

  if (record.approvalStatus === ApprovalStatus.REJECTED) {
    return "Approval rejected";
  }

  if (record.proofReadiness === ProofReadiness.RESTRICTED) {
    return "Restricted proof";
  }

  const reason = record.blockedReason?.trim().toLowerCase();
  if (!reason) {
    return record.status === ScenarioStatus.BLOCKED ? "Other blocker" : null;
  }

  if (reason.includes("proof") || reason.includes("evidence")) {
    return "Proof gap";
  }

  if (reason.includes("approval")) {
    return "Approval dependency";
  }

  if (reason.includes("access")) {
    return "Access dependency";
  }

  if (reason.includes("dependency")) {
    return "External dependency";
  }

  return "Other blocker";
}

export function buildScenarioReportingMetrics(
  scenarios: ScenarioReportingRecord[],
  periodStart: Date,
  periodEnd: Date,
): ScenarioReportingMetrics {
  const outcomeBreakdown: ScenarioOutcomeBreakdown = {
    IN_OBSERVATION: 0,
    RESOLVED: 0,
    PARTIALLY_RESOLVED: 0,
    NO_EFFECT: 0,
    BRANCHED: 0,
  };
  const blockerCauseBreakdown: Record<string, number> = {};
  const timeToTriageHours: number[] = [];
  const timeToNextActionHours: number[] = [];
  const approvalLatencyHours: number[] = [];

  let scenariosCaptured = 0;
  let scenariosTriaged = 0;
  let scenariosActivated = 0;
  let approvalsResolved = 0;
  let scenariosBlocked = 0;
  let outcomesRecorded = 0;

  for (const scenario of scenarios) {
    if (isWithinPeriod(scenario.capturedAt, periodStart, periodEnd)) {
      scenariosCaptured += 1;
    }

    if (isWithinPeriod(scenario.triagedAt, periodStart, periodEnd)) {
      scenariosTriaged += 1;
      timeToTriageHours.push(diffHours(scenario.capturedAt, scenario.triagedAt!));
    }

    if (isWithinPeriod(scenario.firstTaskAt, periodStart, periodEnd)) {
      scenariosActivated += 1;
      timeToNextActionHours.push(diffHours(scenario.capturedAt, scenario.firstTaskAt!));
    }

    if (isWithinPeriod(scenario.approvalResolvedAt, periodStart, periodEnd)) {
      approvalsResolved += 1;

      if (scenario.approvalRequestedAt) {
        approvalLatencyHours.push(diffHours(scenario.approvalRequestedAt, scenario.approvalResolvedAt!));
      }
    }

    if (isWithinPeriod(scenario.blockedAt, periodStart, periodEnd)) {
      scenariosBlocked += 1;
      const blockerCause = classifyBlockerCause(scenario);
      if (blockerCause) {
        blockerCauseBreakdown[blockerCause] = (blockerCauseBreakdown[blockerCause] ?? 0) + 1;
      }
    }

    if (isWithinPeriod(scenario.firstOutcomeAt, periodStart, periodEnd)) {
      outcomesRecorded += 1;

      if (scenario.outcome) {
        outcomeBreakdown[scenario.outcome.status] += 1;
      }
    }
  }

  const resolvedOutcomes =
    outcomeBreakdown.RESOLVED + outcomeBreakdown.PARTIALLY_RESOLVED;

  return {
    periodStart,
    periodEnd,
    scenariosCaptured,
    scenariosTriaged,
    scenariosActivated,
    approvalsResolved,
    scenariosBlocked,
    outcomesRecorded,
    outcomeCaptureRate: toRate(outcomesRecorded, scenariosCaptured),
    resolvedOutcomeRate: toRate(resolvedOutcomes, outcomesRecorded),
    avgTimeToTriageHours: average(timeToTriageHours),
    avgTimeToNextActionHours: average(timeToNextActionHours),
    avgApprovalLatencyHours: average(approvalLatencyHours),
    outcomeBreakdown,
    blockerCauseBreakdown,
  };
}

export async function getScenarioReportingDashboard(
  db: PrismaClient,
  anchorDate = new Date(),
) {
  const scenarios = await db.scenario.findMany({
    select: {
      id: true,
      capturedAt: true,
      triagedAt: true,
      firstTaskAt: true,
      blockedAt: true,
      blockedReason: true,
      approvalStatus: true,
      approvalRequestedAt: true,
      approvalResolvedAt: true,
      proofReadiness: true,
      status: true,
      firstOutcomeAt: true,
      outcome: {
        select: {
          status: true,
        },
      },
    },
  });

  const week = getScenarioReportPeriod("WEEK", anchorDate);
  const month = getScenarioReportPeriod("MONTH", anchorDate);
  const currentBlockers = scenarios.reduce<Record<string, number>>((accumulator, scenario) => {
    const blockerCause =
      scenario.status === ScenarioStatus.BLOCKED
      || scenario.approvalStatus === ApprovalStatus.PENDING
      || scenario.approvalStatus === ApprovalStatus.REJECTED
      || scenario.proofReadiness === ProofReadiness.RESTRICTED
      || scenario.blockedReason
        ? classifyBlockerCause(scenario)
        : null;

    if (!blockerCause) {
      return accumulator;
    }

    accumulator[blockerCause] = (accumulator[blockerCause] ?? 0) + 1;
    return accumulator;
  }, {});

  return {
    week: buildScenarioReportingMetrics(scenarios, week.periodStart, week.periodEnd),
    month: buildScenarioReportingMetrics(scenarios, month.periodStart, month.periodEnd),
    currentBlockers,
  };
}
