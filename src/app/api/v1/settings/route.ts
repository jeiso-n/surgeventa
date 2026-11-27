import { connection } from "next/server";
import { updateSettingsSchema } from "@/domain/settings";
import { requireApiSession } from "@/server/auth/session";
import { getUserProfileById, updateUserSettings } from "@/server/services/user-settings";

export async function GET(request: Request) {
  await connection();

  const authResult = await requireApiSession(request);
  if (!authResult.ok) {
    return authResult.response;
  }

  const profile = await getUserProfileById(authResult.context.user.id);
  if (!profile) {
    return Response.json({ error: "User profile not found." }, { status: 404 });
  }

  return Response.json({ profile });
}

export async function PATCH(request: Request) {
  await connection();

  const authResult = await requireApiSession(request);
  if (!authResult.ok) {
    return authResult.response;
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const parsed = updateSettingsSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid settings payload.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const profile = await updateUserSettings(authResult.context.user.id, parsed.data);
  return Response.json({ profile });
}
