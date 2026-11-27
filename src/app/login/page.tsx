import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getServerAuthContext } from "@/server/auth/session";

interface LoginPageProps {
  searchParams: Promise<{ reason?: string; next?: string }>;
}

async function LoginContent({ searchParams }: LoginPageProps) {
  const existingSession = await getServerAuthContext();
  if (existingSession) {
    redirect("/");
  }

  const params = await searchParams;
  return <LoginForm reason={params.reason} nextPath={params.next} />;
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <AuthShell
      heading="Sign in to Surgeventa"
      subheading="Access your unified social media publishing workspace."
    >
      <Suspense fallback={<div className="h-56 animate-pulse rounded-lg bg-surface-subtle" />}>
        <LoginContent searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}
