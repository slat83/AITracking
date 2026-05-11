import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrerequisiteType, ProofReadiness, TaskKind, VisibilityEventType } from "@prisma/client";

import {
  AI_VISIBILITY_REPORT_JOB_KIND,
  ensureAiVisibilityReportJob,
} from "../src/server/analytics/visibility";
import { normalizeEmail } from "../src/server/auth/credentials";
import { prisma } from "../src/server/db/client";
import { enqueueJob } from "../src/server/jobs";
import { aggregateReviewAcquisitionReport } from "../src/server/reviews/reporting";
import { syncScenarioProofState } from "../src/server/scenarios/proof";
import { backfillScenariosFromOpportunities } from "../src/server/scenarios/service";

const DEFAULT_WORKSPACE_SLUG = "default-workspace";
const DEFAULT_ACCOUNT_SLUG = "default-launch-account";

const launchScenarioTypes = [
  {
    slug: "category-demand-capture",
    name: "Category demand capture",
    family: "category_demand_capture",
    launchLabel: "best VIN decoder",
    description: "Research and discovery demand that should turn into answer-first content.",
    playbook: {
      slug: "best-vin-decoder-playbook",
      name: "Best VIN decoder launch playbook",
      summary: "Turn discovery demand into a methodology-backed category page and proof set.",
      recommendedNextAction: "Draft an answer-first comparison page with methodology proof.",
      defaultTaskKind: TaskKind.DRAFT,
      proofGuidance: "Use methodology, product facts, and comparison criteria that can be defended publicly.",
    },
  },
  {
    slug: "trust-and-legitimacy-validation",
    name: "Trust and legitimacy validation",
    family: "trust_and_legitimacy_validation",
    launchLabel: "is EpicVIN legit",
    description: "Credibility and legitimacy concerns that need proof, policy, and trust assets.",
    playbook: {
      slug: "epicvin-legit-playbook",
      name: "Trust validation launch playbook",
      summary: "Route trust objections into proof-backed assets and review collection workflows.",
      recommendedNextAction: "Gather support and customer proof, then update trust-facing assets.",
      defaultTaskKind: TaskKind.QUALIFY,
      proofGuidance: "Require company identity, support proof, and current policy references.",
    },
  },
  {
    slug: "comparative-evaluation",
    name: "Comparative evaluation",
    family: "comparative_evaluation",
    launchLabel: "EpicVIN vs Carfax",
    description: "Named competitor comparison work that needs methodology and claim guardrails.",
    playbook: {
      slug: "epicvin-vs-carfax-playbook",
      name: "Comparative evaluation launch playbook",
      summary: "Prepare a fair comparison artifact with explicit claim scope and proof.",
      recommendedNextAction: "Assemble criteria, methodology, and claim guardrails before drafting.",
      defaultTaskKind: TaskKind.REVIEW,
      proofGuidance: "Require methodology proof, fair criteria, and explicit allowed-claim scope.",
    },
  },
  {
    slug: "price-and-value-qualification",
    name: "Price and value qualification",
    family: "price_and_value_qualification",
    launchLabel: "cheap VIN check",
    description: "Price sensitivity and value qualification scenarios tied to packaging and expectations.",
    playbook: {
      slug: "cheap-vin-check-playbook",
      name: "Price qualification launch playbook",
      summary: "Clarify value, packaging, and fit for budget-oriented evaluation scenarios.",
      recommendedNextAction: "Build a pricing and value explainer grounded in offer scope and proof.",
      defaultTaskKind: TaskKind.DRAFT,
      proofGuidance: "Use current pricing context, offer limitations, and value proof only.",
    },
  },
] as const;

