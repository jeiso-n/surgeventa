import { Suspense } from "react";
import Link from "next/link";
import { CalendarClock, Layers, Link2, Settings, ShieldCheck } from "lucide-react";
import { TARGET_PLATFORMS } from "@/domain/platforms";
import { requireServerSession } from "@/server/auth/session";
import { getUserWorkspaceSummary } from "@/server/services/user-settings";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { AppShell } from "@/components/workspace/app-shell";
import { PlatformMatrix } from "@/components/workspace/platform-matrix";
import {
  ReadinessStrip,
  ReadinessStripFallback,
} from "@/components/workspace/readiness-strip";

async function AuthenticatedDashboard() {
  const { user } = await requireServerSession("/");
  const summary = await getUserWorkspaceSummary(user.id);

  return (
    <AppShell
      activeRoute="dashboard"
      pageTitle="Publishing Workspace"
      user={{
        displayName: user.displayName,
        email: user.email,
        timezone: user.timezone,
      }}
    >
      {/* Workspace Intro */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-mono uppercase tracking-wider text-brand">
            Protected Workspace
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome back, {user.displayName}
          </h2>
          <p className="text-sm text-muted max-w-2xl leading-relaxed">
            Surgeventa is backed by Neon PostgreSQL and Better Auth database sessions. Your
            workspace timezone is set to{" "}
            <span className="font-mono text-foreground">{user.timezone}</span> and your default
            publishing mode is{" "}
            <span className="font-medium text-foreground">
              {user.defaultPublishingPreferences.defaultPublishMode.replace("_", " ")}
            </span>
            .
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Badge variant="neutral">{summary.connectedAccountsCount} Connected Accounts</Badge>
          <Badge variant="neutral">{summary.scheduledPostsCount} Scheduled Posts</Badge>
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-3 h-8 text-xs font-medium text-foreground hover:bg-surface-subtle transition-colors"
          >
            <Settings className="h-3.5 w-3.5" aria-hidden="true" />
            Workspace Settings
          </Link>
        </div>
      </section>

      {/* Live Environment Readiness */}
      <Suspense fallback={<ReadinessStripFallback />}>
        <ReadinessStrip />
      </Suspense>

      {/* Honest Empty States for Active Workspace Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Connected Social Accounts</CardTitle>
            <CardDescription>
              OAuth tokens are encrypted server-side with AES-256-GCM and never exposed to the
              browser.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<Link2 className="h-4 w-4" aria-hidden="true" />}
              title="No social accounts connected yet"
              description="Official OAuth connection flows will be enabled in Milestone 4. All records are strictly scoped to your account."
              badge={<Badge variant="neutral">Milestone 4</Badge>}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publishing Queue & Schedule</CardTitle>
            <CardDescription>
              Scheduled times use your workspace timezone ({user.timezone}) with database-enforced
              idempotency keys.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<CalendarClock className="h-4 w-4" aria-hidden="true" />}
              title="No drafts or scheduled posts"
              description="The unified content composer, platform-specific validation, and media library arrive in Milestone 3, followed by the scheduling engine in Milestone 5."
              badge={<Badge variant="neutral">Milestones 3 & 5</Badge>}
            />
          </CardContent>
        </Card>
      </div>

      {/* Platform Integration Capability Matrix */}
      <PlatformMatrix platforms={TARGET_PLATFORMS} />

      {/* Architecture Guarantees */}
      <Card>
        <CardHeader>
          <CardTitle>Cross-Device & Security Architecture</CardTitle>
          <CardDescription>
            Core engineering invariants shared across the web workspace and planned Flutter Android
            app.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-subtle/50 p-4">
            <Layers className="h-4 w-4 text-brand shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Shared API Backend (Web + Android)</p>
              <p className="text-muted leading-relaxed">
                Versioned JSON endpoints under <span className="font-mono">/api/v1/*</span> and
                Better Auth session &amp; bearer authentication keep web and planned Flutter
                Android clients synchronized through one Neon PostgreSQL database.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-subtle/50 p-4">
            <ShieldCheck className="h-4 w-4 text-brand shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground">No Fake Integrations or Metrics</p>
              <p className="text-muted leading-relaxed">
                Platforms without free automated APIs (X, Reddit) default to honest Assisted
                Publishing workflows. Analytics will clearly separate unavailable metrics from
                zero values.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 space-y-3 animate-pulse">
            <div className="h-4 w-32 rounded bg-surface-subtle" />
            <div className="h-6 w-56 rounded bg-surface-subtle" />
            <div className="h-24 w-full rounded bg-surface-subtle" />
          </div>
        </div>
      }
    >
      <AuthenticatedDashboard />
    </Suspense>
  );
}
