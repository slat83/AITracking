import { OpportunityStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  canTransitionOpportunity,
  parseDateInput,
  parseTags,
  validateOpportunityReadyForDraft,
} from "@/server/opportunities/workflow";

describe("opportunity workflow utilities", () => {
  it("normalizes comma-separated tags", () => {
    expect(parseTags(" trust, serp ,, comparison ")).toEqual(["trust", "serp", "comparison"]);
  });

  it("parses date inputs as UTC day values", () => {
    expect(parseDateInput("2026-05-12")?.toISOString()).toBe("2026-05-12T00:00:00.000Z");
    expect(parseDateInput("")).toBeUndefined();
  });

  it("blocks ready-for-draft when the brief is incomplete", () => {
    const result = validateOpportunityReadyForDraft({
      briefAudience: "Comparison shoppers",
      briefQuestion: "Why should they trust EpicVIN?",
      assetType: "Landing page brief",
      proofRequirement: "",
      targetCta: "Start a report check",
      dueDate: new Date("2026-05-14T00:00:00.000Z"),
    });

    expect(result.success).toBe(false);
  });

  it("accepts ready-for-draft when the full brief is present", () => {
    const result = validateOpportunityReadyForDraft({
      briefAudience: "Comparison shoppers",
      briefQuestion: "Why should they trust EpicVIN?",
      assetType: "Landing page brief",
      proofRequirement: "Use customer proof and product evidence only.",
      targetCta: "Start a report check",
      dueDate: new Date("2026-05-14T00:00:00.000Z"),
    });

    expect(result.success).toBe(true);
  });

  it("only allows the modeled state transitions", () => {
    expect(canTransitionOpportunity(OpportunityStatus.INTAKE, "start-triage")).toBe(true);
    expect(canTransitionOpportunity(OpportunityStatus.TRIAGE, "ready")).toBe(true);
    expect(canTransitionOpportunity(OpportunityStatus.READY_FOR_DRAFT, "start-triage")).toBe(false);
    expect(canTransitionOpportunity(OpportunityStatus.ARCHIVED, "ready")).toBe(false);
  });
});
