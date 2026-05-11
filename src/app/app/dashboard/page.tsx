import { AppShellNav } from "@/components/app-shell-nav";
import { DashboardWorkbench } from "@/components/dashboard-workbench";
import { requireUser } from "@/server/auth";

export const runtime = "nodejs";

export default async function DashboardPage() {
  const session = await requireUser("EDITOR");

  return (
    <main className="shell dashboard workflowPage">
      <header className="topbar workspaceHeader">
        <div className="topbarInner workspaceHeaderInner">
          <div>
            <div className="eyebrow">Secondary operator view</div>
            <h1 style={{ fontSize: "2.5rem", margin: "12px 0 0" }}>Community monitoring dashboard</h1>
            <p className="muted workspaceIntro">
              This view supports channel monitoring, but it no longer anchors the product shell.
              The scenario workspace remains the primary operating surface.
            </p>
          </div>
          <div className="workspaceHeaderActions">
            <div className="pill">{session.user.role}</div>
          </div>
        </div>
        <AppShellNav
          activeKey="workspace"
          activeSecondaryKey="dashboard"
          secondaryItems={[
            { key: "dashboard", label: "Community dashboard", href: "/app/dashboard" },
            { key: "pilots", label: "Pilot operations", href: "/app/pilots" },
          ]}
        />
      </header>

      <DashboardWorkbench />
    </main>
  );
}
