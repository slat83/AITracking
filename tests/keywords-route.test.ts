import { beforeEach, describe, expect, it, vi } from "vitest";

const requireDashboardEditor = vi.fn();
const addTrackedKeyword = vi.fn();
const listTrackedKeywords = vi.fn();
const replaceTrackedKeywords = vi.fn();
const extractKeywordsFromWorkbook = vi.fn();

vi.mock("@/server/dashboard/api-auth", () => ({
  requireDashboardEditor,
}));

vi.mock("@/server/dashboard/tracking", async () => {
  const actual = await vi.importActual<typeof import("@/server/dashboard/tracking")>("@/server/dashboard/tracking");

  return {
    ...actual,
    addTrackedKeyword,
    listTrackedKeywords,
    replaceTrackedKeywords,
    removeTrackedKeyword: vi.fn(),
  };
});

vi.mock("@/server/dashboard/keyword-workbook", () => ({
  extractKeywordsFromWorkbook,
}));

describe("POST /api/keywords", () => {
  beforeEach(() => {
    requireDashboardEditor.mockReset();
    addTrackedKeyword.mockReset();
    listTrackedKeywords.mockReset();
    replaceTrackedKeywords.mockReset();
    extractKeywordsFromWorkbook.mockReset();

    requireDashboardEditor.mockResolvedValue({
      ok: true,
      session: {
        user: {
          id: "user-1",
          role: "EDITOR",
        },
      },
    });
    listTrackedKeywords.mockResolvedValue([{ id: "kw-1", keyword: "best carfax alternative" }]);
    replaceTrackedKeywords.mockResolvedValue([{ id: "kw-1", keyword: "best carfax alternative" }]);
  });

  it("accepts the legacy JSON keyword payload", async () => {
    const { POST } = await import("@/app/api/keywords/route");
    const response = await POST(new Request("http://localhost/api/keywords", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        keywords: ["best carfax alternative", "carfax vs epicvin"],
      }),
    }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(addTrackedKeyword).toHaveBeenCalledTimes(2);
    expect(addTrackedKeyword).toHaveBeenNthCalledWith(1, { keyword: "best carfax alternative" });
    expect(addTrackedKeyword).toHaveBeenNthCalledWith(2, { keyword: "carfax vs epicvin" });
    expect(body.importedCount).toBe(2);
    expect(body.mode).toBe("append");
    expect(replaceTrackedKeywords).not.toHaveBeenCalled();
  });

  it("accepts a workbook upload via multipart form data", async () => {
    extractKeywordsFromWorkbook.mockReturnValue({
      sheetName: "All Keywords",
      column: "A",
      keywords: ["best carfax alternative", "carfax vs epicvin"],
    });

    const { POST } = await import("@/app/api/keywords/route");
    const formData = new FormData();
    formData.set("sheetName", "All Keywords");
    formData.set("workbook", new File(["fake-xlsx"], "keywords.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }));

    const response = await POST(new Request("http://localhost/api/keywords", {
      method: "POST",
      body: formData,
    }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(extractKeywordsFromWorkbook).toHaveBeenCalledTimes(1);
    expect(addTrackedKeyword).toHaveBeenCalledTimes(2);
    expect(body.importedCount).toBe(2);
    expect(body.mode).toBe("append");
  });

  it("accepts mode=replace in multipart form data", async () => {
    extractKeywordsFromWorkbook.mockReturnValue({
      sheetName: "All Keywords",
      column: "A",
      keywords: ["best carfax alternative", "carfax vs epicvin"],
    });

    const { POST } = await import("@/app/api/keywords/route");
    const formData = new FormData();
    formData.set("sheetName", "All Keywords");
    formData.set("mode", "replace");
    formData.set("workbook", new File(["fake-xlsx"], "keywords.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }));

    const response = await POST(new Request("http://localhost/api/keywords", {
      method: "POST",
      body: formData,
    }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(replaceTrackedKeywords).toHaveBeenCalledWith(["best carfax alternative", "carfax vs epicvin"]);
    expect(addTrackedKeyword).not.toHaveBeenCalled();
    expect(body.mode).toBe("replace");
  });

  it("rejects invalid multipart mode values", async () => {
    const { POST } = await import("@/app/api/keywords/route");
    const formData = new FormData();
    formData.set("mode", "overwrite");
    formData.set("workbook", new File(["fake-xlsx"], "keywords.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }));

    const response = await POST(new Request("http://localhost/api/keywords", {
      method: "POST",
      body: formData,
    }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(addTrackedKeyword).not.toHaveBeenCalled();
    expect(replaceTrackedKeywords).not.toHaveBeenCalled();
  });

  it("replaces tracked keywords when mode=replace is provided", async () => {
    const { POST } = await import("@/app/api/keywords/route");
    const response = await POST(new Request("http://localhost/api/keywords", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        keywords: ["best carfax alternative", "carfax vs epicvin"],
        mode: "replace",
      }),
    }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(replaceTrackedKeywords).toHaveBeenCalledTimes(1);
    expect(replaceTrackedKeywords).toHaveBeenCalledWith(["best carfax alternative", "carfax vs epicvin"]);
    expect(addTrackedKeyword).not.toHaveBeenCalled();
    expect(body.importedCount).toBe(2);
    expect(body.mode).toBe("replace");
  });
});
