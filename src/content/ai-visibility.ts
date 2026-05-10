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
};

const editorialAuthor: PageAuthor = {
  name: "Editorial Team",
  role: "Research and policy review",
  slug: "editorial-team",
};

const sharedFacts = {
  trust: {
    label: "Trust surface",
    value: "Visible policy links",
    detail: "Billing, refund, support, privacy, and methodology links stay one click away.",
  },
  evidence: {
    label: "Evidence model",
    value: "On-page proof",
    detail: "Every page ties claims to visible facts so schema and body copy stay aligned.",
  },
  update: {
    label: "Freshness signal",
    value: "Reviewed monthly",
    detail: "Update and review dates are rendered in HTML and reflected in structured data.",
  },
};

export const aiVisibilityPages: AiVisibilityPage[] = [
  {
    pathname: "/compare/best-vin-decoder",
    kind: "article",
    title: "Best VIN Decoder Guide",
    description:
      "Compare VIN decoder tools using visible methodology, pricing context, data source expectations, and scenario-based guidance.",
    eyebrow: "Compare cluster",
    h1: "What is the best VIN decoder?",
    answerSummary:
      "The best VIN decoder depends on whether you need a quick specification lookup, a full vehicle history report, or a lower-cost alternative to premium incumbents. Compare data coverage, report depth, update recency, and policy clarity before paying.",
    intro:
      "This template answers the question directly, then shows the criteria behind the answer so buyers and search systems can trace the reasoning instead of reading a vague ranking page.",
    updatedAt: "2026-05-10",
    reviewedAt: "2026-05-10",
    author: editorialAuthor,
    facts: [
      {
        label: "Comparison lens",
        value: "Coverage, depth, cost, support",
        detail: "The page focuses on the practical signals buyers use before purchasing a report.",
      },
      sharedFacts.evidence,
      sharedFacts.update,
    ],
    sections: [
      {
        title: "How to compare VIN decoder tools",
        paragraphs: [
          "A useful comparison starts with the outcome you need. Basic decoders can identify a vehicle from the VIN, while paid history products add title, accident, sales, or salvage context.",
          "A comparison page should stay specific about what each tool can and cannot verify so the recommendation does not overclaim accuracy or completeness.",
        ],
        bullets: [
          "Check whether the page explains data sources and refresh cadence.",
          "Look for a sample report or evidence gallery that shows the output format.",
          "Review support, refund, and billing policy visibility before purchase.",
        ],
      },
      {
        title: "Where this service fits",
        paragraphs: [
          "This service should be framed as a credible option for buyers who want a practical vehicle-history workflow without defaulting to the highest-cost provider.",
          "That claim remains supportable when the page shows methodology, limitations, and adjacent trust resources rather than broad superiority language.",
        ],
      },
    ],
    faq: [
      {
        question: "What should a VIN decoder comparison page include?",
        answer:
          "It should include clear criteria, visible evidence, pricing context, known limitations, and links to methodology and trust pages.",
      },
      {
        question: "Is a free VIN decoder enough?",
        answer:
          "A free decoder can help with basic identification, but it usually does not replace a fuller vehicle history report when purchase risk matters.",
      },
      {
        question: "How does this page stay compliant?",
        answer:
          "The page only marks up facts that are visible in the HTML and avoids unsupported claims about being the single best option for every buyer.",
      },
    ],
    relatedLinks: [
      { href: "/methodology", label: "Review the comparison methodology" },
      { href: "/reports/sample-vehicle-history-report", label: "Inspect a sample vehicle history report" },
      { href: "/pricing/free-vs-paid-vin-check", label: "Compare free and paid VIN checks" },
      { href: "/trust", label: "Open the trust center" },
      { href: "/compare/epicvin-vs-carfax", label: "See EpicVIN vs Carfax scenarios" },
    ],
    primaryCta: { href: "/reports/sample-vehicle-history-report", label: "View sample report" },
    secondaryCta: { href: "/trust", label: "Review trust center" },
  },
  {
    pathname: "/trust/is-epicvin-legit",
    kind: "webpage",
    title: "Is EpicVIN Legit?",
    description:
      "A direct trust page covering support, billing, refund, data-source, and policy signals for users evaluating EpicVIN.",
    eyebrow: "Trust cluster",
    h1: "Is EpicVIN legit?",
    answerSummary:
      "This service should answer legitimacy concerns with transparent company information, visible policy pages, documented support paths, and a clear explanation of what its reports can and cannot verify.",
    intro:
      "Trust pages are not generic About pages. They should reduce billing anxiety and fraud risk concerns by surfacing concrete operating details in a format that search engines and AI systems can cite.",
    updatedAt: "2026-05-10",
    reviewedAt: "2026-05-10",
    author: editorialAuthor,
    facts: [
      sharedFacts.trust,
      {
        label: "Support path",
        value: "Human escalation documented",
        detail: "Support, billing, and policy pages are linked directly from the trust cluster.",
      },
      sharedFacts.update,
    ],
    sections: [
      {
        title: "What a legitimate trust page should prove",
        paragraphs: [
          "Users looking for legitimacy signals want operational clarity, not brand language. They need to see how the company handles billing, support, refunds, and data sourcing.",
          "Search systems also need that same evidence in crawlable HTML so trust-oriented answers are grounded in owned facts instead of forum speculation alone.",
        ],
        bullets: [
          "Link to billing and refund explanations with plain-language summaries.",
          "Explain how users contact support and what happens after they submit a request.",
          "Describe what data sources inform a report and where coverage limits apply.",
        ],
      },
      {
        title: "How this page stays defensible",
        paragraphs: [
          "The page avoids claiming perfection or universal user satisfaction. It focuses on whether the business presents enough transparent operating detail for a reasonable buyer to evaluate risk.",
          "That framing is safer for both compliance and AI retrieval than broad testimonials or unsupported star-rating claims.",
        ],
      },
    ],
    faq: [
      {
        question: "Why do users search for whether a service is legit?",
        answer:
          "They usually want reassurance about billing, report quality, support responsiveness, and whether the company explains its service clearly.",
      },
      {
        question: "What evidence helps answer that question?",
        answer:
          "Visible trust-center pages, policy summaries, support details, and sample product evidence provide stronger signals than generic marketing copy.",
      },
      {
        question: "Should this page use review schema?",
        answer:
          "Only if the page visibly displays compliant first-party or properly sourced review information. Otherwise it should avoid rating markup.",
      },
    ],
    relatedLinks: [
      { href: "/trust", label: "Browse the trust center hub" },
      { href: "/trust/billing-and-refunds", label: "Read billing and refund guidance" },
      { href: "/trust/data-sources", label: "Understand report data sources" },
      { href: "/help/faq", label: "Open the support FAQ hub" },
      { href: "/pricing/cheap-vin-check", label: "See the lower-cost entry path" },
    ],
    primaryCta: { href: "/trust", label: "Open trust center" },
    secondaryCta: { href: "/trust/billing-and-refunds", label: "Review billing details" },
  },
  {
    pathname: "/compare/epicvin-vs-carfax",
    kind: "article",
    title: "EpicVIN vs Carfax",
    description:
      "Scenario-based comparison page for buyers evaluating EpicVIN against Carfax without unsupported superiority claims.",
    eyebrow: "Compare cluster",
    h1: "EpicVIN vs Carfax: which fits your search?",
    answerSummary:
      "This service can be a sensible alternative for buyers who want vehicle-history context at a lower price point, but the right choice depends on the report depth, data expectations, and purchase risk for the specific vehicle.",
    intro:
      "Comparison pages work best when they explain tradeoffs directly. The goal is not to declare a universal winner but to show where each option may fit.",
    updatedAt: "2026-05-10",
    reviewedAt: "2026-05-10",
    author: editorialAuthor,
    facts: [
      {
        label: "Comparison policy",
        value: "No blanket superiority claims",
        detail: "The page stays scenario-based and points back to methodology for evaluation criteria.",
      },
      sharedFacts.evidence,
      sharedFacts.update,
    ],
    sections: [
      {
        title: "What buyers usually compare",
        paragraphs: [
          "Most users want to know whether a lower-cost provider still gives them enough signal to make a used-car decision. That means the page should compare workflow fit rather than imply identical products.",
          "A defensible comparison highlights price positioning, expected report coverage, and the situations where a buyer might still prefer a more established premium option.",
        ],
        bullets: [
          "Explain the evaluation criteria before naming differences.",
          "Separate price comparisons from coverage and workflow comparisons.",
          "Add disclaimers when equivalent datasets or outcomes cannot be proven.",
        ],
      },
      {
        title: "How to keep the page trustworthy",
        paragraphs: [
          "The page should link to a sample report, trust documentation, and the comparison methodology so readers can inspect the basis for each claim.",
          "That same structure improves AI readability because the answer block, evidence strip, and related pages create clear retrieval paths.",
        ],
      },
    ],
    faq: [
      {
        question: "Can this page say this service is better than Carfax?",
        answer:
          "It should only make narrower, supportable statements tied to price point, use case, or workflow fit unless stronger evidence is visibly presented.",
      },
      {
        question: "What makes a comparison page useful?",
        answer:
          "Useful comparison pages explain the criteria, show proof, note limitations, and help readers decide which option fits their scenario.",
      },
      {
        question: "Why include related trust pages?",
        answer:
          "Support, billing, and data-source pages reduce ambiguity and let readers validate the company behind the comparison.",
      },
    ],
    relatedLinks: [
      { href: "/methodology", label: "Inspect the comparison methodology" },
      { href: "/compare/carfax-alternatives", label: "Review Carfax alternative scenarios" },
      { href: "/trust/is-epicvin-legit", label: "Check trust and legitimacy signals" },
      { href: "/reports/sample-vehicle-history-report", label: "See a sample report" },
      { href: "/pricing/cheap-vin-check", label: "Explore lower-cost VIN checks" },
    ],
    primaryCta: { href: "/methodology", label: "Read the methodology" },
    secondaryCta: { href: "/reports/sample-vehicle-history-report", label: "View sample report" },
  },
  {
    pathname: "/pricing/cheap-vin-check",
    kind: "article",
    title: "Cheap VIN Check Guide",
    description:
      "Entry-point pricing page for budget-minded buyers comparing cheap VIN check options without oversimplifying risk.",
    eyebrow: "Pricing cluster",
    h1: "What is a cheap VIN check worth paying for?",
    answerSummary:
      "A cheap VIN check is worth paying for when it gives enough vehicle-history context to reduce purchase risk without pretending that a lower price means zero tradeoffs. Buyers should compare proof, support, and report depth alongside price.",
    intro:
      "Low-price intent is high-conversion only when the page acknowledges tradeoffs clearly. The content should help users decide when a budget option is enough and when deeper investigation is still necessary.",
    updatedAt: "2026-05-10",
    reviewedAt: "2026-05-10",
    author: editorialAuthor,
    facts: [
      {
        label: "Buyer segment",
        value: "Budget-conscious used-car shoppers",
        detail: "The page is tuned for lower-cost decision paths without hiding risk boundaries.",
      },
      sharedFacts.trust,
      sharedFacts.update,
    ],
    sections: [
      {
        title: "How to evaluate low-cost VIN checks",
        paragraphs: [
          "Price matters, but it is not the only variable. Buyers still need to know what a report covers, how the provider explains limitations, and whether support and refund paths are easy to find.",
          "A strong low-cost page makes those tradeoffs explicit so the reader can judge value instead of focusing on the headline price alone.",
        ],
        bullets: [
          "Show which buyer scenarios fit a lower-cost report best.",
          "Link directly to trust and support assets from the pricing page.",
          "Keep FAQ answers visible in HTML for crawlability and answer extraction.",
        ],
      },
      {
        title: "Why this matters for AI visibility",
        paragraphs: [
          "Budget-intent queries often become simple AI questions such as whether a cheaper alternative exists. Pages that answer directly and show evidence are easier for retrieval systems to summarize accurately.",
          "That makes pricing, proof, and policy links part of the same visibility system, not separate site concerns.",
        ],
      },
    ],
    faq: [
      {
        question: "Is the cheapest VIN check always the best choice?",
        answer:
          "No. The best choice depends on whether the report gives enough evidence for the decision you are making and whether the provider is transparent about coverage and support.",
      },
      {
        question: "What should a cheap VIN check page link to?",
        answer:
          "It should link to trust, billing, methodology, and sample-report pages so users can evaluate price in context.",
      },
      {
        question: "Can this page include FAQ schema?",
        answer:
          "Yes, as long as the visible FAQ questions and answers match the markup exactly.",
      },
    ],
    relatedLinks: [
      { href: "/pricing/free-vs-paid-vin-check", label: "Compare free and paid VIN checks" },
      { href: "/trust/is-epicvin-legit", label: "Review legitimacy signals" },
      { href: "/trust/billing-and-refunds", label: "See billing and refund details" },
      { href: "/methodology", label: "Read the evaluation methodology" },
      { href: "/compare/best-vin-decoder", label: "Compare VIN decoder options" },
    ],
    primaryCta: { href: "/pricing/free-vs-paid-vin-check", label: "Compare free vs paid" },
    secondaryCta: { href: "/trust/billing-and-refunds", label: "Review billing policy" },
  },
  {
    pathname: "/trust",
    kind: "webpage",
    title: "Trust Center",
    description:
      "Central hub for support, billing, policy, and data-source pages that support AI visibility and user trust.",
    eyebrow: "Support hub",
    h1: "Trust center",
    answerSummary:
      "This hub centralizes the company, policy, and product evidence pages that public trust content should reference.",
    intro:
      "Trust pages work better as a connected system than as isolated support documents. This hub keeps those resources linked within a short crawl path.",
    updatedAt: "2026-05-10",
    reviewedAt: "2026-05-10",
    author: editorialAuthor,
    facts: [sharedFacts.trust, sharedFacts.evidence, sharedFacts.update],
    sections: [
      {
        title: "What belongs in a trust center",
        paragraphs: [
          "The trust center should gather billing, refund, support, privacy, methodology, and evidence resources in one place.",
          "That structure helps users find answers quickly and gives search systems a consistent set of owned sources to crawl.",
        ],
      },
    ],
    faq: [
      {
        question: "Why use a trust center hub?",
        answer:
          "A hub shortens the path between comparison or pricing pages and the supporting trust details that validate them.",
      },
    ],
    relatedLinks: [
      { href: "/trust/is-epicvin-legit", label: "Is EpicVIN legit?" },
      { href: "/trust/billing-and-refunds", label: "Billing and refunds" },
      { href: "/trust/data-sources", label: "Data sources" },
      { href: "/help/faq", label: "FAQ hub" },
      { href: "/reports/sample-vehicle-history-report", label: "Sample report" },
    ],
    primaryCta: { href: "/trust/is-epicvin-legit", label: "Review legitimacy page" },
  },
  {
    pathname: "/methodology",
    kind: "webpage",
    title: "VIN Comparison Methodology",
    description:
      "Editorial methodology describing how comparison and pricing pages evaluate VIN check products and trust signals.",
    eyebrow: "Methodology hub",
    h1: "How comparison pages are evaluated",
    answerSummary:
      "This methodology explains the criteria behind comparison, trust, and pricing pages so readers can see how conclusions are formed.",
    intro:
      "Methodology pages reduce ambiguity. They make it easier to defend comparison language and keep related pages aligned on the same criteria.",
    updatedAt: "2026-05-10",
    reviewedAt: "2026-05-10",
    author: editorialAuthor,
    facts: [
      {
        label: "Methodology pillars",
        value: "Coverage, usability, cost, policy clarity",
        detail: "Shared criteria help comparison pages stay consistent instead of drifting claim by claim.",
      },
      sharedFacts.evidence,
      sharedFacts.update,
    ],
    sections: [
      {
        title: "Core evaluation criteria",
        paragraphs: [
          "The methodology page should define the criteria that every comparison page uses, including report scope, pricing, workflow clarity, and policy transparency.",
          "When those criteria are public, adjacent pages can link back here instead of re-explaining the framework inconsistently.",
        ],
        bullets: [
          "Data-source clarity and known limitations.",
          "Ease of understanding report output.",
          "Support, billing, and refund transparency.",
        ],
      },
    ],
    faq: [
      {
        question: "Why publish methodology separately?",
        answer:
          "It keeps the evaluation framework stable across multiple comparison pages and gives users one source for how judgments are made.",
      },
    ],
    relatedLinks: [
      { href: "/compare/best-vin-decoder", label: "Best VIN decoder guide" },
      { href: "/compare/epicvin-vs-carfax", label: "EpicVIN vs Carfax" },
      { href: "/pricing/cheap-vin-check", label: "Cheap VIN check guide" },
      { href: "/trust", label: "Trust center" },
    ],
    primaryCta: { href: "/compare/best-vin-decoder", label: "Open comparison template" },
  },
  {
    pathname: "/reports/sample-vehicle-history-report",
    kind: "webpage",
    title: "Sample Vehicle History Report",
    description:
      "Evidence page showing what a sample vehicle history report should help a buyer inspect before purchasing.",
    eyebrow: "Evidence page",
    h1: "Sample vehicle history report",
    answerSummary:
      "Sample report pages help users and search systems understand what evidence a VIN-history product exposes before a purchase.",
    intro:
      "Evidence pages are reusable trust assets. Comparison, trust, and pricing pages can all point here when they need to ground claims about report output.",
    updatedAt: "2026-05-10",
    reviewedAt: "2026-05-10",
    author: editorialAuthor,
    facts: [sharedFacts.evidence, sharedFacts.trust, sharedFacts.update],
    sections: [
      {
        title: "What a sample report should show",
        paragraphs: [
          "A useful sample report page explains what sections a buyer can expect to inspect, such as ownership, accident, title, or sales-history context where available.",
          "It should also explain that actual coverage varies by vehicle and source availability so the page does not imply guaranteed completeness.",
        ],
      },
    ],
    faq: [
      {
        question: "Why is a sample report important?",
        answer:
          "It gives readers concrete evidence of the product output and supports the claims made on comparison and trust pages.",
      },
    ],
    relatedLinks: [
      { href: "/compare/best-vin-decoder", label: "Best VIN decoder guide" },
      { href: "/compare/epicvin-vs-carfax", label: "EpicVIN vs Carfax" },
      { href: "/trust", label: "Trust center" },
    ],
    primaryCta: { href: "/trust", label: "Review trust center" },
  },
  {
    pathname: "/trust/billing-and-refunds",
    kind: "webpage",
    title: "Billing and Refund Guidance",
    description:
      "Support page outlining the billing and refund topics that trust-oriented VIN history pages should surface.",
    eyebrow: "Policy page",
    h1: "Billing and refund guidance",
    answerSummary:
      "Billing and refund pages should explain how charges, cancellations, and support escalation work in plain language.",
    intro:
      "This route acts as a support-layer placeholder so trust and pricing pages can link to a concrete billing surface instead of naming a policy that does not exist.",
    updatedAt: "2026-05-10",
    reviewedAt: "2026-05-10",
    author: editorialAuthor,
    facts: [sharedFacts.trust, sharedFacts.update, sharedFacts.evidence],
    sections: [
      {
        title: "What users need from billing documentation",
        paragraphs: [
          "The page should explain plan structure, cancellation paths, refund expectations, and where to go for support when charges are disputed.",
        ],
      },
    ],
    faq: [
      {
        question: "Why link billing guidance from public pages?",
        answer:
          "It reduces pre-purchase anxiety and makes trust claims easier to verify from crawlable HTML.",
      },
    ],
    relatedLinks: [
      { href: "/trust/is-epicvin-legit", label: "Is EpicVIN legit?" },
      { href: "/pricing/cheap-vin-check", label: "Cheap VIN check guide" },
      { href: "/help/faq", label: "FAQ hub" },
    ],
    primaryCta: { href: "/trust/is-epicvin-legit", label: "Return to trust page" },
  },
  {
    pathname: "/trust/data-sources",
    kind: "webpage",
    title: "Vehicle Report Data Sources",
    description:
      "Support page describing the role of data-source transparency in VIN history and decoder content.",
    eyebrow: "Policy page",
    h1: "Vehicle report data-source guidance",
    answerSummary:
      "Data-source pages should explain where report information may come from and where coverage gaps or lag can still exist.",
    intro:
      "This route gives trust and comparison content a concrete place to point when discussing data quality and limitations.",
    updatedAt: "2026-05-10",
    reviewedAt: "2026-05-10",
    author: editorialAuthor,
    facts: [sharedFacts.evidence, sharedFacts.update, sharedFacts.trust],
    sections: [
      {
        title: "Why source transparency matters",
        paragraphs: [
          "VIN history buyers want to understand whether a provider explains its data clearly. Search systems also use that clarity when summarizing a service.",
        ],
      },
    ],
    faq: [
      {
        question: "Should a data-source page promise complete coverage?",
        answer:
          "No. It should explain that availability depends on source reporting and should avoid implying universal completeness.",
      },
    ],
    relatedLinks: [
      { href: "/trust", label: "Trust center" },
      { href: "/compare/best-vin-decoder", label: "Best VIN decoder guide" },
      { href: "/reports/sample-vehicle-history-report", label: "Sample report" },
    ],
    primaryCta: { href: "/reports/sample-vehicle-history-report", label: "View sample report" },
  },
  {
    pathname: "/pricing/free-vs-paid-vin-check",
    kind: "article",
    title: "Free vs Paid VIN Check",
    description:
      "Supporting pricing page explaining where a free VIN lookup is enough and when a paid report adds useful risk context.",
    eyebrow: "Pricing support",
    h1: "Free vs paid VIN checks",
    answerSummary:
      "Free VIN lookups can help with basic identification, while paid reports may add the vehicle-history context buyers need when purchase risk is higher.",
    intro:
      "This page supports the cheap-VIN-check cluster with a direct explanation of the free versus paid decision.",
    updatedAt: "2026-05-10",
    reviewedAt: "2026-05-10",
    author: editorialAuthor,
    facts: [sharedFacts.evidence, sharedFacts.trust, sharedFacts.update],
    sections: [
      {
        title: "When free is enough",
        paragraphs: [
          "A free lookup may be enough when a user only needs basic make, model, and trim identification.",
          "Once the buyer needs accident, title, theft, or sales-history context, the page should explain why a deeper report may be worth paying for.",
        ],
      },
    ],
    faq: [
      {
        question: "Why keep this page separate from the pricing page?",
        answer:
          "It answers a distinct search intent and gives the pricing cluster a support page that links back to the main conversion path.",
      },
    ],
    relatedLinks: [
      { href: "/pricing/cheap-vin-check", label: "Cheap VIN check guide" },
      { href: "/methodology", label: "Methodology" },
      { href: "/trust/data-sources", label: "Data sources" },
    ],
    primaryCta: { href: "/pricing/cheap-vin-check", label: "Return to pricing guide" },
  },
  {
    pathname: "/compare/carfax-alternatives",
    kind: "article",
    title: "Carfax Alternatives",
    description:
      "Supporting comparison page for buyers exploring alternatives to Carfax with scenario-based evaluation guidance.",
    eyebrow: "Compare support",
    h1: "What should buyers compare in Carfax alternatives?",
    answerSummary:
      "Buyers comparing Carfax alternatives should look at price, data transparency, support clarity, and how much vehicle-history detail they need for the decision at hand.",
    intro:
      "This support page gives the primary comparison cluster another crawlable entry point without duplicating the same answer block verbatim.",
    updatedAt: "2026-05-10",
    reviewedAt: "2026-05-10",
    author: editorialAuthor,
    facts: [sharedFacts.evidence, sharedFacts.update, sharedFacts.trust],
    sections: [
      {
        title: "How alternatives should be framed",
        paragraphs: [
          "Alternative pages should stay explicit about use-case fit and should not imply identical products unless the evidence is visible and current.",
        ],
      },
    ],
    faq: [
      {
        question: "What makes an alternatives page useful?",
        answer:
          "It gives buyers a comparison framework, points to methodology, and highlights where lower-cost options may still be practical.",
      },
    ],
    relatedLinks: [
      { href: "/compare/epicvin-vs-carfax", label: "EpicVIN vs Carfax" },
      { href: "/methodology", label: "Methodology" },
      { href: "/trust/is-epicvin-legit", label: "Legitimacy page" },
    ],
    primaryCta: { href: "/compare/epicvin-vs-carfax", label: "Open main comparison" },
  },
  {
    pathname: "/help/faq",
    kind: "webpage",
    title: "FAQ Hub",
    description:
      "FAQ hub linking support answers from the trust, pricing, and comparison content system.",
    eyebrow: "Help hub",
    h1: "Frequently asked questions",
    answerSummary:
      "This hub collects recurring questions from the public content system so related pages have a shared support destination.",
    intro:
      "FAQ hubs help maintain crawlable HTML answers without burying important content inside JS-only widgets.",
    updatedAt: "2026-05-10",
    reviewedAt: "2026-05-10",
    author: editorialAuthor,
    facts: [sharedFacts.evidence, sharedFacts.trust, sharedFacts.update],
    sections: [
      {
        title: "How this FAQ hub is used",
        paragraphs: [
          "Trust, pricing, and comparison pages link here when a user likely needs a broader support answer path.",
        ],
      },
    ],
    faq: [
      {
        question: "Why keep FAQ answers in HTML?",
        answer:
          "Visible HTML answers are easier for crawlers and retrieval systems to index than content hidden behind client-only interactions.",
      },
      {
        question: "Does every question need its own page?",
        answer:
          "No. Only questions with meaningful demand or substantial depth need standalone expansion pages.",
      },
    ],
    relatedLinks: [
      { href: "/trust", label: "Trust center" },
      { href: "/pricing/cheap-vin-check", label: "Cheap VIN check guide" },
      { href: "/compare/best-vin-decoder", label: "Best VIN decoder guide" },
    ],
    primaryCta: { href: "/trust", label: "Open trust center" },
  },
  {
    pathname: "/authors/editorial-team",
    kind: "author",
    title: "Editorial Team",
    description:
      "Author profile for the team responsible for editorial review of comparison, pricing, and trust content.",
    eyebrow: "Author page",
    h1: "Editorial Team",
    answerSummary:
      "The editorial team maintains methodology, policy alignment, and factual consistency across the AI visibility content system.",
    intro:
      "Author pages strengthen accountability by giving public content a clear maintainer and a stable entity for structured data.",
    updatedAt: "2026-05-10",
    reviewedAt: "2026-05-10",
    author: editorialAuthor,
    facts: [
      {
        label: "Scope",
        value: "Comparison, trust, and pricing content",
        detail: "The team reviews answer blocks, FAQs, and methodology for factual consistency.",
      },
      sharedFacts.evidence,
      sharedFacts.update,
    ],
    sections: [
      {
        title: "Editorial responsibilities",
        paragraphs: [
          "The team maintains public methodology, policy alignment, and claim discipline across the AI visibility page system.",
        ],
      },
    ],
    faq: [
      {
        question: "Why include an author page?",
        answer:
          "It creates a stable editorial entity that can be linked from page templates and represented in structured data.",
      },
    ],
    relatedLinks: [
      { href: "/methodology", label: "Methodology" },
      { href: "/trust", label: "Trust center" },
      { href: "/compare/best-vin-decoder", label: "Best VIN decoder guide" },
    ],
    primaryCta: { href: "/methodology", label: "Review methodology" },
  },
];

