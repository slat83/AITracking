import type { Metadata } from "next";

import { absoluteUrl, siteConfig } from "@/lib/site";

type PageKind = "article" | "webpage" | "author";

type LinkItem = {
  href: string;
  label: string;
};

type FactItem = {
  label: string;
  value: string;
  detail: string;
};

type Section = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

type FaqItem = {
  question: string;
  answer: string;
};

type PageAuthor = {
  name: string;
  role: string;
  slug: string;
};

export type AiVisibilityPage = {
  pathname: string;
  kind: PageKind;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  answerSummary: string;
  intro: string;
  updatedAt: string;
  reviewedAt: string;
  author: PageAuthor;
  facts: FactItem[];
  sections: Section[];
  faq: FaqItem[];
  relatedLinks: LinkItem[];
  primaryCta: LinkItem;
  secondaryCta?: LinkItem;
  indexable?: boolean;
};

const founderDeskAuthor: PageAuthor = {
  name: "Flowvory Founder Desk",
  role: "Founder-led audit delivery",
  slug: "founder-desk",
};

const sharedFacts = {
  delivery: {
    label: "Delivery motion",
    value: "Founder-led diagnostic",
    detail: "Flowvory sells a fixed-scope audit first, then uses the workspace for guided follow-through.",
  },
  audience: {
    label: "Best fit",
    value: "Lean eCommerce brands",
    detail: "The current offer is aimed at founder-led or lean teams that need clarity before they scale AI visibility work.",
  },
  access: {
    label: "Access model",
    value: "Invite-only workspace",
    detail: "There is no self-serve product path in this slice. Access is provisioned after manual fit review.",
  },
  timing: {
    label: "Output shape",
    value: "30-day action plan",
    detail: "Every public surface points back to a practical audit summary and a prioritized next-step plan.",
  },
};

