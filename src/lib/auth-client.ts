"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Browser Better Auth client using same-origin `/api/auth/*` endpoints.
 */
export const authClient = createAuthClient();
