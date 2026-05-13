import "dotenv/config";

import { prisma } from "@/server/db/client";
import {
  issueDashboardApiToken,
  revokeDashboardApiTokenById,
  type DashboardApiTokenScope,
} from "@/server/dashboard/token-registry";

type Command = "issue" | "revoke" | "list";

type ParsedArgs = {
  command: Command;
  label?: string;
  scopes?: string;
  consumerId?: string;
  notes?: string;
  workspaceSlug?: string;
  token?: string;
  id?: string;
  includeRevoked?: boolean;
};

function parseArgs(argv: string[]): ParsedArgs {
  const [command, ...rest] = argv;

  if (command !== "issue" && command !== "revoke" && command !== "list") {
    throw new Error(
      "Usage:\n"
      + "  tsx scripts/manage-dashboard-api-tokens.ts issue --label <label> [--scopes dashboard:read,dashboard:write] [--consumer <id>] [--workspace <slug>] [--notes <text>] [--token <raw-token>]\n"
      + "  tsx scripts/manage-dashboard-api-tokens.ts revoke --id <token-id>\n"
      + "  tsx scripts/manage-dashboard-api-tokens.ts list [--include-revoked]",
    );
  }

  const options: ParsedArgs = { command };
  const args = [...rest];

  while (args.length > 0) {
    const key = args.shift();

    if (!key) {
      continue;
    }

    if (key === "--include-revoked") {
      options.includeRevoked = true;
      continue;
    }

    const value = args.shift();

    if (!value) {
      throw new Error(`Missing value for ${key}.`);
    }

    switch (key) {
      case "--label":
        options.label = value;
        break;
      case "--scopes":
        options.scopes = value;
        break;
      case "--consumer":
        options.consumerId = value;
        break;
      case "--notes":
        options.notes = value;
        break;
      case "--workspace":
        options.workspaceSlug = value;
        break;
      case "--token":
        options.token = value;
        break;
      case "--id":
        options.id = value;
        break;
      default:
        throw new Error(`Unknown argument: ${key}`);
    }
  }

  return options;
}

async function resolveWorkspaceId(workspaceSlug?: string) {
  if (!workspaceSlug) {
    return null;
  }

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    select: { id: true },
  });

  if (!workspace) {
    throw new Error(`Workspace not found for slug: ${workspaceSlug}`);
  }

  return workspace.id;
}

function parseScopeList(scopeList?: string): DashboardApiTokenScope[] {
  if (!scopeList?.trim()) {
    return ["dashboard:write"];
  }

  return scopeList.split(",").map((scope) => scope.trim()) as DashboardApiTokenScope[];
}

async function issueToken(args: ParsedArgs) {
  if (!args.label?.trim()) {
    throw new Error("--label is required for issue.");
  }

  const workspaceId = await resolveWorkspaceId(args.workspaceSlug);
  const result = await issueDashboardApiToken({
    label: args.label,
    scopes: parseScopeList(args.scopes),
    consumerId: args.consumerId,
    notes: args.notes,
    workspaceId,
    token: args.token,
  });

  console.log(JSON.stringify({
    ok: true,
    action: "issue",
    token: {
      id: result.id,
      label: result.label,
      scopes: result.scopes,
      workspaceId: result.workspaceId,
      consumerId: result.consumerId,
      token: result.token,
    },
  }, null, 2));
}

async function revokeToken(args: ParsedArgs) {
  if (!args.id?.trim()) {
    throw new Error("--id is required for revoke.");
  }

  const record = await revokeDashboardApiTokenById(args.id.trim());

  console.log(JSON.stringify({
    ok: true,
    action: "revoke",
    token: {
      id: record.id,
      label: record.label,
      revokedAt: record.revokedAt,
      updatedAt: record.updatedAt,
    },
  }, null, 2));
}

async function listTokens(args: ParsedArgs) {
  const tokens = await prisma.dashboardApiToken.findMany({
    where: args.includeRevoked ? undefined : { revokedAt: null },
    orderBy: [{ createdAt: "desc" }],
    include: {
      workspace: {
        select: {
          id: true,
          slug: true,
          name: true,
        },
      },
    },
  });

  console.log(JSON.stringify({
    ok: true,
    action: "list",
    includeRevoked: Boolean(args.includeRevoked),
    tokens: tokens.map((token) => ({
      id: token.id,
      label: token.label,
      scopes: token.scopes,
      consumerId: token.consumerId,
      notes: token.notes,
      workspace: token.workspace,
      lastUsedAt: token.lastUsedAt,
      revokedAt: token.revokedAt,
      createdAt: token.createdAt,
      updatedAt: token.updatedAt,
    })),
  }, null, 2));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.command === "issue") {
    await issueToken(args);
    return;
  }

  if (args.command === "revoke") {
    await revokeToken(args);
    return;
  }

  await listTokens(args);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
