import Link from "next/link";
import type { ComponentProps } from "react";

export type AppShellNavKey =
| "workspace"
| "dashboard"
| "aiRecommendationShare"
| "evidence"
| "playbooks"
| "templates"
| "reporting"
| "settings";

type AppShellPrimaryNavItem = {
  key: "workspace" | "dashboard" | "aiRecommendationShare";
  label: string;
  href: ComponentProps<typeof Link>["href"];
  matchKeys: readonly AppShellNavKey[];
};

const APP_SHELL_PRIMARY_NAV_ITEMS: readonly AppShellPrimaryNavItem[] = [
  {
    key: "workspace",
    label: "Scenario workspace",
    href: "/app",
    matchKeys: ["workspace", "playbooks", "templates", "reporting", "evidence", "settings"],
  },
  { key: "dashboard", label: "Reddit workflow", href: "/app/dashboard", matchKeys: ["dashboard"] },
  {
    key: "aiRecommendationShare",
    label: "AI recommendation share",
    href: "/app/ai-recommendation-share",
    matchKeys: ["aiRecommendationShare"],
  },
] as const;

type AppShellSecondaryItem = {
  key: string;
  label: string;
  href: ComponentProps<typeof Link>["href"];
};

export function AppShellNav({
  activeKey,
  secondaryItems = [],
  activeSecondaryKey,
  panelMode = "separate",
}: {
  activeKey?: AppShellNavKey;
  secondaryItems?: AppShellSecondaryItem[];
  activeSecondaryKey?: string;
  panelMode?: "separate" | "embedded";
}) {
  const resolvedKey = activeKey ?? null;
  const embedded = panelMode === "embedded";

  return (
    <>
      <nav
        className={`workspaceNav${embedded ? "" : " card"}`}
        aria-label="Primary workspace navigation"
        style={embedded
          ? {
            padding: 0,
            background: "transparent",
            border: 0,
            gap: 10,
          }
          : undefined}
      >
        {APP_SHELL_PRIMARY_NAV_ITEMS.map((item) => (
          <Link
            className={`workspaceNavLink${resolvedKey && item.matchKeys.includes(resolvedKey) ? " workspaceNavLinkActive" : ""}`}
            href={item.href}
            key={item.key}
          >
            {item.label}
          </Link>
        ))}
        {embedded && secondaryItems.length > 0 ? (
          <span className="muted" style={{ fontSize: "0.84rem", alignSelf: "center", padding: "0 2px" }}>
            •
          </span>
        ) : null}
        {embedded
          ? secondaryItems.map((item) => (
            <Link
              className={`workspaceSecondaryNavLink${item.key === activeSecondaryKey ? " workspaceSecondaryNavLinkActive" : ""}`}
              href={item.href}
              key={item.key}
            >
              {item.label}
            </Link>
          ))
          : null}
      </nav>
      {!embedded && secondaryItems.length > 0 ? (
        <nav className="workspaceSecondaryNav" aria-label="Secondary workspace navigation">
          {secondaryItems.map((item) => (
            <Link
              className={`workspaceSecondaryNavLink${item.key === activeSecondaryKey ? " workspaceSecondaryNavLinkActive" : ""}`}
              href={item.href}
              key={item.key}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </>
  );
}
