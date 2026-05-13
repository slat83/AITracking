import { AppShellNav } from "@/components/app-shell-nav";
import { DashboardWorkbench } from "@/components/dashboard-workbench";
import { requireUser } from "@/server/auth";
import { getDashboardSnapshot } from "@/server/dashboard/tracking";

export const runtime = "nodejs";

export default async function DashboardPage() {
  const session = await requireUser("EDITOR");
  const dashboard = await getDashboardSnapshot();

  return (
    <main className="shell dashboard workflowPage">
      <header className="topbar workspaceHeader">
        <div className="topbarInner workspaceHeaderInner">
          <div>
            <div className="eyebrow">Operator workflow</div>
            <h1 style={{ fontSize: "2.5rem", margin: "12px 0 0" }}>Community monitoring dashboard</h1>
            <p className="muted workspaceIntro">
              This shell is intentionally scoped to tracked Reddit keywords, threads, and posts.
            </p>
          </div>
          <div className="workspaceHeaderActions">
            <div className="pill">{session.user.role}</div>
          </div>
        </div>
        <AppShellNav activeKey="dashboard" />
      </header>
      <DashboardWorkbench initialDashboard={dashboard} />
    </main>
  );
}
