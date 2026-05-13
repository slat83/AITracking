import { readFile } from "node:fs/promises";

import { extractKeywordsFromWorkbook } from "@/server/dashboard/keyword-workbook";

function parseArgs(argv: string[]) {
  const args = [...argv];
  const options: {
    filePath?: string;
    sheetName?: string;
    apiBaseUrl?: string;
    mode: "append" | "replace";
  } = {
    mode: "append",
  };

  while (args.length > 0) {
    const token = args.shift();

    if (!token) {
      continue;
    }

    if (token === "--sheet") {
      options.sheetName = args.shift();
      continue;
    }

    if (token === "--api-base-url") {
      options.apiBaseUrl = args.shift();
      continue;
    }

    if (token === "--replace") {
      options.mode = "replace";
      continue;
    }

    if (!options.filePath) {
      options.filePath = token;
    }
  }

  if (!options.filePath) {
    throw new Error(
      "Usage: tsx scripts/import-keyword-workbook.ts <workbook.xlsx> [--sheet \"All Keywords\"] [--replace] [--api-base-url http://localhost:3000/api]",
    );
  }

  return options as { filePath: string; sheetName?: string; apiBaseUrl?: string; mode: "append" | "replace" };
}

function resolveApiBaseUrl(explicitBaseUrl?: string) {
  const defaultBaseUrl = "http://localhost:3000/api";
  return (explicitBaseUrl || process.env.DASHBOARD_API_BASE_URL || defaultBaseUrl).replace(/\/+$/, "");
}

async function main() {
  const { filePath, sheetName, apiBaseUrl, mode } = parseArgs(process.argv.slice(2));
  const token = process.env.DASHBOARD_API_TOKEN;

  if (!token) {
    throw new Error("DASHBOARD_API_TOKEN is required.");
  }

  const baseUrl = resolveApiBaseUrl(apiBaseUrl);
  const workbook = await readFile(filePath);
  const { keywords, sheetName: resolvedSheetName, column } = extractKeywordsFromWorkbook(workbook, {
    sheetName,
  });

  const response = await fetch(`${baseUrl}/keywords`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      keywords,
      mode,
    }),
  });
  const payload = await response.json();

  if (!response.ok) {
    const message = typeof payload?.error === "string" ? payload.error : "Keyword import request failed.";
    throw new Error(message);
  }
  const appliedMode = payload?.mode === "replace" ? "replace" : "append";
  const importedCount = typeof payload?.importedCount === "number" ? payload.importedCount : keywords.length;

  console.log(JSON.stringify({
    ok: true,
    sourceFile: filePath,
    sheetName: resolvedSheetName,
    column,
    mode: appliedMode,
    requestedMode: mode,
    importedCount,
    storedKeywordCount: Array.isArray(payload?.keywords) ? payload.keywords.length : undefined,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
