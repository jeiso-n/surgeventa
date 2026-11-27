import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { getServerAuthContext } from "@/server/auth/session";

async function RegisterContent() {
  const existingSession = await getServerAuthContext();
  if (existingSession) {
    redirect("/");
  }

  return <RegisterForm />;
}

export default function RegisterPage() {
  return (
    <AuthShell
      heading="Create your Surgeventa account"
      subheading="Your workspace defaults to UTC and can be customized anytime in Settings."
    >
      <Suspense fallback={<div className="h-72 animate-pulse rounded-lg bg-surface-subtle" />}>
        <RegisterContent />
      </Suspense>
    </AuthShell>
  );
}
