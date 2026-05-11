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
            Flowvory
          </Link>
          <nav className="siteNav" aria-label="Primary">
            <Link href={"/sample-audit" as Route}>Sample audit</Link>
            <Link href={"/methodology" as Route}>Method</Link>
            <Link href={"/trust" as Route}>Trust</Link>
            <Link href={"/help/faq" as Route}>FAQ</Link>
            <Link href={session ? "/app" : "/sign-in"}>{session ? "Workspace" : "Sign in"}</Link>
          </nav>
        </header>

        <section className="hero marketingHero">
          <div className="eyebrow">Founder-led AI Visibility Audit for eCommerce</div>
          <h1>Find where your brand is missing from AI-driven buying journeys.</h1>
          <p className="lede">
            Flowvory runs a founder-led AI Visibility Audit for lean eCommerce brands and delivers
            a prioritized 30-day action plan covering discovery gaps, trust weaknesses, and the
            fixes that matter first.
          </p>
          <p className="introCopy">
            This public surface is intentionally narrow. It explains the offer, the audit method,
            the sample deliverable, and the invite-only access model without pretending the current
            product is a self-serve SaaS.
          </p>
          <div className="buttonRow">
            <Link className="button buttonPrimary" href={"/sample-audit" as Route}>
              See a sample audit
            </Link>
            <Link className="button buttonSecondary" href={session ? "/app" : "/sign-in"}>
              {session ? "Open workspace" : "Access invite-only workspace"}
            </Link>
          </div>
        </section>

        <section className="factsGrid">
          <article className="card factCard">
            <p className="metaLabel">Offer</p>
            <p className="factValue">Fixed-scope audit</p>
            <p className="muted">
              Flowvory sells one bounded diagnostic first instead of a broad platform promise.
            </p>
          </article>
          <article className="card factCard">
            <p className="metaLabel">Best fit</p>
            <p className="factValue">Founder-led brands</p>
            <p className="muted">
              The current buyer is a lean eCommerce team that needs clarity before scaling AI
              visibility work.
            </p>
          </article>
          <article className="card factCard">
            <p className="metaLabel">Access</p>
            <p className="factValue">Invite-only workspace</p>
            <p className="muted">
              Accepted customers move into a guided workspace instead of a self-serve dashboard.
            </p>
          </article>
        </section>

        <section className="corePageSection">
          <div className="sectionIntro">
            <div className="eyebrow">Public path</div>
            <h2 className="section-title">One coherent story across the launch surfaces.</h2>
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
