import type { MetadataRoute } from "next";

import { aiVisibilityPages } from "@/content/ai-visibility";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    {
      url: absoluteUrl("/"),
      lastModified: "2026-05-10",
      changeFrequency: "weekly" as const,
      priority: 1,
    },
  ];

  const contentPages = aiVisibilityPages.map((page) => ({
    url: absoluteUrl(page.pathname),
    lastModified: page.updatedAt,
    changeFrequency: page.kind === "article" ? ("weekly" as const) : ("monthly" as const),
    priority: page.pathname.startsWith("/compare/")
      || page.pathname.startsWith("/trust/is-epicvin-legit")
      || page.pathname.startsWith("/pricing/cheap-vin-check")
      ? 0.9
      : 0.7,
  }));

  return [...staticPages, ...contentPages];
}
