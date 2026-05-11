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
            <div className="eyebrow">Community dashboard</div>
            <h1 style={{ fontSize: "2.5rem", margin: "12px 0 0" }}>Tracked keywords, threads, and posts</h1>
            <p className="muted workspaceIntro">
              Manage the operator shortlist for discovery phrases, Reddit threads worth monitoring, and posts that
              still need a response without losing answered history.
            </p>
          </div>
          <div className="workspaceHeaderActions">
            <div className="pill">{session.user.role}</div>
          </div>
        </div>
        <AppShellNav activeKey="dashboard" />
      </header>

      <DashboardWorkbench />
    </main>
  );
}
