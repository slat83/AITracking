import { redirect } from "next/navigation";

import { getAuthSession } from "@/server/auth";

import { SignInForm } from "./sign-in-form";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getMessage(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignInPage({ searchParams }: PageProps) {
  const session = await getAuthSession();
  const params = (await searchParams) ?? {};
  const notice = getMessage(params.notice);
  const error = getMessage(params.error);

  if (session?.user) {
    redirect("/app");
  }

  return (
    <main className="shell">
      <section className="card formCard">
        <div className="eyebrow">Invite-only workspace access</div>
        <h1 style={{ fontSize: "2.25rem", marginBottom: 12 }}>Sign in to Flowvory</h1>
        <p className="muted signInHint">
          This workspace is provisioned for accepted pilot customers and operators. If you already
          have access, continue below. If Flowvory emailed you an invite, activate that link first
          to create your workspace password.
        </p>
        {error ? <p style={{ color: "#b91c1c", marginTop: 16 }}>{error}</p> : null}
        {notice ? <p style={{ color: "#166534", marginTop: 16 }}>{notice}</p> : null}
        <SignInForm />
      </section>
    </main>
  );
}
