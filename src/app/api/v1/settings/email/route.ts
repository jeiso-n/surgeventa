import { connection } from "next/server";
import { changeEmailSchema } from "@/domain/settings";
import { requireApiSession } from "@/server/auth/session";
import { changeUserEmail } from "@/server/services/user-settings";

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

  const parsed = changeEmailSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid email update payload." },
      { status: 400 },
    );
  }

  const result = await changeUserEmail(
    authResult.context.user.id,
    parsed.data.currentPassword,
    parsed.data.newEmail,
  );

  if (!result.ok) {
    return Response.json({ error: result.message }, { status: result.status });
  }

  return Response.json({
    email: result.email,
    emailVerified: false,
    message: "Email address updated successfully.",
  });
}
