"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, LogIn } from "lucide-react";
import { loginInputSchema } from "@/domain/settings";
import { authClient } from "@/lib/auth-client";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface LoginFormProps {
  reason?: string;
  nextPath?: string;
}

function resolveSafeRedirect(nextPath?: string): string {
  if (!nextPath) return "/";
  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) return "/";
  return nextPath;
}

export function LoginForm({ reason, nextPath }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const destination = resolveSafeRedirect(nextPath);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const parsed = loginInputSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? "Please check your credentials.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await authClient.signIn.email({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (result.error) {
        setErrorMessage(result.error.message || "Invalid email or password.");
        setSubmitting(false);
        return;
      }

      window.location.assign(destination);
    } catch {
      setErrorMessage("Unable to sign in right now. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {reason === "session_expired" ? (
        <Alert variant="warning" title="Session expired">
          Your previous session expired or was revoked. Sign in again to continue.
        </Alert>
      ) : null}

      {reason === "auth_required" ? (
        <Alert variant="info" title="Sign in required">
          Sign in to access your Surgeventa publishing workspace.
        </Alert>
      ) : null}

      {reason === "signed_out" ? (
        <Alert variant="success" title="Signed out">
          Your session has been ended safely.
        </Alert>
      ) : null}

      {errorMessage ? (
        <Alert variant="danger" title="Sign-in failed">
          {errorMessage}
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="login-email">Email address</Label>
          <Input
            id="login-email"
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
          <Label htmlFor="login-password">Password</Label>
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <Button type="submit" className="w-full h-10" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Sign in to workspace
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-xs text-muted pt-2 border-t border-border">
        New to Surgeventa?{" "}
        <Link href="/register" className="font-medium text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
