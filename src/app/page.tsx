import type { Route } from "next";
import Link from "next/link";

import { getCoreAiVisibilityPages } from "@/content/ai-visibility";
import { getAuthSession } from "@/server/auth";

export default async function HomePage() {
  const session = await getAuthSession();
  const corePages = getCoreAiVisibilityPages();

  return (
    <main className="marketingPage">
      <div className="shell">
        <header className="siteHeader">
          <Link className="siteBrand" href="/">
            Content Ops Visibility
          </Link>
          <nav className="siteNav" aria-label="Primary">
            <Link href={"/compare/best-vin-decoder" as Route}>Compare</Link>
            <Link href={"/trust" as Route}>Trust</Link>
            <Link href={"/pricing/cheap-vin-check" as Route}>Pricing</Link>
            <Link href={"/help/faq" as Route}>FAQ</Link>
            <Link href={session ? "/app" : "/sign-in"}>{session ? "Operator app" : "Sign in"}</Link>
          </nav>
        </header>

        <section className="hero marketingHero">
          <div className="eyebrow">AIT-19 • AI visibility foundation</div>
          <h1>Crawlable public templates for comparison, trust, and pricing intent.</h1>
          <p className="lede">
            This slice adds a shared public-page system for the four priority vehicle-history demand
            clusters, with canonical metadata, FAQ and breadcrumb schema, support-page links,
            and crawlable HTML answers.
          </p>
          <div className="buttonRow">
            <Link className="button buttonPrimary" href={"/compare/best-vin-decoder" as Route}>
              Inspect page templates
            </Link>
            <Link className="button buttonSecondary" href={session ? "/app" : "/sign-in"}>
              {session ? "Open dashboard" : "Sign in"}
            </Link>
          </div>
        </section>

        <section className="factsGrid">
          <article className="card factCard">
            <p className="metaLabel">Template model</p>
            <p className="factValue">1 source of truth</p>
            <p className="muted">
              Page copy, breadcrumbs, metadata, related links, and schema are generated from
              the same content records.
            </p>
          </article>
          <article className="card factCard">
            <p className="metaLabel">Core routes</p>
            <p className="factValue">4 launch pages</p>
            <p className="muted">
              Best VIN decoder, legitimacy, Carfax comparison, and cheap VIN check each ship
              with shared structure.
            </p>
          </article>
          <article className="card factCard">
            <p className="metaLabel">Crawl layer</p>
            <p className="factValue">Robots + sitemap</p>
            <p className="muted">
              Public routes advertise canonical URLs and get indexed through explicit crawl
              endpoints.
            </p>
          </article>
        </section>

        <section className="corePageSection">
          <div className="sectionIntro">
            <div className="eyebrow">Priority pages</div>
            <h2 className="section-title">Four public entry points, one reusable template.</h2>
          </div>
          <div className="routeGrid">
            {corePages.map((page) => (
              <article key={page.pathname} className="card routeCard">
                <p className="metaLabel">{page.eyebrow}</p>
                <h3>{page.title}</h3>
                <p className="muted">{page.description}</p>
                <Link className="routeLink" href={page.pathname as Route}>
                  Open {page.title}
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