const launchEvidenceAssets = [
  {
    slug: "epicvin-methodology-proof",
    title: "EpicVIN methodology explainer",
    proofAssetType: "methodology",
    claimSupported: "Comparison and educational claims should point to a visible methodology.",
    verificationMethod: "Editorial review against the public methodology page.",
    allowedUsage: "Public website copy and internal drafting support.",
    restrictedChannels: [],
    sensitivityLevel: "standard",
    readiness: ProofReadiness.READY,
    scenarioTypeSlug: "category-demand-capture",
  },
  {
    slug: "epicvin-product-facts-proof",
    title: "EpicVIN product facts and coverage notes",
    proofAssetType: "product facts",
    claimSupported: "Answer-first and pricing assets should describe product scope without overclaiming.",
    verificationMethod: "Reviewed against current product configuration and support macros.",
    allowedUsage: "Public website copy and support education.",
    restrictedChannels: [],
    sensitivityLevel: "standard",
    readiness: ProofReadiness.READY,
    scenarioTypeSlug: "price-and-value-qualification",
  },
  {
    slug: "epicvin-company-identity-proof",
    title: "EpicVIN company identity and support path",
    proofAssetType: "company identity",
    claimSupported: "Trust content should show a real operator identity and support path.",
    verificationMethod: "Validated against contact and support surfaces.",
    allowedUsage: "Public trust pages and direct response support.",
    restrictedChannels: [],
    sensitivityLevel: "standard",
    readiness: ProofReadiness.READY,
    scenarioTypeSlug: "trust-and-legitimacy-validation",
  },
  {
    slug: "epicvin-policy-proof",
    title: "EpicVIN billing and refund policy reference",
    proofAssetType: "policy and legal",
    claimSupported: "Trust and pricing claims must resolve to a current policy source.",
    verificationMethod: "Checked against the current billing and refund policy copy.",
    allowedUsage: "Public policy, pricing, and trust content.",
    restrictedChannels: [],
    sensitivityLevel: "standard",
    readiness: ProofReadiness.READY,
    scenarioTypeSlug: "trust-and-legitimacy-validation",
  },
  {
    slug: "epicvin-sample-report-proof",
    title: "EpicVIN sample report walkthrough",
    proofAssetType: "evidence examples",
    claimSupported: "Comparison and trust assets can show real report output examples.",
    verificationMethod: "Reviewed sample report screenshots and walkthrough notes.",
    allowedUsage: "Public trust, comparison, and FAQ usage.",
    restrictedChannels: [],
    sensitivityLevel: "standard",
    readiness: ProofReadiness.READY,
    scenarioTypeSlug: "comparative-evaluation",
  },
  {
    slug: "epicvin-comparison-approval-proof",
    title: "Comparison claim approval record",
    proofAssetType: "approval proof",
    claimSupported: "Comparative claims have reviewer approval and scope restrictions.",
    verificationMethod: "Internal approval check.",
    allowedUsage: "Internal review and approved public comparison copy only.",
    restrictedChannels: ["community", "paid-ads"],
    sensitivityLevel: "review_required",
    readiness: ProofReadiness.RESTRICTED,
    scenarioTypeSlug: "comparative-evaluation",
  },
] as const;

const playbookPrerequisitesByScenarioSlug = {
  "category-demand-capture": [
    {
      title: "Methodology proof is linked",
      description: "Answer-first category work needs a visible methodology source before drafting.",
      prerequisiteType: PrerequisiteType.EVIDENCE,
      requiredProofAssetType: "methodology",
      ownerRole: "EDITOR",
    },
  ],
  "trust-and-legitimacy-validation": [
    {
      title: "Company identity proof is linked",
      description: "Trust pages should point to company identity and support ownership.",
      prerequisiteType: PrerequisiteType.EVIDENCE,
      requiredProofAssetType: "company identity",
      ownerRole: "EDITOR",
    },
    {
      title: "Policy proof is linked",
      description: "Trust and billing claims must point to a current policy source.",
      prerequisiteType: PrerequisiteType.EVIDENCE,
      requiredProofAssetType: "policy and legal",
      ownerRole: "ADMIN",
    },
  ],
  "comparative-evaluation": [
    {
      title: "Methodology proof is linked",
      description: "Comparisons require a methodology source for the evaluation frame.",
      prerequisiteType: PrerequisiteType.EVIDENCE,
      requiredProofAssetType: "methodology",
      ownerRole: "EDITOR",
    },
    {
      title: "Approval proof is linked",
      description: "Comparative claims need an explicit reviewer-approved scope.",
      prerequisiteType: PrerequisiteType.EVIDENCE,
      requiredProofAssetType: "approval proof",
      ownerRole: "ADMIN",
    },
  ],
  "price-and-value-qualification": [
    {
      title: "Policy proof is linked",
      description: "Pricing and billing claims must point to current policy coverage.",
      prerequisiteType: PrerequisiteType.EVIDENCE,
      requiredProofAssetType: "policy and legal",
      ownerRole: "ADMIN",
    },
    {
      title: "Product facts proof is linked",
      description: "Value-oriented assets should stay grounded in current product scope.",
      prerequisiteType: PrerequisiteType.EVIDENCE,
      requiredProofAssetType: "product facts",
      ownerRole: "EDITOR",
    },
  ],
} as const;

