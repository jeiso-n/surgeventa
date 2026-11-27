import { Suspense } from "react";
import { requireServerSession } from "@/server/auth/session";
import {
  getUserProfileById,
  listUserSessions,
} from "@/server/services/user-settings";
import { AppShell } from "@/components/workspace/app-shell";
import { SettingsWorkspace } from "@/components/settings/settings-workspace";

async function AuthenticatedSettings() {
  const { user, session } = await requireServerSession("/settings");
  const [profile, activeSessions] = await Promise.all([
    getUserProfileById(user.id),
    listUserSessions(user.id, session.id),
  ]);

  if (!profile) {
    throw new Error("Authenticated user profile could not be loaded.");
  }

  return (
    <AppShell
      activeRoute="settings"
      pageTitle="Account & Workspace Settings"
      user={{
        displayName: profile.displayName,
        email: profile.email,
        timezone: profile.timezone,
      }}
    >
      <section className="space-y-1">
        <p className="text-xs font-mono uppercase tracking-wider text-brand">Settings</p>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Profile, timezone &amp; account security
        </h2>
        <p className="text-sm text-muted max-w-2xl leading-relaxed">
          Manage your Surgeventa identity, scheduling timezone, publishing defaults, and active
          sessions. Changes sync immediately across all clients.
        </p>
      </section>

      <SettingsWorkspace initialProfile={profile} initialSessions={activeSessions} />
    </AppShell>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
          <div className="w-full max-w-2xl rounded-xl border border-border bg-surface p-6 space-y-4 animate-pulse">
            <div className="h-5 w-40 rounded bg-surface-subtle" />
            <div className="h-32 w-full rounded bg-surface-subtle" />
            <div className="h-32 w-full rounded bg-surface-subtle" />
          </div>
        </div>
      }
    >
      <AuthenticatedSettings />
    </Suspense>
  );
}
