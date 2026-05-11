import Link from "next/link";

const APP_SHELL_NAV_ITEMS = [
  { key: "workspace", label: "Workspace", href: "/app" },
  { key: "dashboard", label: "Dashboard", href: "/app/dashboard" },
  { key: "pilots", label: "Pilots", href: "/app/pilots" },
  { key: "evidence", label: "Proof", href: "/app/evidence" },
  { key: "playbooks", label: "Workflows", href: "/app/playbooks" },
  { key: "templates", label: "Deliverables", href: "/app/templates" },
  { key: "reporting", label: "Reporting", href: "/app/reporting" },
  { key: "settings", label: "Settings", href: "/app/settings" },
] as const;

export type AppShellNavKey = (typeof APP_SHELL_NAV_ITEMS)[number]["key"];

export function AppShellNav({ activeKey }: { activeKey: AppShellNavKey }) {
  return (
    <nav className="workspaceNav card" aria-label="Workspace navigation">
      {APP_SHELL_NAV_ITEMS.map((item) => (
        <Link
          className={`workspaceNavLink${item.key === activeKey ? " workspaceNavLinkActive" : ""}`}
          href={item.href}
          key={item.key}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
