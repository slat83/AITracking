import { redirect } from "next/navigation";

import { getAuthSession } from "@/server/auth";

import { SignInForm } from "./sign-in-form";

export default async function SignInPage() {
  const session = await getAuthSession();

  if (session?.user) {
    redirect("/app");
  }

  return (
    <main className="shell">
      <section className="card formCard">
        <div className="eyebrow">Secure access</div>
        <h1 style={{ fontSize: "2.25rem", marginBottom: 12 }}>Sign in</h1>
        <p className="muted">
          Use the seeded admin credentials from `.env` after running the database seed.
        </p>
        <SignInForm />
      </section>
    </main>
  );
}
