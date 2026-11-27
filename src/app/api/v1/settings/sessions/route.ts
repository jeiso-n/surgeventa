import { connection } from "next/server";
import { z } from "zod";
import { requireApiSession } from "@/server/auth/session";
import {
  listUserSessions,
  revokeOtherUserSessions,
  revokeUserSessionById,
} from "@/server/services/user-settings";

const revokeSchema = z
  .object({
    sessionId: z.string().uuid().optional(),
    revokeOthers: z.boolean().optional(),
  })
  .refine((val) => Boolean(val.sessionId) || val.revokeOthers === true, {
    message: "Provide a sessionId or set revokeOthers to true.",
  });

export async function GET(request: Request) {
  await connection();

  const authResult = await requireApiSession(request);
  if (!authResult.ok) {
    return authResult.response;
  }

  const sessions = await listUserSessions(
    authResult.context.user.id,
    authResult.context.session.id,
  );

  return Response.json({ sessions });
}

export async function DELETE(request: Request) {
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

  const parsed = revokeSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid session revocation request." },
      { status: 400 },
    );
  }

  const { user, session } = authResult.context;

  if (parsed.data.revokeOthers) {
    const revokedCount = await revokeOtherUserSessions(user.id, session.id);
    return Response.json({ ok: true, revokedCount });
  }

  const targetSessionId = parsed.data.sessionId!;
  const revoked = await revokeUserSessionById(user.id, targetSessionId);
  if (!revoked) {
    return Response.json(
      { error: "Session not found or does not belong to your account." },
      { status: 404 },
    );
  }

  return Response.json({
    ok: true,
    revokedSessionId: targetSessionId,
    revokedCurrentSession: targetSessionId === session.id,
  });
}