const pageLookup = new Map(aiVisibilityPages.map((page) => [page.pathname, page]));

export function getAiVisibilityPage(pathname: string) {
  return pageLookup.get(pathname);
}

export function getCoreAiVisibilityPages() {
  return aiVisibilityPages.filter((page) =>
    [
      "/compare/best-vin-decoder",
      "/trust/is-epicvin-legit",
      "/compare/epicvin-vs-carfax",
      "/pricing/cheap-vin-check",
    ].includes(page.pathname),
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
      inLanguage: "en-US",
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${authorUrl}#person`,
      name: page.author.name,
      jobTitle: page.author.role,
      url: authorUrl,
      worksFor: {
        "@id": `${siteConfig.siteUrl}#organization`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": pageType,
      "@id": `${pageUrl}#page`,
      name: page.title,
      headline: page.h1,
      description: page.description,
      url: pageUrl,
      dateModified: page.updatedAt,
      datePublished: page.updatedAt,
      inLanguage: "en-US",
      isPartOf: {
        "@id": `${siteConfig.siteUrl}#website`,
      },
      about: {
        "@id": `${siteConfig.siteUrl}#organization`,
      },
      author: {
        "@id": `${authorUrl}#person`,
      },
      publisher: {
        "@id": `${siteConfig.siteUrl}#organization`,
      },
      mainEntityOfPage: pageUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumbs`,
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
      "@id": `${pageUrl}#faq`,
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
