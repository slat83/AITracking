import { execSync } from "node:child_process";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";

type Finding = {
  filePath: string;
  lineNumber: number;
  rule: string;
  sample: string;
};

const REQUIRED_ENV_KEYS = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "AUTH_TRUST_HOST",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "CRON_SECRET",
  "DASHBOARD_API_TOKEN",
  "NEXT_PUBLIC_SITE_URL",
  "SEED_ADMIN_EMAIL",
  "SEED_ADMIN_PASSWORD",
] as const;

const SECRET_RULES: Array<{ name: string; regex: RegExp }> = [
  { name: "aws_access_key", regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "github_pat", regex: /\bghp_[A-Za-z0-9]{36}\b/ },
  { name: "github_fine_grained_pat", regex: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/ },
  { name: "slack_token", regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  { name: "google_api_key", regex: /\bAIza[0-9A-Za-z\-_]{35}\b/ },
  { name: "private_key_block", regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
];

const SCANNABLE_EXTENSIONS = new Set([
  ".env",
  ".example",
  ".json",
  ".md",
  ".mjs",
  ".sh",
  ".sql",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function parseEnvKeys(content: string) {
  const keys = new Set<string>();

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (match) {
      keys.add(match[1]);
    }
  }

  return keys;
}

async function checkEnvParity() {
  const localPath = ".env.example";
  const prodPath = ".env.production.example";
  const [localContent, prodContent] = await Promise.all([readFile(localPath, "utf8"), readFile(prodPath, "utf8")]);
  const localKeys = parseEnvKeys(localContent);
  const prodKeys = parseEnvKeys(prodContent);
  const failures: string[] = [];

  for (const key of REQUIRED_ENV_KEYS) {
    if (!localKeys.has(key)) {
      failures.push(`missing \`${key}\` in ${localPath}`);
    }
    if (!prodKeys.has(key)) {
      failures.push(`missing \`${key}\` in ${prodPath}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Environment parity check failed:\n- ${failures.join("\n- ")}`);
  }
}

function getTrackedFiles() {
  return execSync("git ls-files", { encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function isScannableTextFile(filePath: string) {
  const extension = path.extname(filePath);
  if (SCANNABLE_EXTENSIONS.has(extension)) {
    return true;
  }

  const fileName = path.basename(filePath);
  return fileName === "Dockerfile" || fileName.endsWith(".env.example");
}

function isAllowedSecretMatch(filePath: string, rule: string, matchValue: string) {
  if (rule === "private_key_block" && filePath.endsWith(".example")) {
    return true;
  }

  if (matchValue.toLowerCase().includes("replace-with")) {
    return true;
  }

  return false;
}

async function checkSecretSignals() {
  const files = getTrackedFiles();
  const findings: Finding[] = [];

  for (const filePath of files) {
    if (!isScannableTextFile(filePath)) {
      continue;
    }

    const fileStat = await stat(filePath);
    if (fileStat.size > 1_000_000) {
      continue;
    }

    const content = await readFile(filePath, "utf8");
    const lines = content.split(/\r?\n/);

    lines.forEach((line, index) => {
      for (const rule of SECRET_RULES) {
        const matched = line.match(rule.regex);
        if (!matched?.[0]) {
          continue;
        }

        if (isAllowedSecretMatch(filePath, rule.name, matched[0])) {
          continue;
        }

        findings.push({
          filePath,
          lineNumber: index + 1,
          rule: rule.name,
          sample: matched[0].slice(0, 120),
        });
      }
    });
  }

  if (findings.length > 0) {
    const details = findings
      .map((finding) => `${finding.filePath}:${finding.lineNumber} [${finding.rule}] ${finding.sample}`)
      .join("\n");
    throw new Error(`Potential secret patterns detected:\n${details}`);
  }
}

async function checkMarkdownLinks() {
  const markdownFiles = getTrackedFiles().filter((filePath) => filePath.endsWith(".md"));
  const missingLinks: string[] = [];
  const markdownLinkPattern = /\[[^\]]+\]\(([^)]+)\)/g;

  for (const markdownPath of markdownFiles) {
    const content = await readFile(markdownPath, "utf8");
    const baseDir = path.dirname(markdownPath);
    for (const match of content.matchAll(markdownLinkPattern)) {
      const rawTarget = match[1]?.trim();
      if (!rawTarget) {
        continue;
      }

      if (
        rawTarget.startsWith("http://") ||
        rawTarget.startsWith("https://") ||
        rawTarget.startsWith("mailto:") ||
        rawTarget.startsWith("#") ||
        rawTarget.startsWith("/")
      ) {
        continue;
      }

      const [target] = rawTarget.split("#");
      const normalizedTarget = target.replace(/^\.\//, "");
      const resolvedPath = path.resolve(baseDir, normalizedTarget);
      if (!(await fileExists(resolvedPath))) {
        missingLinks.push(`${markdownPath} -> ${rawTarget}`);
      }
    }
  }

  if (missingLinks.length > 0) {
    throw new Error(`Markdown link check failed:\n- ${missingLinks.join("\n- ")}`);
  }
}

async function checkGithubPolicyArtifacts() {
  const requiredFiles = [".github/pull_request_template.md", "ops/github/enforce-release-policy.sh"];
  const missing: string[] = [];
  for (const filePath of requiredFiles) {
    if (!(await fileExists(filePath))) {
      missing.push(filePath);
    }
  }

  if (missing.length > 0) {
    throw new Error(`GitHub release policy artifact check failed:\n- ${missing.join("\n- ")}`);
  }
}

async function main() {
  await checkEnvParity();
  await checkSecretSignals();
  await checkMarkdownLinks();
  await checkGithubPolicyArtifacts();
  console.log("Workspace hygiene checks passed.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
