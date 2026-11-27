"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, UserPlus } from "lucide-react";
import { normalizeTimezone, registerInputSchema } from "@/domain/settings";
import { authClient } from "@/lib/auth-client";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    const detectedTimezone = normalizeTimezone(
      typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : "UTC",
    );

    const parsed = registerInputSchema.safeParse({
      displayName,
      email,
      password,
      timezone: detectedTimezone,
    });

    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? "Please review the form fields.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await authClient.signUp.email({
        name: parsed.data.displayName,
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (result.error) {
        setErrorMessage(result.error.message || "Could not create your account.");
        setSubmitting(false);
        return;
      }

      // Full navigation intentionally clears cached React Activity DOM across auth transitions.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/");
    } catch {
      setErrorMessage("Unable to complete registration right now. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {errorMessage ? (
        <Alert variant="danger" title="Registration failed">
          {errorMessage}
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="register-name">Display name</Label>
          <Input
            id="register-name"
            name="displayName"
            type="text"
            autoComplete="name"
            placeholder="Alex Morgan"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div>
          <Label htmlFor="register-email">Email address</Label>
          <Input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div>
          <Label htmlFor="register-password">Password</Label>
          <Input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div>
          <Label htmlFor="register-confirm-password">Confirm password</Label>
          <Input
            id="register-confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <Button type="submit" className="w-full h-10" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Creating account...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Create Surgeventa account
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-xs text-muted pt-2 border-t border-border">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
