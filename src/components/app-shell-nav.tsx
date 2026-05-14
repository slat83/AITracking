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
}: {
  activeKey?: AppShellNavKey;
  secondaryItems?: AppShellSecondaryItem[];
  activeSecondaryKey?: string;
}) {
  const resolvedKey = activeKey ?? null;

  return (
    <>
      <nav className="workspaceNav card" aria-label="Primary workspace navigation">
        {APP_SHELL_PRIMARY_NAV_ITEMS.map((item) => (
          <Link
            className={`workspaceNavLink${resolvedKey && item.matchKeys.includes(resolvedKey) ? " workspaceNavLinkActive" : ""}`}
            href={item.href}
            key={item.key}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {secondaryItems.length > 0 ? (
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
