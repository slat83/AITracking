import { describe, expect, it } from "vitest";

import { normalizeEmail } from "@/server/auth/credentials";

describe("normalizeEmail", () => {
  it("trims whitespace and lowercases the seeded or submitted email", () => {
    expect(normalizeEmail(" Admin@Example.COM ")).toBe("admin@example.com");
  });
});
