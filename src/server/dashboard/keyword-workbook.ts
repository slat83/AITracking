import { inflateRawSync } from "node:zlib";

const DEFAULT_SHEET_NAME = "All Keywords";
const DEFAULT_COLUMN = "A";
const XML_ENTITY_MAP: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": "\"",
  "&apos;": "'",
};

type ZipEntry = {
  name: string;
  compressionMethod: number;
  compressedSize: number;
  localHeaderOffset: number;
};

type ExtractKeywordWorkbookOptions = {
  sheetName?: string;
  column?: string;
};

function decodeXmlEntities(value: string) {
  return value.replace(/&(amp|lt|gt|quot|apos);/g, (entity) => XML_ENTITY_MAP[entity] ?? entity);
}

function stripXml(value: string) {
  return decodeXmlEntities(value.replace(/<[^>]+>/g, ""));
}

function normalizeKeyword(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function findEndOfCentralDirectory(buffer: Buffer) {
  for (let offset = buffer.length - 22; offset >= Math.max(0, buffer.length - 66_000); offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) {
      return {
        centralDirectorySize: buffer.readUInt32LE(offset + 12),
        centralDirectoryOffset: buffer.readUInt32LE(offset + 16),
      };
    }
  }

  throw new Error("Workbook archive is invalid: central directory is missing.");
}

function readZipEntries(buffer: Buffer) {
  const { centralDirectoryOffset, centralDirectorySize } = findEndOfCentralDirectory(buffer);
  const entries = new Map<string, ZipEntry>();
  let offset = centralDirectoryOffset;

  while (offset < centralDirectoryOffset + centralDirectorySize) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error("Workbook archive is invalid: central directory entry is malformed.");
    }

    const compressionMethod = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.slice(offset + 46, offset + 46 + nameLength).toString("utf8");

    entries.set(name, {
      name,
      compressionMethod,
      compressedSize,
      localHeaderOffset,
    });

    offset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

function readZipEntry(buffer: Buffer, entries: Map<string, ZipEntry>, entryName: string) {
  const entry = entries.get(entryName);

  if (!entry) {
    throw new Error(`Workbook archive is missing ${entryName}.`);
  }

  const { localHeaderOffset } = entry;

  if (buffer.readUInt32LE(localHeaderOffset) !== 0x04034b50) {
    throw new Error(`Workbook archive is invalid: local header for ${entryName} is malformed.`);
  }

  const nameLength = buffer.readUInt16LE(localHeaderOffset + 26);
  const extraLength = buffer.readUInt16LE(localHeaderOffset + 28);
  const start = localHeaderOffset + 30 + nameLength + extraLength;
  const end = start + entry.compressedSize;
  const compressed = buffer.subarray(start, end);

  if (entry.compressionMethod === 0) {
    return compressed.toString("utf8");
  }

  if (entry.compressionMethod === 8) {
    return inflateRawSync(compressed).toString("utf8");
  }

  throw new Error(`Workbook archive uses unsupported compression for ${entryName}.`);
}

function parseWorkbookSheets(workbookXml: string) {
  const sheets: Array<{ name: string; relationshipId: string }> = [];
  const matches = workbookXml.matchAll(/<sheet\b[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"/g);

  for (const match of matches) {
    sheets.push({
      name: decodeXmlEntities(match[1] ?? ""),
      relationshipId: match[2] ?? "",
    });
  }

  return sheets;
}

function parseWorkbookRelationships(relationshipsXml: string) {
  const relationships = new Map<string, string>();
  const matches = relationshipsXml.matchAll(/<Relationship\b[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g);

  for (const match of matches) {
    relationships.set(match[1] ?? "", `xl/${match[2] ?? ""}`.replace(/\/{2,}/g, "/"));
  }

  return relationships;
}

function parseSharedStrings(sharedStringsXml: string) {
  const sharedStrings: string[] = [];
  const matches = sharedStringsXml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g);

  for (const match of matches) {
    sharedStrings.push(stripXml(match[1] ?? ""));
  }

  return sharedStrings;
}

function extractCellValue(cellXml: string, sharedStrings: string[]) {
  const typeMatch = cellXml.match(/\bt="([^"]+)"/);
  const type = typeMatch?.[1] ?? "n";

  if (type === "inlineStr") {
    const inlineString = cellXml.match(/<is\b[^>]*>([\s\S]*?)<\/is>/);
    return normalizeKeyword(stripXml(inlineString?.[1] ?? ""));
  }

  const rawValue = cellXml.match(/<v>([\s\S]*?)<\/v>/)?.[1]?.trim() ?? "";

  if (!rawValue) {
    return "";
  }

  if (type === "s") {
    const sharedString = sharedStrings[Number.parseInt(rawValue, 10)] ?? "";
    return normalizeKeyword(sharedString);
  }

  return normalizeKeyword(decodeXmlEntities(rawValue));
}

function parseWorksheetKeywords(worksheetXml: string, sharedStrings: string[], column: string) {
  const keywords: string[] = [];
  const cellPattern = new RegExp(`<c\\b[^>]*r="${column}[0-9]+"[^>]*>[\\s\\S]*?<\\/c>`, "g");

  for (const match of worksheetXml.matchAll(cellPattern)) {
    const keyword = extractCellValue(match[0], sharedStrings);

    if (!keyword) {
      continue;
    }

    if (keywords.length === 0 && /^keywords?$/i.test(keyword)) {
      continue;
    }

    keywords.push(keyword);
  }

  return keywords;
}

export function extractKeywordsFromWorkbook(
  input: Buffer | Uint8Array | ArrayBuffer,
  options: ExtractKeywordWorkbookOptions = {},
) {
  const buffer = Buffer.isBuffer(input)
    ? input
    : input instanceof ArrayBuffer
      ? Buffer.from(new Uint8Array(input))
      : Buffer.from(new Uint8Array(input.buffer, input.byteOffset, input.byteLength));
  const entries = readZipEntries(buffer);
  const workbookXml = readZipEntry(buffer, entries, "xl/workbook.xml");
  const workbookRelationshipsXml = readZipEntry(buffer, entries, "xl/_rels/workbook.xml.rels");
  const sharedStringsXml = readZipEntry(buffer, entries, "xl/sharedStrings.xml");
  const sheets = parseWorkbookSheets(workbookXml);
  const relationships = parseWorkbookRelationships(workbookRelationshipsXml);
  const sharedStrings = parseSharedStrings(sharedStringsXml);
  const preferredSheetName = options.sheetName?.trim() || DEFAULT_SHEET_NAME;
  const column = (options.column?.trim() || DEFAULT_COLUMN).toUpperCase();
  const sheet = sheets.find((entry) => entry.name === preferredSheetName) ?? sheets[0];

  if (!sheet) {
    throw new Error("Workbook does not contain any worksheets.");
  }

  const worksheetPath = relationships.get(sheet.relationshipId);

  if (!worksheetPath) {
    throw new Error(`Workbook relationship for sheet ${sheet.name} is missing.`);
  }

  const worksheetXml = readZipEntry(buffer, entries, worksheetPath);
  const rawKeywords = parseWorksheetKeywords(worksheetXml, sharedStrings, column);
  const uniqueKeywords: string[] = [];
  const seen = new Set<string>();

  for (const keyword of rawKeywords) {
    const normalized = normalizeKeyword(keyword);

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    uniqueKeywords.push(normalized);
  }

  return {
    sheetName: sheet.name,
    column,
    keywords: uniqueKeywords,
  };
}
