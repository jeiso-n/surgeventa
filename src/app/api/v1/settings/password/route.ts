import { connection } from "next/server";
import { changePasswordSchema } from "@/domain/settings";
import { getAuth } from "@/server/auth";
import { requireApiSession } from "@/server/auth/session";

export async function POST(request: Request) {
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

  const parsed = changePasswordSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid password update payload." },
      { status: 400 },
    );
  }

  try {
    await getAuth().api.changePassword({
      headers: request.headers,
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        revokeOtherSessions: parsed.data.revokeOtherSessions,
      },
    });

    return Response.json({
      ok: true,
      message: parsed.data.revokeOtherSessions
        ? "Password updated and all other sessions signed out."
        : "Password updated successfully.",
    });
  } catch (err) {
    const message =
      err instanceof Error && err.message
        ? err.message
        : "Unable to update password. Please verify your current password.";
    const status = message.toLowerCase().includes("invalid") || message.toLowerCase().includes("incorrect")
      ? 401
      : 400;
    return Response.json({ error: message }, { status });
  }
}
