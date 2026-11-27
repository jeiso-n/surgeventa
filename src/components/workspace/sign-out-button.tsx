"use client";

import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await authClient.signOut();
    } finally {
      // Full navigation intentionally clears cached authenticated DOM across sign-out.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/login?reason=signed_out");
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      disabled={signingOut}
      aria-label="Sign out"
    >
      {signingOut ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          Signing out
        </>
      ) : (
        <>
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          Sign out
        </>
      )}
    </Button>
  );
}
