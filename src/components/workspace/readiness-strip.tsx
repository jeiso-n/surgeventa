import { connection } from "next/server";
import { CheckCircle2, Clock3, Database, KeyRound, Lock, Server } from "lucide-react";
import { getEnvironmentReadiness } from "@/lib/env";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface StatusMetric {
  label: string;
  value: string;
  detail: string;
  ready: boolean;
  icon: React.ReactNode;
}

export async function ReadinessStrip() {
  await connection();
  const readiness = getEnvironmentReadiness();

  const metrics: StatusMetric[] = [
    {
      label: "Application Runtime",
      value: "Online",
      detail: "Next.js App Router · TypeScript strict",
      ready: true,
      icon: <Server className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "Neon PostgreSQL",
      value: readiness.databaseConfigured ? "Configured" : "Awaiting Credentials",
      detail: readiness.databaseConfigured
        ? "Pooled connection string present"
        : "Provide DATABASE_URL before Milestone 2",
      ready: readiness.databaseConfigured,
      icon: <Database className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "Token Encryption",
      value: readiness.tokenEncryptionKeyValid ? "AES-256-GCM Ready" : "Key Not Set",
      detail: "64-char hex key for OAuth tokens at rest",
      ready: readiness.tokenEncryptionKeyValid,
      icon: <Lock className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "Session Auth Secret",
      value: readiness.authSecretConfigured ? "Configured" : "Pending Setup",
      detail: "Required in Milestone 2 authentication",
      ready: readiness.authSecretConfigured,
      icon: <KeyRound className="h-4 w-4" aria-hidden="true" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {metrics.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs font-medium text-muted">
                {item.icon}
                {item.label}
              </span>
              <Badge variant={item.ready ? "success" : "neutral"}>
                {item.ready ? (
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <Clock3 className="h-3 w-3" aria-hidden="true" />
                )}
                {item.ready ? "Ready" : "Pending"}
              </Badge>
            </div>
            <div>
              <p className="text-base font-semibold tracking-tight text-foreground">{item.value}</p>
              <p className="text-xs text-muted mt-0.5">{item.detail}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ReadinessStripFallback() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map((slot) => (
        <Card key={slot}>
          <CardContent className="p-4 space-y-3 animate-pulse">
            <div className="h-4 w-28 rounded bg-surface-subtle" />
            <div className="h-6 w-24 rounded bg-surface-subtle" />
            <div className="h-3 w-40 rounded bg-surface-subtle" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
