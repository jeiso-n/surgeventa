import { connection } from "next/server";
import { TARGET_PLATFORMS } from "@/domain/platforms";
import { getEnvironmentReadiness } from "@/lib/env";

export async function GET() {
  await connection();

  const readiness = getEnvironmentReadiness();

  return Response.json(
    {
      status: "ok",
      app: "Surgevanta",
      milestone: "M1-foundation",
      timestamp: new Date().toISOString(),
      readiness,
      platformsTracked: TARGET_PLATFORMS.length,
    },
    { status: 200 },
  );
}