export const aiVisibilityPages: AiVisibilityPage[] = [
  {
    pathname: "/trust",
    kind: "webpage",
    title: "Flowvory Trust Center",
    description:
      "Company, access, privacy, delivery, and support expectations for Flowvory's founder-led AI Visibility Audit for eCommerce brands.",
    eyebrow: "Trust center",
    h1: "Trust the operating model before you trust the audit.",
    answerSummary:
      "Flowvory is currently sold as a founder-led, fixed-scope AI Visibility Audit for eCommerce brands. Access is invite-only, delivery is manual, and the workspace is provisioned only after fit review.",
    intro:
      "This trust surface is intentionally practical. It explains who the service is for, how access works, what a client receives, and where Flowvory is deliberately not overclaiming product maturity.",
    updatedAt: "2026-05-10",
    reviewedAt: "2026-05-10",
    author: founderDeskAuthor,
    facts: [sharedFacts.delivery, sharedFacts.audience, sharedFacts.access],
    sections: [
      {
        title: "Who Flowvory is for",
        paragraphs: [
          "The current offer is designed for founder-led or lean eCommerce brands that know AI-mediated discovery matters but do not yet have a clear picture of where they are weak, invisible, or structurally underrepresented.",
          "It is not positioned as a broad agency retainer, a generic GEO platform, or a self-serve SaaS signup flow.",
        ],
      },
      {
        title: "How access and delivery work",
        paragraphs: [
          "Flowvory reviews pilot fit manually, prepares the workspace after acceptance, and uses that invite-only environment to collect inputs, show status, and deliver findings.",
          "That means the public site should set expectations clearly: no open registration, no fake automation, and no implied instant software onboarding.",
        ],
        bullets: [
          "Manual fit review before workspace access is provisioned.",
          "Invite-only sign-in for accepted customers and operators.",
          "Audit output centered on findings, evidence, and a practical 30-day plan.",
        ],
      },
      {
        title: "Privacy, billing, and support posture",
        paragraphs: [
          "Client inputs are collected for audit delivery and workspace collaboration, not for a public self-serve funnel. Privacy expectations should be confirmed before a pilot workspace is opened.",
          "Billing terms, delivery expectations, and any follow-up support scope are handled as part of the manual pilot agreement rather than implied through generic SaaS pricing copy.",
        ],
      },
      {
        title: "What Flowvory does not promise",
        paragraphs: [
          "The audit does not guarantee rankings, category wins, or automatic implementation. It is a diagnostic and prioritization service.",
          "Flowvory is also not claiming public case-study proof, testimonial volume, or refund language that has not been finalized in the product and operating workflow yet.",
        ],
      },
    ],
    faq: [
      {
        question: "Is Flowvory self-serve?",
        answer:
          "No. The current slice is an invite-only, founder-led service workflow rather than a self-serve signup product.",
      },
      {
        question: "What happens after a brand is accepted?",
        answer:
          "Flowvory provisions a workspace, confirms inputs, completes the audit, and delivers a prioritized 30-day action plan with supporting evidence.",
      },
      {
        question: "Does this page publish detailed pricing or refund promises?",
        answer:
          "No. Those terms are intentionally handled during manual pilot scoping so the public site does not imply policies that have not been operationalized yet.",
      },
    ],
    relatedLinks: [
      { href: "/methodology", label: "Review the audit method" },
      { href: "/sample-audit", label: "See the sample audit structure" },
      { href: "/help/faq", label: "Read the audit FAQ" },
      { href: "/sign-in", label: "Access the invite-only workspace" },
    ],
    primaryCta: { href: "/sample-audit", label: "See a sample audit" },
    secondaryCta: { href: "/sign-in", label: "Open workspace access" },
  },
  {
    pathname: "/methodology",
    kind: "webpage",
    title: "Flowvory Audit Method",
    description:
      "What Flowvory reviews during an AI Visibility Audit, how findings are prioritized, and what the 30-day action plan includes.",
    eyebrow: "Method",
    h1: "How the audit works before any recommendations are made.",
    answerSummary:
      "Flowvory reviews priority discovery prompts, competitor patterns, trust surfaces, and core commerce pages to identify visibility gaps, weak representation, and the actions that matter first.",
    intro:
      "The method exists to make the output defensible. It keeps the audit grounded in observed surfaces, not vague platform claims or unsupported ranking promises.",
    updatedAt: "2026-05-10",
    reviewedAt: "2026-05-10",
    author: founderDeskAuthor,
    facts: [sharedFacts.delivery, sharedFacts.timing, sharedFacts.audience],
    sections: [
      {
        title: "Surfaces reviewed",
        paragraphs: [
          "The audit focuses on the pages and signals that influence AI-mediated buying journeys: homepage and category framing, product-detail pages, trust and policy surfaces, editorial or help content, and the way a brand appears relative to substitutes or competitors.",
          "The point is not to score every asset equally. It is to find the gaps most likely to distort how the brand is retrieved, summarized, or trusted.",
        ],
        bullets: [
          "Category and product-detail surfaces.",
          "Trust, policy, help, and support surfaces.",
          "Competitor and substitute comparison patterns.",
          "Priority query themes connected to the client's commercial question.",
        ],
      },
      {
        title: "How findings are prioritized",
        paragraphs: [
          "Flowvory prioritizes issues by buyer impact, trust risk, and implementation leverage. That keeps the first action plan small enough to execute and meaningful enough to change outcomes.",
          "Some fixes may be content or structured-data changes. Others may be trust, conversion, or proof gaps that block credibility even when discoverability is improving.",
        ],
      },
      {
        title: "What the client receives",
        paragraphs: [
          "The end product is a founder-readable audit summary, a clear set of visibility and trust findings, and a practical 30-day action plan with owner and effort guidance.",
          "The workspace can also hold supporting screenshots, linked evidence, and the next questions Flowvory needs answered during onboarding or follow-up.",
        ],
      },
      {
        title: "What this method does not claim",
        paragraphs: [
          "The method does not promise instant gains, guaranteed rankings, or broad automation. It is a structured way to diagnose the brand's current position and identify the highest-value next moves.",
        ],
      },
    ],
    faq: [
      {
        question: "Does the audit only review content?",
        answer:
          "No. It also reviews trust, conversion, proof, and competitive representation where those factors affect AI-mediated discovery and buyer confidence.",
      },
      {
        question: "Are recommendations automated?",
        answer:
          "No. The current service is founder-led and manually reviewed so the output reflects real commercial tradeoffs rather than generic automation.",
      },
      {
        question: "Will the audit implement fixes automatically?",
        answer:
          "No. The default output is a prioritized action plan. Implementation can be handled separately once the findings are clear.",
      },
    ],
    relatedLinks: [
      { href: "/trust", label: "Open the trust center" },
      { href: "/sample-audit", label: "Inspect the sample audit" },
      { href: "/help/faq", label: "Read scope and access questions" },
      { href: "/sign-in", label: "Open the workspace" },
    ],
    primaryCta: { href: "/sample-audit", label: "See the deliverable structure" },
    secondaryCta: { href: "/trust", label: "Review trust details" },
  },
  {
    pathname: "/sample-audit",
    kind: "article",
    title: "Sample AI Visibility Audit",
    description:
      "A sample Flowvory deliverable outline showing the structure of the founder-led AI Visibility Audit and 30-day action plan.",
    eyebrow: "Sample deliverable",
    h1: "See the audit structure before you commit to the process.",
    answerSummary:
      "Flowvory's sample audit is meant to show the shape of the deliverable: executive summary, visibility findings, trust and conversion risks, and a prioritized 30-day action plan.",
    intro:
      "This is intentionally a structure-first surface, not a fabricated case study. The goal is to make the output legible without inventing client results or unsupported proof.",
    updatedAt: "2026-05-10",
    reviewedAt: "2026-05-10",
    author: founderDeskAuthor,
    facts: [sharedFacts.timing, sharedFacts.delivery, sharedFacts.access],
    sections: [
      {
        title: "What the sample shows",
        paragraphs: [
          "A useful sample deliverable helps a founder understand how the audit will be read internally and acted on after delivery.",
          "The structure should make it obvious where the summary lives, how findings are grouped, and which actions are expected to move first in the next 30 days.",
        ],
        bullets: [
          "Executive summary and core diagnosis.",
          "Priority visibility findings by surface or query theme.",
          "Trust and conversion risks that limit downstream impact.",
          "Recommended next actions with owner and effort guidance.",
        ],
      },
      {
        title: "How to read the output",
        paragraphs: [
          "The audit is not meant to overwhelm the client with every possible issue. It is meant to clarify what matters first and why.",
          "That is why the sample format emphasizes prioritization, evidence, and practical sequencing instead of broad narrative polish.",
        ],
      },
      {
        title: "Why this is a sample, not a case study",
        paragraphs: [
          "Flowvory should not imply validated outcome claims that are not yet publicly supported. This page is therefore explicit that the sample is a format preview, not a portfolio of guaranteed results.",
        ],
      },
    ],
    faq: [
      {
        question: "Does the sample include real customer outcomes?",
        answer:
          "No. It is a structure preview designed to show what the audit contains without overstating public proof.",
      },
      {
        question: "Will every client get the same recommendations?",
        answer:
          "No. The structure stays consistent, but the findings and action plan depend on the brand, competitors, and the commercial question under review.",
      },
      {
        question: "What happens after the sample stage?",
        answer:
          "Accepted clients move into an invite-only workspace where Flowvory confirms inputs, completes the audit, and publishes the final deliverable.",
      },
    ],
    relatedLinks: [
      { href: "/methodology", label: "Review the audit method" },
      { href: "/trust", label: "Review trust and delivery expectations" },
      { href: "/help/faq", label: "Read the audit FAQ" },
      { href: "/sign-in", label: "Open workspace access" },
    ],
    primaryCta: { href: "/methodology", label: "Review the method" },
    secondaryCta: { href: "/sign-in", label: "Access the workspace" },
  },
  {
    pathname: "/help/faq",
    kind: "webpage",
    title: "Flowvory Audit FAQ",
    description:
      "Scope, timing, inputs, access, and follow-up expectations for Flowvory's founder-led AI Visibility Audit.",
    eyebrow: "FAQ",
    h1: "Answers to the questions founders usually ask before an audit starts.",
    answerSummary:
      "The Flowvory FAQ explains who the audit is for, what inputs are required, how the invite-only workspace works, and what the 30-day action plan is designed to help a team do next.",
    intro:
      "This FAQ supports the public audit story without turning it into a broad support center. It stays focused on audit scope, timing, access, and follow-up expectations.",
    updatedAt: "2026-05-10",
    reviewedAt: "2026-05-10",
    author: founderDeskAuthor,
    facts: [sharedFacts.audience, sharedFacts.access, sharedFacts.timing],
    sections: [
      {
        title: "Common scope questions",
        paragraphs: [
          "Founders usually want to know whether the audit is a strategy deck, a software product, or an implementation retainer. The answer is none of those exactly: it is a fixed-scope diagnostic built to clarify where to act first.",
          "The audit is narrow by design because clarity is more valuable than pretending every marketing and product problem will be solved in one pass.",
        ],
      },
      {
        title: "Inputs and onboarding",
        paragraphs: [
          "Accepted clients are expected to confirm brand basics, priority surfaces, competitors, and the main business question they want the audit to answer.",
          "That onboarding happens inside the workspace so Flowvory can keep context, status, and evidence in one system of record.",
        ],
      },
      {
        title: "Access and follow-up",
        paragraphs: [
          "Workspace access is invite-only in this phase. The system is not intended for anonymous product exploration or open registration.",
          "After delivery, the workspace can support clarifying questions and next-step coordination, but that does not imply a packaged long-term software subscription yet.",
        ],
      },
    ],
    faq: [
      {
        question: "Who is the audit best for?",
        answer:
          "Founder-led or lean eCommerce brands that need a clearer view of AI visibility, trust risk, and the fixes that matter first.",
      },
      {
        question: "What inputs are required?",
        answer:
          "At minimum Flowvory needs the brand context, priority surfaces, competitor set, and the core business question the founder wants answered.",
      },
      {
        question: "How do clients access the workspace?",
        answer:
          "Access is provisioned manually after fit review. There is no open signup flow in this slice.",
      },
      {
        question: "Is implementation included?",
        answer:
          "Not by default. The core deliverable is the diagnosis and prioritized 30-day action plan.",
      },
    ],
    relatedLinks: [
      { href: "/sample-audit", label: "See the sample audit" },
      { href: "/methodology", label: "Review the audit method" },
      { href: "/trust", label: "Review trust and access details" },
      { href: "/sign-in", label: "Open workspace access" },
    ],
    primaryCta: { href: "/sample-audit", label: "See the sample audit" },
    secondaryCta: { href: "/sign-in", label: "Access the workspace" },
  },
  {
    pathname: "/authors/founder-desk",
    kind: "author",
    title: "Flowvory Founder Desk",
    description:
      "Editorial and delivery entity for Flowvory's founder-led audit, trust, and methodology surfaces.",
    eyebrow: "Team",
    h1: "Flowvory Founder Desk",
    answerSummary:
      "The public audit surfaces are maintained as founder-led delivery pages rather than as a scaled editorial content program.",
    intro:
      "This author surface exists so public pages can link to a stable delivery entity without implying a broader editorial newsroom or fake team scale.",
    updatedAt: "2026-05-10",
    reviewedAt: "2026-05-10",
    author: founderDeskAuthor,
    facts: [sharedFacts.delivery, sharedFacts.audience, sharedFacts.access],
    sections: [
      {
        title: "Role of this surface",
        paragraphs: [
          "The Founder Desk maintains the public explanation of the audit offer, trust posture, and delivery method.",
          "It signals accountable ownership for the current public surfaces without inventing a larger editorial or customer-success structure than the company actually has today.",
        ],
      },
    ],
    faq: [
      {
        question: "Why publish an author or owner surface at all?",
        answer:
          "It creates a stable entity reference for trust, methodology, and sample-deliverable pages while keeping the public story founder-led and accountable.",
      },
    ],
    relatedLinks: [
      { href: "/trust", label: "Trust center" },
      { href: "/methodology", label: "Methodology" },
      { href: "/sample-audit", label: "Sample audit" },
    ],
    primaryCta: { href: "/trust", label: "Open the trust center" },
    indexable: false,
  },
];

