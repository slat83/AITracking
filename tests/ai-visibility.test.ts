import { describe, expect, it } from "vitest";

import {
  aiVisibilityPages,
  buildBreadcrumbs,
  buildJsonLd,
  getCoreAiVisibilityPages,
} from "@/content/ai-visibility";

describe("AI visibility content model", () => {
  it("keeps the four priority routes in the content source", () => {
    expect(getCoreAiVisibilityPages().map((page) => page.pathname)).toEqual([
      "/trust",
      "/methodology",
      "/sample-audit",
      "/help/faq",
    ]);
  });

  it("builds breadcrumbs from the same pathname source", () => {
    expect(buildBreadcrumbs("/sample-audit")).toEqual([
      { name: "Home", href: "/" },
      { name: "Sample AI Visibility Audit", href: "/sample-audit" },
    ]);
  });

  it("generates faq schema from visible faq content", () => {
    const page = aiVisibilityPages.find((item) => item.pathname === "/help/faq");

    expect(page).toBeDefined();

    const jsonLd = buildJsonLd(page!);
    const faqSchema = jsonLd.find(
      (item) => typeof item === "object" && item !== null && item["@type"] === "FAQPage",
    );

    expect(faqSchema).toBeDefined();
    expect(faqSchema).toMatchObject({
      "@type": "FAQPage",
      mainEntity: page!.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  });
});
