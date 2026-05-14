import Link from "next/link";
import type { ComponentProps } from "react";

const APP_SHELL_PRIMARY_NAV_ITEMS = [
  { key: "workspace", label: "Scenario workspace", href: "/app" },
  { key: "dashboard", label: "Reddit workflow", href: "/app/dashboard" },
  { key: "aiRecommendationShare", label: "AI recommendation share", href: "/app/ai-recommendation-share" },
] as const;

export type AppShellNavKey = (typeof APP_SHELL_PRIMARY_NAV_ITEMS)[number]["key"]
| "workspace"
| "evidence"
| "playbooks"
| "templates"
| "reporting"
| "settings";

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
  return (
    <>
      <nav className="workspaceNav card" aria-label="Primary workspace navigation">
        {APP_SHELL_PRIMARY_NAV_ITEMS.map((item) => (
          <Link
            className={`workspaceNavLink${item.key === activeKey ? " workspaceNavLinkActive" : ""}`}
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
