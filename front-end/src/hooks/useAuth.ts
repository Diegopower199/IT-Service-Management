import { useContext } from "react";

import { AuthContext } from "@/context/AuthContext";

/**
 * Provides access to the authentication context.
 *
 * It must be used inside an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
