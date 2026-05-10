import { describe, expect, it } from "vitest";

import { hasRequiredRole } from "@/server/auth/roles";

describe("hasRequiredRole", () => {
  it("allows the same role", () => {
    expect(hasRequiredRole("EDITOR", "EDITOR")).toBe(true);
  });

  it("allows a stronger role", () => {
    expect(hasRequiredRole("ADMIN", "VIEWER")).toBe(true);
  });

  it("blocks a weaker role", () => {
    expect(hasRequiredRole("VIEWER", "EDITOR")).toBe(false);
  });
});
