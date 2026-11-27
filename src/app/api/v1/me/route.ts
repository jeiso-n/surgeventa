import { connection } from "next/server";
import { requireApiSession } from "@/server/auth/session";
import { getUserWorkspaceSummary } from "@/server/services/user-settings";

export async function GET(request: Request) {
  await connection();

  const authResult = await requireApiSession(request);
  if (!authResult.ok) {
    return authResult.response;
  }

  const { user, session } = authResult.context;
  const summary = await getUserWorkspaceSummary(user.id);

  return Response.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      timezone: user.timezone,
      defaultPublishingPreferences: user.defaultPublishingPreferences,
      createdAt: user.createdAt.toISOString(),
    },
    session: {
      id: session.id,
      expiresAt: session.expiresAt.toISOString(),
    },
    summary,
  });
}
