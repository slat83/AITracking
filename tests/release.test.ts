import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getReleaseMetadata", () => {
  it("falls back to package metadata when release env vars are missing", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("APP_VERSION", "");
    vi.stubEnv("APP_RELEASE_ID", "");
    vi.stubEnv("APP_GIT_SHA", "");
    vi.stubEnv("APP_BUILD_TIME", "");

    const { getReleaseMetadata } = await import("@/server/release");
    const metadata = getReleaseMetadata();

    expect(metadata).toMatchObject({
      service: "flowvory-app",
      environment: "test",
      version: "0.1.0",
      releaseId: "0.1.0",
      gitSha: null,
      builtAt: null,
    });
  });

  it("prefers explicit release env vars when present", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_VERSION", "1.4.2");
    vi.stubEnv("APP_RELEASE_ID", "release-2026-05-11-1");
    vi.stubEnv("APP_GIT_SHA", "abc123def456");
    vi.stubEnv("APP_BUILD_TIME", "2026-05-11T10:15:00Z");

    const { getReleaseMetadata } = await import("@/server/release");
    const metadata = getReleaseMetadata();

    expect(metadata).toEqual({
      service: "flowvory-app",
      environment: "production",
      version: "1.4.2",
      releaseId: "release-2026-05-11-1",
      gitSha: "abc123def456",
      builtAt: "2026-05-11T10:15:00Z",
    });
  });
});
