import packageJson from "../../package.json";

function normalizeValue(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export type ReleaseMetadata = {
  service: string;
  environment: string;
  version: string;
  releaseId: string;
  gitSha: string | null;
  builtAt: string | null;
};

export function getReleaseMetadata(): ReleaseMetadata {
  const version = normalizeValue(process.env.APP_VERSION) ?? packageJson.version;
  const gitSha = normalizeValue(process.env.APP_GIT_SHA);

  return {
    service: packageJson.name,
    environment: process.env.NODE_ENV ?? "development",
    version,
    releaseId: normalizeValue(process.env.APP_RELEASE_ID) ?? gitSha ?? version,
    gitSha,
    builtAt: normalizeValue(process.env.APP_BUILD_TIME),
  };
}
