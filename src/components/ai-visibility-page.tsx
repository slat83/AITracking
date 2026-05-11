import type { Route } from "next";
import Link from "next/link";

import type { AiVisibilityPage } from "@/content/ai-visibility";
import { buildBreadcrumbs, buildJsonLd } from "@/content/ai-visibility";
import { JsonLd } from "@/components/json-ld";
import { VisibilityTracker } from "@/components/visibility-tracker";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function AiVisibilityPageTemplate({ page }: { page: AiVisibilityPage }) {
  const breadcrumbs = buildBreadcrumbs(page.pathname);
  const jsonLd = buildJsonLd(page);
  const authorHref = `/authors/${page.author.slug}` as Route;

  return (
    <main className="marketingPage">
      <VisibilityTracker pathname={page.pathname} pageTitle={page.title} />
      {jsonLd.map((item, index) => (
        <JsonLd key={`${page.pathname}-jsonld-${index}`} data={item} />
      ))}
      <div className="shell">
        <header className="siteHeader">
          <Link className="siteBrand" href="/">
            Flowvory
          </Link>
          <nav className="siteNav" aria-label="Primary">
            <Link href={"/sample-audit" as Route}>Sample audit</Link>
            <Link href={"/methodology" as Route}>Method</Link>
            <Link href={"/trust" as Route}>Trust</Link>
            <Link href={"/help/faq" as Route}>FAQ</Link>
            <Link href="/sign-in">Sign in</Link>
          </nav>
        </header>

        <nav className="breadcrumbs" aria-label="Breadcrumb">
          {breadcrumbs.map((item, index) => (
            <span key={item.href}>
              {index > 0 ? <span className="breadcrumbDivider">/</span> : null}
              <Link href={item.href as Route}>{item.name}</Link>
            </span>
          ))}
        </nav>

        <section className="hero marketingHero">
          <div className="eyebrow">{page.eyebrow}</div>
          <h1>{page.h1}</h1>
          <p className="lede">{page.answerSummary}</p>
          <p className="introCopy">{page.intro}</p>
          <div className="buttonRow">
            <Link
              className="button buttonPrimary"
              href={page.primaryCta.href as Route}
              data-visibility-cta="primary"
            >
              {page.primaryCta.label}
            </Link>
            {page.secondaryCta ? (
              <Link
                className="button buttonSecondary"
                href={page.secondaryCta.href as Route}
                data-visibility-cta="secondary"
              >
                {page.secondaryCta.label}
              </Link>
            ) : null}
          </div>
        </section>

        <section className="pageMetaGrid">
          <article className="card metaCard">
            <p className="metaLabel">Updated</p>
            <p className="metaValue">{formatDate(page.updatedAt)}</p>
          </article>
          <article className="card metaCard">
            <p className="metaLabel">Reviewed</p>
            <p className="metaValue">{formatDate(page.reviewedAt)}</p>
          </article>
          <article className="card metaCard">
            <p className="metaLabel">Author</p>
            <p className="metaValue">
              <Link href={authorHref}>{page.author.name}</Link>
            </p>
          </article>
        </section>

        <section className="factsGrid">
          {page.facts.map((fact) => (
            <article key={fact.label} className="card factCard">
              <p className="metaLabel">{fact.label}</p>
              <p className="factValue">{fact.value}</p>
              <p className="muted">{fact.detail}</p>
            </article>
          ))}
        </section>

        <section className="contentGrid">
          <div className="stack pageSections">
            {page.sections.map((section) => (
              <article key={section.title} className="card pageSection">
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="muted">
                    {paragraph}
                  </p>
                ))}
                {section.bullets ? (
                  <ul className="detailList">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>

          <aside className="stack pageSidebar">
            <article className="card sidebarCard">
              <h2>Related pages</h2>
              <ul className="clean linkList">
                {page.relatedLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href as Route}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </article>

            <article className="card sidebarCard">
              <h2>Delivery note</h2>
              <p className="muted">
                These pages explain the founder-led pilot clearly, but they do not imply a public
                self-serve product or guaranteed outcomes.
              </p>
            </article>
          </aside>
        </section>

        <section className="faqSection">
          <div className="sectionIntro">
            <div className="eyebrow">FAQ</div>
            <h2 className="section-title">Plain answers to the real objections.</h2>
          </div>
          <div className="stack">
            {page.faq.map((item) => (
              <article key={item.question} className="card faqCard">
                <h3>{item.question}</h3>
                <p className="muted">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
