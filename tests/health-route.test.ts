import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const queryRaw = vi.fn();

vi.mock("@/server/db/client", () => ({
  prisma: {
    $queryRaw: queryRaw,
  },
}));

beforeEach(() => {
  queryRaw.mockReset();
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /api/health", () => {
  it("returns shallow health with release metadata", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_VERSION", "1.2.3");
    vi.stubEnv("APP_RELEASE_ID", "release-123");
    vi.stubEnv("APP_GIT_SHA", "abcdef123456");
    vi.stubEnv("APP_BUILD_TIME", "2026-05-11T10:15:00Z");

    const { GET } = await import("@/app/api/health/route");
    const response = await GET(new Request("http://localhost/api/health"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      ok: true,
      service: "flowvory-app",
      release: {
        version: "1.2.3",
        releaseId: "release-123",
        gitSha: "abcdef123456",
        builtAt: "2026-05-11T10:15:00Z",
        environment: "production",
      },
      checks: {
        application: "ok",
      },
    });
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it("returns deep health when the database check succeeds", async () => {
    queryRaw.mockResolvedValueOnce([{ "?column?": 1 }]);
    vi.stubEnv("APP_VERSION", "1.2.3");

    const { GET } = await import("@/app/api/health/route");
    const response = await GET(new Request("http://localhost/api/health?deep=1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.release.version).toBe("1.2.3");
    expect(body.checks).toEqual({
      application: "ok",
      database: "ok",
    });
    expect(queryRaw).toHaveBeenCalledTimes(1);
  });

  it("returns 503 when the database check fails", async () => {
    queryRaw.mockRejectedValueOnce(new Error("db offline"));

    const { GET } = await import("@/app/api/health/route");
    const response = await GET(new Request("http://localhost/api/health?deep=1"));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toMatchObject({
      ok: false,
      checks: {
        application: "ok",
        database: "error",
      },
    });
  });
});
