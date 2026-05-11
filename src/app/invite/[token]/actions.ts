"use server";

import bcrypt from "bcryptjs";
import { PilotContactStatus } from "@prisma/client";
import { redirect } from "next/navigation";

import { prisma } from "@/server/db/client";
import { mapInviteAcceptanceStatus } from "@/server/pilots/workflow";

function redirectWithError(token: string, message: string): never {
  const params = new URLSearchParams({ error: message });
  redirect(`/invite/${token}?${params.toString()}`);
}

export async function acceptPilotInviteAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!token || !name || password.length < 10) {
    redirectWithError(token, "Add your name and a password with at least 10 characters.");
  }

  const invite = await prisma.pilotInvite.findUnique({
    where: { token },
    include: {
      pilot: true,
      contact: true,
    },
  });

  if (!invite || invite.acceptedAt || invite.expiresAt.getTime() < Date.now()) {
    redirectWithError(token, "This invite is invalid or expired. Ask Flowvory to resend it.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email: invite.contact.email },
      update: {
        name,
        passwordHash,
        role: "VIEWER",
      },
      create: {
        email: invite.contact.email,
        name,
        passwordHash,
        role: "VIEWER",
      },
    });

    await tx.pilotContact.update({
      where: { id: invite.contactId },
      data: {
        userId: user.id,
        name,
        status: PilotContactStatus.ACTIVE,
        acceptedAt: new Date(),
      },
    });

    await tx.pilotInvite.update({
      where: { id: invite.id },
      data: {
        acceptedAt: new Date(),
      },
    });

    await tx.pilot.update({
      where: { id: invite.pilotId },
      data: {
        primaryContactUserId: invite.contact.isPrimary ? user.id : invite.pilot.primaryContactUserId,
        status: mapInviteAcceptanceStatus(invite.pilot.status),
        onboardingStartedAt: invite.pilot.onboardingStartedAt ?? new Date(),
      },
    });

    await tx.auditEvent.create({
      data: {
        entityType: "Pilot",
        entityId: invite.pilotId,
        action: "invite_accepted",
        actorId: user.id,
        payload: {
          contactId: invite.contactId,
        },
      },
    });
  });

  const params = new URLSearchParams({
    notice: "Invite accepted. Sign in with the password you just created.",
  });
  redirect(`/sign-in?${params.toString()}`);
}
