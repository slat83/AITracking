import { notFound } from "next/navigation";

import { prisma } from "@/server/db/client";

import { acceptPilotInviteAction } from "./actions";

type PageProps = {
  params: Promise<{ token: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getMessage(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PilotInvitePage({ params, searchParams }: PageProps) {
  const { token } = await params;
  const query = (await searchParams) ?? {};
  const error = getMessage(query.error);
  const nowRows = await prisma.$queryRaw<Array<{ now: Date }>>`SELECT NOW() AS now`;
  const now = nowRows[0]?.now ?? new Date(0);

  const invite = await prisma.pilotInvite.findUnique({
    where: { token },
    include: {
      pilot: true,
      contact: true,
    },
  });

  if (!invite) {
    notFound();
  }

  const expired = Boolean(invite.acceptedAt) || invite.expiresAt.getTime() < now.getTime();

  return (
    <main className="shell">
      <section className="card formCard">
        <div className="eyebrow">Invite-only workspace access</div>
        <h1 style={{ fontSize: "2.25rem", marginBottom: 12 }}>Join the {invite.pilot.brandName} workspace</h1>
        <p className="muted signInHint">
          This invite grants access to the founder-led Flowvory audit workspace for {invite.contact.email}.
          Set your password here once, then use the normal sign-in page for future access.
        </p>

        {expired ? (
          <p style={{ color: "#b91c1c", marginTop: 20 }}>
            This invite is no longer active. Ask Flowvory to resend it.
          </p>
        ) : (
          <form action={acceptPilotInviteAction} className="stack" style={{ marginTop: 20 }}>
            <input name="token" type="hidden" value={token} />
            <label className="field">
              <span>Your name</span>
              <input defaultValue={invite.contact.name} name="name" required />
            </label>
            <label className="field">
              <span>Email</span>
              <input defaultValue={invite.contact.email} disabled type="email" />
            </label>
            <label className="field">
              <span>Create password</span>
              <input minLength={10} name="password" required type="password" />
            </label>
            {error ? <p style={{ color: "#b91c1c", margin: 0 }}>{error}</p> : null}
            <button className="button buttonPrimary" type="submit">
              Activate workspace access
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
