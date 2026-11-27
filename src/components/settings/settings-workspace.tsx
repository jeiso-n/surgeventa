"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Clock3,
  KeyRound,
  Loader2,
  Mail,
  Monitor,
  Shield,
  Sliders,
  Trash2,
  User,
} from "lucide-react";
import { TARGET_PLATFORMS, type PlatformId } from "@/domain/platforms";
import {
  formatDateInTimezone,
  getSupportedTimezones,
  type DefaultPublishMode,
  type DefaultVisibility,
  type PublishingPreferences,
} from "@/domain/settings";
import type { ActiveSessionView, UserProfileView } from "@/server/services/user-settings";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface SettingsWorkspaceProps {
  initialProfile: UserProfileView;
  initialSessions: ActiveSessionView[];
}

export function SettingsWorkspace({
  initialProfile,
  initialSessions,
}: SettingsWorkspaceProps) {
  const router = useRouter();
  const timezones = useMemo(() => getSupportedTimezones(), []);

  // Profile & Preferences state
  const [displayName, setDisplayName] = useState(initialProfile.displayName);
  const [timezone, setTimezone] = useState(initialProfile.timezone);
  const [prefs, setPrefs] = useState<PublishingPreferences>(
    initialProfile.defaultPublishingPreferences,
  );
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileNotice, setProfileNotice] = useState<{
    type: "success" | "danger";
    message: string;
  } | null>(null);

  // Email change state
  const [currentEmail, setCurrentEmail] = useState(initialProfile.email);
  const [emailVerified, setEmailVerified] = useState(initialProfile.emailVerified);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailNotice, setEmailNotice] = useState<{
    type: "success" | "danger";
    message: string;
  } | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [revokeOthersOnPasswordChange, setRevokeOthersOnPasswordChange] = useState(true);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<{
    type: "success" | "danger";
    message: string;
  } | null>(null);

  // Active sessions state
  const [sessions, setSessions] = useState<ActiveSessionView[]>(initialSessions);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAllOthers, setRevokingAllOthers] = useState(false);
  const [sessionNotice, setSessionNotice] = useState<{
    type: "success" | "danger";
    message: string;
  } | null>(null);

  function toggleDefaultPlatform(platformId: PlatformId) {
    setPrefs((prev) => {
      const exists = prev.defaultPlatforms.includes(platformId);
      return {
        ...prev,
        defaultPlatforms: exists
          ? prev.defaultPlatforms.filter((id) => id !== platformId)
          : [...prev.defaultPlatforms, platformId],
      };
    });
  }

  async function refreshSessions() {
    const res = await fetch("/api/v1/settings/sessions", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { sessions: ActiveSessionView[] };
      setSessions(data.sessions);
    }
  }

  async function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileNotice(null);
    setSavingProfile(true);

    try {
      const res = await fetch("/api/v1/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          timezone,
          defaultPublishingPreferences: prefs,
        }),
      });
      const data = (await res.json()) as { profile?: UserProfileView; error?: string };

      if (!res.ok || !data.profile) {
        setProfileNotice({
          type: "danger",
          message: data.error ?? "Unable to save settings.",
        });
        return;
      }

      setDisplayName(data.profile.displayName);
      setTimezone(data.profile.timezone);
      setPrefs(data.profile.defaultPublishingPreferences);
      setProfileNotice({
        type: "success",
        message: `Settings saved. Scheduled posts will use ${data.profile.timezone}.`,
      });
      router.refresh();
    } catch {
      setProfileNotice({
        type: "danger",
        message: "Network error while saving settings. Please try again.",
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangeEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailNotice(null);
    setSavingEmail(true);

    try {
      const res = await fetch("/api/v1/settings/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newEmail,
          currentPassword: emailPassword,
        }),
      });
      const data = (await res.json()) as { email?: string; error?: string; message?: string };

      if (!res.ok || !data.email) {
        setEmailNotice({
          type: "danger",
          message: data.error ?? "Unable to update email address.",
        });
        return;
      }

      setCurrentEmail(data.email);
      setEmailVerified(false);
      setNewEmail("");
      setEmailPassword("");
      setEmailNotice({
        type: "success",
        message: data.message ?? "Email address updated successfully.",
      });
      router.refresh();
    } catch {
      setEmailNotice({
        type: "danger",
        message: "Network error while updating email address.",
      });
    } finally {
      setSavingEmail(false);
    }
  }

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordNotice(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordNotice({ type: "danger", message: "New passwords do not match." });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/v1/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          revokeOtherSessions: revokeOthersOnPasswordChange,
        }),
      });
      const data = (await res.json()) as { message?: string; error?: string };

      if (!res.ok) {
        setPasswordNotice({
          type: "danger",
          message: data.error ?? "Unable to update password.",
        });
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordNotice({
        type: "success",
        message: data.message ?? "Password updated successfully.",
      });
      await refreshSessions();
    } catch {
      setPasswordNotice({
        type: "danger",
        message: "Network error while updating password.",
      });
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleRevokeSession(sessionId: string, isCurrent: boolean) {
    setSessionNotice(null);
    setRevokingId(sessionId);
    try {
      const res = await fetch("/api/v1/settings/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setSessionNotice({
          type: "danger",
          message: data.error ?? "Unable to revoke session.",
        });
        return;
      }

      if (isCurrent) {
        router.push("/login?reason=session_expired");
        router.refresh();
        return;
      }

      setSessions((prev) => prev.filter((item) => item.id !== sessionId));
      setSessionNotice({ type: "success", message: "Session revoked." });
    } finally {
      setRevokingId(null);
    }
  }

  async function handleRevokeOtherSessions() {
    setSessionNotice(null);
    setRevokingAllOthers(true);
    try {
      const res = await fetch("/api/v1/settings/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revokeOthers: true }),
      });
      const data = (await res.json()) as { revokedCount?: number; error?: string };

      if (!res.ok) {
        setSessionNotice({
          type: "danger",
          message: data.error ?? "Unable to revoke other sessions.",
        });
        return;
      }

      await refreshSessions();
      setSessionNotice({
        type: "success",
        message: `Revoked ${data.revokedCount ?? 0} other active session(s).`,
      });
    } finally {
      setRevokingAllOthers(false);
    }
  }

  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length;

  return (
    <div className="space-y-6">
      {/* Profile, Timezone & Publishing Defaults */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-brand" aria-hidden="true" />
              <CardTitle>Profile &amp; Timezone</CardTitle>
            </div>
            <CardDescription>
              Your display name and timezone apply across the web workspace and scheduled post
              execution. Defaults to UTC if unset.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileNotice ? (
              <Alert variant={profileNotice.type}>{profileNotice.message}</Alert>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="settings-display-name">Display name</Label>
                <Input
                  id="settings-display-name"
                  name="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={savingProfile}
                  required
                />
              </div>

              <div>
                <Label htmlFor="settings-timezone">Workspace timezone</Label>
                <select
                  id="settings-timezone"
                  name="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  disabled={savingProfile}
                  className="h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-foreground focus:border-brand focus:outline-none"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-[11px] text-muted flex items-center gap-1.5">
                  <Clock3 className="h-3 w-3" aria-hidden="true" />
                  Current local preview:{" "}
                  <span className="font-mono text-foreground">
                    {formatDateInTimezone(new Date(), timezone)}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-brand" aria-hidden="true" />
              <CardTitle>Default Publishing Preferences</CardTitle>
            </div>
            <CardDescription>
              Pre-configure how new posts behave in the unified composer and scheduling queue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="settings-publish-mode">Default publishing action</Label>
                <select
                  id="settings-publish-mode"
                  name="defaultPublishMode"
                  value={prefs.defaultPublishMode}
                  onChange={(e) =>
                    setPrefs((prev) => ({
                      ...prev,
                      defaultPublishMode: e.target.value as DefaultPublishMode,
                    }))
                  }
                  disabled={savingProfile}
                  className="h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-foreground focus:border-brand focus:outline-none"
                >
                  <option value="draft">Save as draft</option>
                  <option value="schedule">Schedule for later</option>
                  <option value="publish_now">Publish immediately when supported</option>
                </select>
              </div>

              <div>
                <Label htmlFor="settings-visibility">Default post visibility</Label>
                <select
                  id="settings-visibility"
                  name="defaultVisibility"
                  value={prefs.defaultVisibility}
                  onChange={(e) =>
                    setPrefs((prev) => ({
                      ...prev,
                      defaultVisibility: e.target.value as DefaultVisibility,
                    }))
                  }
                  disabled={savingProfile}
                  className="h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-foreground focus:border-brand focus:outline-none"
                >
                  <option value="public">Public (where approved by platform)</option>
                  <option value="private">Private / Draft-only on platform</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-start gap-2.5 rounded-lg border border-border bg-surface-subtle/50 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.autoSaveDrafts}
                  onChange={(e) =>
                    setPrefs((prev) => ({ ...prev, autoSaveDrafts: e.target.checked }))
                  }
                  disabled={savingProfile}
                  className="mt-0.5 h-4 w-4 rounded border-border-strong accent-brand"
                />
                <span className="text-xs space-y-0.5">
                  <span className="font-medium text-foreground block">Auto-save drafts</span>
                  <span className="text-muted block">
                    Keep work-in-progress captions synced to PostgreSQL.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-2.5 rounded-lg border border-border bg-surface-subtle/50 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.notifyOnFailure}
                  onChange={(e) =>
                    setPrefs((prev) => ({ ...prev, notifyOnFailure: e.target.checked }))
                  }
                  disabled={savingProfile}
                  className="mt-0.5 h-4 w-4 rounded border-border-strong accent-brand"
                />
                <span className="text-xs space-y-0.5">
                  <span className="font-medium text-foreground block">
                    Alert on publishing failures
                  </span>
                  <span className="text-muted block">
                    Highlight failed destination deliveries on the dashboard.
                  </span>
                </span>
              </label>
            </div>

            <div className="space-y-2">
              <Label>Preferred default destinations</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TARGET_PLATFORMS.map((platform) => {
                  const selected = prefs.defaultPlatforms.includes(platform.id);
                  return (
                    <label
                      key={platform.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs cursor-pointer hover:bg-surface-subtle/50"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleDefaultPlatform(platform.id)}
                          disabled={savingProfile}
                          className="h-3.5 w-3.5 accent-brand"
                        />
                        <span className="font-medium text-foreground truncate">
                          {platform.name}
                        </span>
                      </span>
                      <span className="text-[10px] font-mono text-muted">
                        {platform.publishingMode === "direct_api" ? "API" : "Assisted"}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Saving preferences...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Save profile &amp; preferences
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Email Address & Change Handling */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand" aria-hidden="true" />
              <CardTitle>Email Address</CardTitle>
            </div>
            <Badge variant={emailVerified ? "success" : "neutral"}>
              {emailVerified ? "Verified" : "Unverified (No email provider configured)"}
            </Badge>
          </div>
          <CardDescription>
            Current login email: <span className="font-mono text-foreground">{currentEmail}</span>.
            Changing your email requires confirming your current password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangeEmail} className="space-y-4">
            {emailNotice ? <Alert variant={emailNotice.type}>{emailNotice.message}</Alert> : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="settings-new-email">New email address</Label>
                <Input
                  id="settings-new-email"
                  name="newEmail"
                  type="email"
                  placeholder="new-email@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  disabled={savingEmail}
                  required
                />
              </div>

              <div>
                <Label htmlFor="settings-email-password">Current password</Label>
                <Input
                  id="settings-email-password"
                  name="emailCurrentPassword"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Confirm current password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  disabled={savingEmail}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="outline" disabled={savingEmail}>
                {savingEmail ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Updating email...
                  </>
                ) : (
                  "Update email address"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Security: Change Password & Active Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-brand" aria-hidden="true" />
              <CardTitle>Change Password</CardTitle>
            </div>
            <CardDescription>
              Passwords are hashed server-side with Better Auth&apos;s scrypt implementation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordNotice ? (
                <Alert variant={passwordNotice.type}>{passwordNotice.message}</Alert>
              ) : null}

              <div>
                <Label htmlFor="settings-current-password">Current password</Label>
                <Input
                  id="settings-current-password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={savingPassword}
                  required
                />
              </div>

              <div>
                <Label htmlFor="settings-new-password">New password</Label>
                <Input
                  id="settings-new-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={savingPassword}
                  required
                />
              </div>

              <div>
                <Label htmlFor="settings-confirm-new-password">Confirm new password</Label>
                <Input
                  id="settings-confirm-new-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  disabled={savingPassword}
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={revokeOthersOnPasswordChange}
                  onChange={(e) => setRevokeOthersOnPasswordChange(e.target.checked)}
                  disabled={savingPassword}
                  className="h-4 w-4 accent-brand"
                />
                Sign out all other devices after changing password
              </label>

              <Button type="submit" variant="outline" disabled={savingPassword} className="w-full">
                {savingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Updating password...
                  </>
                ) : (
                  "Update password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-brand" aria-hidden="true" />
                <CardTitle>Active Sessions ({sessions.length})</CardTitle>
              </div>
              <CardDescription>
                Database-backed sessions across web browsers and future mobile clients. Revoking a
                session takes effect immediately.
              </CardDescription>
            </div>
            {otherSessionsCount > 0 ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRevokeOtherSessions}
                disabled={revokingAllOthers}
              >
                {revokingAllOthers ? "Revoking..." : `Revoke others (${otherSessionsCount})`}
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-3">
            {sessionNotice ? (
              <Alert variant={sessionNotice.type}>{sessionNotice.message}</Alert>
            ) : null}

            <div className="divide-y divide-border rounded-lg border border-border">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3.5 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Monitor className="h-3.5 w-3.5 text-muted shrink-0" aria-hidden="true" />
                      <span className="font-medium text-foreground truncate max-w-52">
                        {session.userAgent ? session.userAgent.slice(0, 48) : "Web / API Session"}
                      </span>
                      {session.isCurrent ? <Badge variant="brand">Current</Badge> : null}
                    </div>
                    <p className="text-[11px] text-muted">
                      Created: {formatDateInTimezone(session.createdAt, timezone)}
                    </p>
                    <p className="text-[11px] text-muted">
                      Expires: {formatDateInTimezone(session.expiresAt, timezone)}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRevokeSession(session.id, session.isCurrent)}
                    disabled={revokingId === session.id}
                    aria-label={session.isCurrent ? "Revoke current session" : "Revoke session"}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {revokingId === session.id ? "..." : "Revoke"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
