import { connection } from "next/server";
import { TARGET_PLATFORMS } from "@/domain/platforms";
import { getEnvironmentReadiness } from "@/lib/env";
import { checkDatabaseHealth } from "@/server/db";

export async function GET() {
  await connection();

  const readiness = getEnvironmentReadiness();
  const database = await checkDatabaseHealth();

  const status =
    !database.configured || database.connected ? "ok" : "degraded";

  return Response.json(
    {
      status,
      app: "Surgevanta",
      milestone: "M1-foundation",
      timestamp: new Date().toISOString(),
      readiness,
      database,
      platformsTracked: TARGET_PLATFORMS.length,
    },
    { status: status === "ok" ? 200 : 503 },
  );
}
