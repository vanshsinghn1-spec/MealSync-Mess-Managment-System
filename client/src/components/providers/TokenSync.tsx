"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function TokenSync() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      const userObj = session.user as Record<string, any>;
      if (userObj.accessToken) {
        localStorage.setItem("mealsync-token", userObj.accessToken);
      }
    } else {
      localStorage.removeItem("mealsync-token");
    }
  }, [session]);

  return null;
}