const pageLookup = new Map(aiVisibilityPages.map((page) => [page.pathname, page]));

export function getAiVisibilityPage(pathname: string) {
  return pageLookup.get(pathname);
}

export function getCoreAiVisibilityPages() {
  return aiVisibilityPages.filter((page) =>
    ["/sample-audit", "/methodology", "/trust", "/help/faq"].includes(page.pathname),
  );
}

export function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  return [
    { name: "Home", href: "/" },
    ...segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;
      const page = getAiVisibilityPage(href);
      const name = page?.title ?? segment.replace(/-/g, " ");
      return { name, href };
    }),
  ];
}

export function buildPageMetadata(page: AiVisibilityPage): Metadata {
  const canonical = absoluteUrl(page.pathname);
  const metadataType = page.kind === "article" ? "article" : "website";

  return {
    title: `${page.title} | ${siteConfig.titleSuffix}`,
    description: page.description,
    alternates: {
      canonical,
    },
    robots:
      page.indexable === false
        ? {
            index: false,
            follow: false,
          }
        : undefined,
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonical,
      siteName: siteConfig.name,
      locale: siteConfig.defaultLocale,
      type: metadataType,
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
    },
  };
}

export function buildJsonLd(page: AiVisibilityPage) {
  const pageUrl = absoluteUrl(page.pathname);
  const authorUrl = absoluteUrl(`/authors/${page.author.slug}`);
  const breadcrumbs = buildBreadcrumbs(page.pathname);
  const isArticle = page.kind === "article";
  const pageType = page.kind === "author" ? "ProfilePage" : isArticle ? "Article" : "WebPage";

  const graph: Array<Record<string, unknown>> = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${siteConfig.siteUrl}#organization`,
      name: siteConfig.name,
      url: siteConfig.siteUrl,
      description: siteConfig.description,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${siteConfig.siteUrl}#website`,
      url: siteConfig.siteUrl,
      name: siteConfig.name,
      description: siteConfig.description,
      publisher: {
        "@id": `${siteConfig.siteUrl}#organization`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": pageType,
      "@id": `${pageUrl}#page`,
      url: pageUrl,
      name: page.title,
      headline: page.h1,
      description: page.description,
      dateModified: page.updatedAt,
      datePublished: page.reviewedAt,
      inLanguage: "en-US",
      isPartOf: {
        "@id": `${siteConfig.siteUrl}#website`,
      },
      author: {
        "@type": "Person",
        name: page.author.name,
        url: authorUrl,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: absoluteUrl(item.href),
      })),
    },
  ];

  if (page.faq.length > 0) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  return graph;
}
