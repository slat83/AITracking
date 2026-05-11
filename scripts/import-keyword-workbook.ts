import { readFile } from "node:fs/promises";

import { addTrackedKeyword, listTrackedKeywords } from "@/server/dashboard/tracking";
import { extractKeywordsFromWorkbook } from "@/server/dashboard/keyword-workbook";

function parseArgs(argv: string[]) {
  const args = [...argv];
  const options: {
    filePath?: string;
    sheetName?: string;
  } = {};

  while (args.length > 0) {
    const token = args.shift();

    if (!token) {
      continue;
    }

    if (token === "--sheet") {
      options.sheetName = args.shift();
      continue;
    }

    if (!options.filePath) {
      options.filePath = token;
    }
  }

  if (!options.filePath) {
    throw new Error("Usage: tsx scripts/import-keyword-workbook.ts <workbook.xlsx> [--sheet \"All Keywords\"]");
  }

  return options as { filePath: string; sheetName?: string };
}

async function main() {
  const { filePath, sheetName } = parseArgs(process.argv.slice(2));
  const workbook = await readFile(filePath);
  const { keywords, sheetName: resolvedSheetName, column } = extractKeywordsFromWorkbook(workbook, {
    sheetName,
  });

  for (const keyword of keywords) {
    await addTrackedKeyword({ keyword });
  }

  const storedKeywords = await listTrackedKeywords();

  console.log(JSON.stringify({
    ok: true,
    sourceFile: filePath,
    sheetName: resolvedSheetName,
    column,
    importedCount: keywords.length,
    storedKeywordCount: storedKeywords.length,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
