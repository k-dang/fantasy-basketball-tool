"use client";

import { Button } from "@/components/ui/button";

export function AuthButton() {
  const handleSignIn = () => {
    // we don't want a server side navigation here
    window.location.href = "/api/auth/yahoo";
  };

  return <Button onClick={handleSignIn}>Sign in with Yahoo</Button>;
}