function startOfUtcDay(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

async function main() {
  const email = normalizeEmail(process.env.SEED_ADMIN_EMAIL ?? "admin@example.com");
  const password = process.env.SEED_ADMIN_PASSWORD ?? "change-me-now";
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Founding Admin",
      passwordHash,
      role: "ADMIN",
    },
    create: {
      email,
      name: "Founding Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: DEFAULT_WORKSPACE_SLUG },
    update: {
      name: "Default Workspace",
      isDefault: true,
    },
    create: {
      slug: DEFAULT_WORKSPACE_SLUG,
      name: "Default Workspace",
      isDefault: true,
    },
  });

  const launchAccount = await prisma.account.upsert({
    where: {
      workspaceId_slug: {
        workspaceId: workspace.id,
        slug: DEFAULT_ACCOUNT_SLUG,
      },
    },
    update: {
      name: "EpicVIN Launch Pack",
      isDefault: true,
    },
    create: {
      workspaceId: workspace.id,
      slug: DEFAULT_ACCOUNT_SLUG,
      name: "EpicVIN Launch Pack",
      isDefault: true,
    },
  });

  const scenarioTypeBySlug = new Map<string, { id: string }>();
  const playbookByScenarioSlug = new Map<string, { id: string }>();
  for (const scenarioType of launchScenarioTypes) {
    const createdType = await prisma.scenarioType.upsert({
      where: { slug: scenarioType.slug },
      update: {
        name: scenarioType.name,
        family: scenarioType.family,
        description: scenarioType.description,
        launchPack: "EpicVIN",
        launchLabel: scenarioType.launchLabel,
        isActive: true,
      },
      create: {
        slug: scenarioType.slug,
        name: scenarioType.name,
        family: scenarioType.family,
        description: scenarioType.description,
        launchPack: "EpicVIN",
        launchLabel: scenarioType.launchLabel,
        isActive: true,
      },
    });

    scenarioTypeBySlug.set(scenarioType.slug, createdType);

    const playbook = await prisma.playbook.upsert({
      where: { slug: scenarioType.playbook.slug },
      update: {
        name: scenarioType.playbook.name,
        summary: scenarioType.playbook.summary,
        scenarioTypeId: createdType.id,
        recommendedNextAction: scenarioType.playbook.recommendedNextAction,
        defaultTaskKind: scenarioType.playbook.defaultTaskKind,
        proofGuidance: scenarioType.playbook.proofGuidance,
        isActive: true,
        isDefault: true,
      },
      create: {
        slug: scenarioType.playbook.slug,
        name: scenarioType.playbook.name,
        summary: scenarioType.playbook.summary,
        scenarioTypeId: createdType.id,
        recommendedNextAction: scenarioType.playbook.recommendedNextAction,
        defaultTaskKind: scenarioType.playbook.defaultTaskKind,
        proofGuidance: scenarioType.playbook.proofGuidance,
        isActive: true,
        isDefault: true,
      },
    });

    playbookByScenarioSlug.set(scenarioType.slug, playbook);
  }

  for (const asset of launchEvidenceAssets) {
    const scenarioType = scenarioTypeBySlug.get(asset.scenarioTypeSlug);
    if (!scenarioType) {
      throw new Error(`Missing scenario type seed for evidence asset ${asset.slug}.`);
    }

    await prisma.evidenceAsset.upsert({
      where: { slug: asset.slug },
      update: {
        workspaceId: workspace.id,
        accountId: launchAccount.id,
        scenarioTypeId: scenarioType.id,
        title: asset.title,
        proofAssetType: asset.proofAssetType,
        claimSupported: asset.claimSupported,
        evidenceOwnerId: admin.id,
        readiness: asset.readiness,
        verificationMethod: asset.verificationMethod,
        allowedUsage: asset.allowedUsage,
        restrictedChannels: [...asset.restrictedChannels],
        sensitivityLevel: asset.sensitivityLevel,
        lastVerifiedAt: new Date(),
      },
      create: {
        slug: asset.slug,
        workspaceId: workspace.id,
        accountId: launchAccount.id,
        scenarioTypeId: scenarioType.id,
        title: asset.title,
        proofAssetType: asset.proofAssetType,
        claimSupported: asset.claimSupported,
        evidenceOwnerId: admin.id,
        readiness: asset.readiness,
        verificationMethod: asset.verificationMethod,
        allowedUsage: asset.allowedUsage,
        restrictedChannels: [...asset.restrictedChannels],
        sensitivityLevel: asset.sensitivityLevel,
        lastVerifiedAt: new Date(),
      },
    });
  }

  for (const [scenarioSlug, prerequisites] of Object.entries(playbookPrerequisitesByScenarioSlug)) {
    const playbook = playbookByScenarioSlug.get(scenarioSlug);
    if (!playbook) {
      throw new Error(`Missing playbook seed for scenario ${scenarioSlug}.`);
    }

    for (const [index, prerequisite] of prerequisites.entries()) {
      await prisma.playbookPrerequisite.upsert({
        where: {
          playbookId_title: {
            playbookId: playbook.id,
            title: prerequisite.title,
          },
        },
        update: {
          description: prerequisite.description,
          prerequisiteType: prerequisite.prerequisiteType,
          requiredProofAssetType: prerequisite.requiredProofAssetType,
          ownerRole: prerequisite.ownerRole,
          sortOrder: index,
          isRequired: true,
          isActive: true,
        },
        create: {
          playbookId: playbook.id,
          title: prerequisite.title,
          description: prerequisite.description,
          prerequisiteType: prerequisite.prerequisiteType,
          requiredProofAssetType: prerequisite.requiredProofAssetType,
          ownerRole: prerequisite.ownerRole,
          sortOrder: index,
          isRequired: true,
          isActive: true,
        },
      });
    }
  }

  const opportunity = await prisma.opportunity.upsert({
    where: { id: "seed-opportunity" },
    update: {},
    create: {
      id: "seed-opportunity",
      title: "Launch customer proof queue",
      summary: "Capture early customer stories and route them into draft production.",
      sourceName: "Manual intake",
      scenario: "is EpicVIN legit",
      whyNow: "Trust objections are blocking comparison and conversion flows this week.",
      suggestedAssetAngle: "Build a customer-proof queue that can feed trust assets and review asks.",
      briefAudience: "Prospects comparing vehicle history providers and looking for legitimacy signals.",
      briefQuestion: "What proof would make an uncertain buyer trust EpicVIN enough to continue?",
      assetType: "Customer proof brief",
      proofRequirement: "Use real customer experience details and support-resolution evidence only.",
      targetCta: "Start a report check or continue into the trust flow.",
      status: "TRIAGE",
      priority: "HIGH",
      ownerId: admin.id,
      tags: ["launch", "customer-story"],
      capturedAt: new Date(),
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  const draft = await prisma.draft.upsert({
    where: { id: "seed-draft" },
    update: {},
    create: {
      id: "seed-draft",
      title: "Founder story draft",
      body: "Initial draft body for the content workflow seed.",
      status: "IN_REVIEW",
      createdById: admin.id,
      reviewerId: admin.id,
      opportunityId: opportunity.id,
    },
  });

  const account = await prisma.distributionAccount.upsert({
    where: {
      platform_handle: {
        platform: "linkedin",
        handle: "company-page",
      },
    },
    update: {},
    create: {
      platform: "linkedin",
      handle: "company-page",
      displayName: "Company LinkedIn",
      status: "APPROVED",
      approvedAt: new Date(),
    },
  });

  await prisma.distributionTask.upsert({
    where: { id: "seed-task" },
    update: {},
    create: {
      id: "seed-task",
      draftId: draft.id,
      accountId: account.id,
      assigneeId: admin.id,
      notes: "Seed distribution task for delivery baseline.",
    },
  });

  await enqueueJob({
    kind: "send-reminder",
    payload: { distributionTaskId: "seed-task" },
  });

  const reportDate = startOfUtcDay(new Date(Date.now() - 24 * 60 * 60 * 1000));

  await prisma.visibilityEvent.deleteMany({
    where: {
      sessionId: {
        startsWith: "seed-session-",
      },
    },
  });

  await prisma.aiVisibilityReport.deleteMany({
    where: {
      reportDate,
    },
  });

  await prisma.visibilityEvent.createMany({
    data: [
      {
        pathname: "/compare/best-vin-decoder",
        eventType: VisibilityEventType.PAGE_VIEW,
        pageTitle: "Best VIN Decoder",
        sessionId: "seed-session-1",
        referrer: "https://www.google.com/",
        occurredAt: new Date(reportDate.getTime() + 9 * 60 * 60 * 1000),
      },
      {
        pathname: "/compare/best-vin-decoder",
        eventType: VisibilityEventType.CTA_CLICK,
        pageTitle: "Best VIN Decoder",
        sessionId: "seed-session-1",
        ctaLabel: "primary",
        ctaHref: "https://content-ops.example.com/",
        referrer: "https://www.google.com/",
        occurredAt: new Date(reportDate.getTime() + 9 * 60 * 60 * 1000 + 60 * 1000),
      },
      {
        pathname: "/trust",
        eventType: VisibilityEventType.PAGE_VIEW,
        pageTitle: "Is this service legit?",
        sessionId: "seed-session-2",
        referrer: "https://chatgpt.com/",
        occurredAt: new Date(reportDate.getTime() + 12 * 60 * 60 * 1000),
      },
      {
        pathname: "/pricing/cheap-vin-check",
        eventType: VisibilityEventType.PAGE_VIEW,
        pageTitle: "Cheap VIN Check",
        sessionId: "seed-session-3",
        referrer: "https://www.google.com/",
        occurredAt: new Date(reportDate.getTime() + 16 * 60 * 60 * 1000),
      },
      {
        pathname: "/pricing/cheap-vin-check",
        eventType: VisibilityEventType.CTA_CLICK,
        pageTitle: "Cheap VIN Check",
        sessionId: "seed-session-3",
        ctaLabel: "secondary",
        ctaHref: "https://content-ops.example.com/pricing",
        referrer: "https://www.google.com/",
        occurredAt: new Date(reportDate.getTime() + 16 * 60 * 60 * 1000 + 2 * 60 * 1000),
      },
    ],
  });

  const existingReportJob = await prisma.jobRun.findFirst({
    where: {
      kind: AI_VISIBILITY_REPORT_JOB_KIND,
    },
  });

  if (!existingReportJob) {
    await ensureAiVisibilityReportJob(reportDate, new Date());
  }

  await prisma.reviewFeedback.deleteMany({
    where: {
      inviteId: {
        in: ["seed-review-invite-2", "seed-review-invite-3"],
      },
    },
  });

  await prisma.reviewInvite.deleteMany({
    where: {
      id: {
        in: ["seed-review-invite-1", "seed-review-invite-2", "seed-review-invite-3"],
      },
    },
  });

  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  await Promise.all([
    prisma.reviewInvite.create({
      data: {
        id: "seed-review-invite-1",
        customerName: "Jordan Miles",
        customerEmail: "jordan.miles@example.com",
        orderReference: "EV-1001",
        trigger: "REPORT_DELIVERED",
        status: "SCHEDULED",
        scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000),
        experienceConfirmed: false,
        wantsPublicReview: false,
        notes: "Queued after report delivery with neutral review language.",
        ownerId: admin.id,
        createdAt: new Date(),
      },
    }),
    prisma.reviewInvite.create({
      data: {
        id: "seed-review-invite-2",
        customerName: "Casey Harper",
        customerEmail: "casey.harper@example.com",
        orderReference: "EV-1002",
        trigger: "SUPPORT_RESOLVED",
        status: "PUBLIC_SHARE_READY",
        scheduledFor: new Date(lastWeek.getTime() - 2 * 60 * 60 * 1000),
        sentAt: new Date(lastWeek.getTime() - 60 * 60 * 1000),
        respondedAt: new Date(lastWeek.getTime() + 3 * 60 * 60 * 1000),
        publicShareReadyAt: new Date(lastWeek.getTime() + 3 * 60 * 60 * 1000),
        experienceConfirmed: true,
        wantsPublicReview: true,
        publicReviewUrl: "https://reviews.example.com/content-ops",
        notes: "Customer confirmed the support resolution and opted into a public review link.",
        ownerId: admin.id,
        createdAt: lastWeek,
      },
    }),
    prisma.reviewInvite.create({
      data: {
        id: "seed-review-invite-3",
        customerName: "Taylor Reed",
        customerEmail: "taylor.reed@example.com",
        orderReference: "EV-1003",
        trigger: "REFUND_RESOLVED",
        status: "CLOSED_NO_SHARE",
        scheduledFor: new Date(lastWeek.getTime() + 24 * 60 * 60 * 1000),
        sentAt: new Date(lastWeek.getTime() + 25 * 60 * 60 * 1000),
        respondedAt: new Date(lastWeek.getTime() + 29 * 60 * 60 * 1000),
        closedAt: new Date(lastWeek.getTime() + 29 * 60 * 60 * 1000),
        experienceConfirmed: true,
        wantsPublicReview: false,
        notes: "Kept for operating feedback after a fair refund resolution.",
        ownerId: admin.id,
        createdAt: new Date(lastWeek.getTime() + 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  await prisma.reviewFeedback.createMany({
    data: [
      {
        inviteId: "seed-review-invite-2",
        sentiment: "POSITIVE",
        scenario: "Needed title and accident context before buying from a private seller.",
        usefulPart: "The report layout made the accident timeline easy to review.",
        frictionPoint: "Wanted clearer pricing context before purchase.",
        supportFollowupNeeded: false,
        publicReviewPostedAt: new Date(lastWeek.getTime() + 5 * 60 * 60 * 1000),
      },
      {
        inviteId: "seed-review-invite-3",
        sentiment: "NEGATIVE",
        scenario: "Requested a refund after realizing the vehicle listing had already expired.",
        usefulPart: "Support closed the loop quickly.",
        frictionPoint: "Pricing expectations were unclear before checkout.",
        supportFollowupNeeded: true,
      },
    ],
  });

  await aggregateReviewAcquisitionReport({ window: "WEEK" });
  await aggregateReviewAcquisitionReport({ window: "MONTH" });
  await backfillScenariosFromOpportunities(prisma);

  const seededScenario = await prisma.scenario.findUnique({
    where: {
      sourceOpportunityId: opportunity.id,
    },
    select: {
      id: true,
      scenarioType: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (seededScenario) {
    const linkedEvidenceAssets = await prisma.evidenceAsset.findMany({
      where: {
        workspaceId: workspace.id,
        scenarioType: {
          slug: seededScenario.scenarioType.slug,
        },
      },
      select: {
        id: true,
      },
    });

    for (const [index, asset] of linkedEvidenceAssets.entries()) {
      await prisma.scenarioEvidenceAsset.upsert({
        where: {
          scenarioId_evidenceAssetId: {
            scenarioId: seededScenario.id,
            evidenceAssetId: asset.id,
          },
        },
        update: {
          isPrimary: index === 0,
        },
        create: {
          scenarioId: seededScenario.id,
          evidenceAssetId: asset.id,
          isPrimary: index === 0,
        },
      });
    }

    await syncScenarioProofState(prisma, {
      scenarioId: seededScenario.id,
      actorId: admin.id,
    });

    const capturedAt = new Date(opportunity.capturedAt);
    const triagedAt = new Date(capturedAt.getTime() + 6 * 60 * 60 * 1000);
    const firstTaskAt = new Date(capturedAt.getTime() + 18 * 60 * 60 * 1000);
    const firstOutcomeAt = new Date(capturedAt.getTime() + 4 * 24 * 60 * 60 * 1000);

    await prisma.scenario.update({
      where: { id: seededScenario.id },
      data: {
        triagedAt,
        firstTaskAt,
        firstOutcomeAt,
        status: "IN_OBSERVATION",
      },
    });

    await prisma.outcome.upsert({
      where: { scenarioId: seededScenario.id },
      update: {
        status: "RESOLVED",
        summary: "Trust proof landed and the scenario moved into observation.",
        observedAt: firstOutcomeAt,
        resolvedAt: new Date(firstOutcomeAt.getTime() + 12 * 60 * 60 * 1000),
      },
      create: {
        scenarioId: seededScenario.id,
        status: "RESOLVED",
        summary: "Trust proof landed and the scenario moved into observation.",
        observedAt: firstOutcomeAt,
        resolvedAt: new Date(firstOutcomeAt.getTime() + 12 * 60 * 60 * 1000),
      },
    });
  }

  const comparisonType = scenarioTypeBySlug.get("comparative-evaluation");
  const comparisonPlaybook = playbookByScenarioSlug.get("comparative-evaluation");
  if (comparisonType && comparisonPlaybook) {
    const comparisonCapturedAt = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const comparisonTriagedAt = new Date(comparisonCapturedAt.getTime() + 8 * 60 * 60 * 1000);
    const comparisonFirstTaskAt = new Date(comparisonCapturedAt.getTime() + 20 * 60 * 60 * 1000);
    const approvalRequestedAt = new Date(comparisonFirstTaskAt.getTime() + 4 * 60 * 60 * 1000);
    const approvalResolvedAt = new Date(approvalRequestedAt.getTime() + 10 * 60 * 60 * 1000);
    const comparisonOutcomeAt = new Date(approvalResolvedAt.getTime() + 24 * 60 * 60 * 1000);

    const comparisonScenario = await prisma.scenario.upsert({
      where: { id: "seed-comparison-scenario" },
      update: {
        workspaceId: workspace.id,
        accountId: launchAccount.id,
        scenarioTypeId: comparisonType.id,
        playbookId: comparisonPlaybook.id,
        title: "Refresh EpicVIN vs Carfax methodology proof",
        summary: "Comparison scenario seeded to exercise approval latency reporting.",
        status: "IN_OBSERVATION",
        priority: "HIGH",
        urgency: "HIGH",
        businessImpact: "HIGH",
        proofReadiness: "READY",
        approvalStatus: "APPROVED",
        scenarioGoal: "Refresh comparative proof without widening claim scope.",
        recommendedNextAction: "Measure the refreshed comparison after approval.",
        ownerId: admin.id,
        capturedAt: comparisonCapturedAt,
        triagedAt: comparisonTriagedAt,
        firstTaskAt: comparisonFirstTaskAt,
        approvalRequestedAt,
        approvalResolvedAt,
        firstOutcomeAt: comparisonOutcomeAt,
        blockedReason: null,
      },
      create: {
        id: "seed-comparison-scenario",
        workspaceId: workspace.id,
        accountId: launchAccount.id,
        scenarioTypeId: comparisonType.id,
        playbookId: comparisonPlaybook.id,
        title: "Refresh EpicVIN vs Carfax methodology proof",
        summary: "Comparison scenario seeded to exercise approval latency reporting.",
        status: "IN_OBSERVATION",
        priority: "HIGH",
        urgency: "HIGH",
        businessImpact: "HIGH",
        proofReadiness: "READY",
        approvalStatus: "APPROVED",
        scenarioGoal: "Refresh comparative proof without widening claim scope.",
        recommendedNextAction: "Measure the refreshed comparison after approval.",
        ownerId: admin.id,
        capturedAt: comparisonCapturedAt,
        triagedAt: comparisonTriagedAt,
        firstTaskAt: comparisonFirstTaskAt,
        approvalRequestedAt,
        approvalResolvedAt,
        firstOutcomeAt: comparisonOutcomeAt,
      },
    });

    await prisma.outcome.upsert({
      where: { scenarioId: comparisonScenario.id },
      update: {
        status: "PARTIALLY_RESOLVED",
        summary: "Comparison update shipped with narrowed approved claims.",
        observedAt: comparisonOutcomeAt,
      },
      create: {
        scenarioId: comparisonScenario.id,
        status: "PARTIALLY_RESOLVED",
        summary: "Comparison update shipped with narrowed approved claims.",
        observedAt: comparisonOutcomeAt,
      },
    });

    await prisma.task.upsert({
      where: { id: "seed-comparison-task" },
      update: {
        scenarioId: comparisonScenario.id,
        title: "Review the comparison scope and approval record.",
        summary: "Keep the comparison within the approved claims boundary.",
        kind: "REVIEW",
        status: "COMPLETE",
        ownerId: admin.id,
        dueAt: new Date(comparisonCapturedAt.getTime() + 2 * 24 * 60 * 60 * 1000),
      },
      create: {
        id: "seed-comparison-task",
        scenarioId: comparisonScenario.id,
        title: "Review the comparison scope and approval record.",
        summary: "Keep the comparison within the approved claims boundary.",
        kind: "REVIEW",
        status: "COMPLETE",
        ownerId: admin.id,
        dueAt: new Date(comparisonCapturedAt.getTime() + 2 * 24 * 60 * 60 * 1000),
        createdAt: comparisonFirstTaskAt,
      },
    });
  }

  const blockedScenarioType = scenarioTypeBySlug.get("price-and-value-qualification");
  const blockedPlaybook = playbookByScenarioSlug.get("price-and-value-qualification");
  if (blockedScenarioType && blockedPlaybook) {
    const blockedCapturedAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const blockedTriagedAt = new Date(blockedCapturedAt.getTime() + 4 * 60 * 60 * 1000);
    const blockedFirstTaskAt = new Date(blockedCapturedAt.getTime() + 12 * 60 * 60 * 1000);
    const blockedAt = new Date(blockedCapturedAt.getTime() + 18 * 60 * 60 * 1000);

    await prisma.scenario.upsert({
      where: { id: "seed-blocked-scenario" },
      update: {
        workspaceId: workspace.id,
        accountId: launchAccount.id,
        scenarioTypeId: blockedScenarioType.id,
        playbookId: blockedPlaybook.id,
        title: "Clarify pricing approval before launch push",
        summary: "Pricing scenario seeded to keep blocker-cause reporting non-empty.",
        status: "BLOCKED",
        priority: "MEDIUM",
        urgency: "HIGH",
        businessImpact: "MEDIUM",
        proofReadiness: "READY",
        approvalStatus: "PENDING",
        blockedReason: "Approval is still pending on the pricing clarification.",
        scenarioGoal: "Ship a pricing explainer without mismatching current policy scope.",
        recommendedNextAction: "Secure approval before publishing the pricing update.",
        ownerId: admin.id,
        capturedAt: blockedCapturedAt,
        triagedAt: blockedTriagedAt,
        firstTaskAt: blockedFirstTaskAt,
        approvalRequestedAt: blockedAt,
        blockedAt,
      },
      create: {
        id: "seed-blocked-scenario",
        workspaceId: workspace.id,
        accountId: launchAccount.id,
        scenarioTypeId: blockedScenarioType.id,
        playbookId: blockedPlaybook.id,
        title: "Clarify pricing approval before launch push",
        summary: "Pricing scenario seeded to keep blocker-cause reporting non-empty.",
        status: "BLOCKED",
        priority: "MEDIUM",
        urgency: "HIGH",
        businessImpact: "MEDIUM",
        proofReadiness: "READY",
        approvalStatus: "PENDING",
        blockedReason: "Approval is still pending on the pricing clarification.",
        scenarioGoal: "Ship a pricing explainer without mismatching current policy scope.",
        recommendedNextAction: "Secure approval before publishing the pricing update.",
        ownerId: admin.id,
        capturedAt: blockedCapturedAt,
        triagedAt: blockedTriagedAt,
        firstTaskAt: blockedFirstTaskAt,
        approvalRequestedAt: blockedAt,
        blockedAt,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
