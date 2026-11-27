import { Suspense } from "react";
import { CalendarClock, Link2, Layers, ShieldCheck } from "lucide-react";
import { TARGET_PLATFORMS } from "@/domain/platforms";
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

export default function DashboardPage() {
  return (
    <AppShell>
      {/* Workspace Intro */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-mono uppercase tracking-wider text-brand">
            Foundation Workspace
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Multi-platform publishing, built transparently
          </h2>
          <p className="text-sm text-muted max-w-2xl leading-relaxed">
            Surgeventa is initialized on a portable Next.js + PostgreSQL architecture. Connect Neon
            PostgreSQL credentials next to enable authentication, account storage, and draft
            persistence in Milestone 2.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="neutral">0 Connected Accounts</Badge>
          <Badge variant="neutral">0 Scheduled Posts</Badge>
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
              description="Official OAuth connection flows will be enabled starting in Milestone 4 once Neon PostgreSQL and user authentication are active."
              badge={<Badge variant="neutral">Milestone 4</Badge>}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publishing Queue & Schedule</CardTitle>
            <CardDescription>
              Every destination tracks status independently with database-enforced idempotency keys
              to prevent duplicate posts.
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

      {/* Architecture & Next Milestone Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Milestone 1 Architecture Guarantees</CardTitle>
          <CardDescription>
            Core engineering invariants established before adding database connections or external
            APIs.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-subtle/50 p-4">
            <Layers className="h-4 w-4 text-brand shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Portable Database & Hosting</p>
              <p className="text-muted leading-relaxed">
                Drizzle ORM connects over standard PostgreSQL pooling, working identically on
                Neon&apos;s free tier or any local/self-hosted Postgres instance without vendor
                lock-in.
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
