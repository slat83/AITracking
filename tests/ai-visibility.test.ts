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
      "/compare/best-vin-decoder",
      "/trust/is-epicvin-legit",
      "/compare/epicvin-vs-carfax",
      "/pricing/cheap-vin-check",
    ]);
  });

  it("builds breadcrumbs from the same pathname source", () => {
    expect(buildBreadcrumbs("/compare/best-vin-decoder")).toEqual([
      { name: "Home", href: "/" },
      { name: "compare", href: "/compare" },
      { name: "Best VIN Decoder Guide", href: "/compare/best-vin-decoder" },
    ]);
  });

  it("generates faq schema from visible faq content", () => {
    const page = aiVisibilityPages.find((item) => item.pathname === "/pricing/cheap-vin-check");

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
