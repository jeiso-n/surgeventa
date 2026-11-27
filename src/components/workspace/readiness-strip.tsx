import { connection } from "next/server";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  KeyRound,
  Lock,
  Server,
} from "lucide-react";
import { getEnvironmentReadiness } from "@/lib/env";
import { checkDatabaseHealth } from "@/server/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface StatusMetric {
  label: string;
  value: string;
  detail: string;
  state: "ready" | "pending" | "error";
  icon: React.ReactNode;
}

export async function ReadinessStrip() {
  await connection();
  const readiness = getEnvironmentReadiness();
  const dbHealth = await checkDatabaseHealth();

  const dbState: StatusMetric["state"] = !dbHealth.configured
    ? "pending"
    : dbHealth.connected
      ? "ready"
      : "error";

  const dbValue = !dbHealth.configured
    ? "Awaiting Credentials"
    : dbHealth.connected
      ? "Connected"
      : "Connection Error";

  const dbDetail = !dbHealth.configured
    ? "Provide DATABASE_URL before Milestone 2"
    : dbHealth.connected
      ? `PostgreSQL ${dbHealth.serverVersion?.split(" ")[0] ?? ""} · ${dbHealth.schemaTablesCount ?? 0}/9 tables · ${dbHealth.latencyMs ?? 0}ms`
      : (dbHealth.error ?? "Unable to reach Neon PostgreSQL");

  const metrics: StatusMetric[] = [
    {
      label: "Application Runtime",
      value: "Online",
      detail: "Next.js App Router · TypeScript strict",
      state: "ready",
      icon: <Server className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "Neon PostgreSQL",
      value: dbValue,
      detail: dbDetail,
      state: dbState,
      icon: <Database className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "Token Encryption",
      value: readiness.tokenEncryptionKeyValid ? "AES-256-GCM Ready" : "Key Not Set",
      detail: "64-char hex key for OAuth tokens at rest",
      state: readiness.tokenEncryptionKeyValid ? "ready" : "pending",
      icon: <Lock className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "Session Auth",
      value: readiness.authSecretConfigured ? "Better Auth Active" : "Pending Setup",
      detail: "Database-backed revocable sessions",
      state: readiness.authSecretConfigured ? "ready" : "pending",
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
              <Badge
                variant={
                  item.state === "ready"
                    ? "success"
                    : item.state === "error"
                      ? "danger"
                      : "neutral"
                }
              >
                {item.state === "ready" ? (
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                ) : item.state === "error" ? (
                  <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <Clock3 className="h-3 w-3" aria-hidden="true" />
                )}
                {item.state === "ready"
                  ? "Ready"
                  : item.state === "error"
                    ? "Error"
                    : "Pending"}
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
