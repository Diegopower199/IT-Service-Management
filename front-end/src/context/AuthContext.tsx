"use client";

import api, { setupResponseInterceptor } from "@/config/axios";
import { logout } from "@/app/modules/auth/services/authService";
import type { UserRole } from "@/types/roleTypes";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

interface AuthUser {
  userId: number;
  username: string;
  role: UserRole;
}

interface AuthSession {
  token: string | null;
  user: AuthUser | null;
}

const signedOutSession: AuthSession = { token: null, user: null };

function readStoredSession(): AuthSession {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role") as UserRole | null;

  if (!token || !userId || !username || !role) return signedOutSession;

  return { token, user: { userId: Number(userId), username, role } };
}

function createAuthSessionStore() {
  let session: AuthSession | undefined;
  const listeners = new Set<() => void>();

  return {
    getSnapshot: () => (session ??= readStoredSession()),
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    setSession(nextSession: AuthSession) {
      session = nextSession;
      listeners.forEach((listener) => listener());
    },
  };
}

// React uses this snapshot on the server and during the initial hydration.
const getServerSession = () => null;

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  setAuthentication: (
    token: string,
    userId: number,
    username: string,
    role: UserRole,
  ) => void;
  signOut: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Global authentication context.
 *
 * Provides the current authentication state and authentication-related
 * operations to components rendered inside the AuthProvider.
 */
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

/**
 * Provides authentication state and operations to the application.
 *
 * The provider is responsible for:
 *
 * - Restoring persisted authentication data when the application starts.
 * - Keeping React authentication state synchronized with localStorage.
 * - Updating the access token after an automatic token refresh.
 * - Clearing the authentication state when the session expires.
 * - Connecting the authentication state with the Axios response interceptor.
 * - Performing the complete sign-out flow.
 *
 * @param children components rendered inside the authentication provider
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [sessionStore] = useState(createAuthSessionStore);

  const session = useSyncExternalStore<AuthSession | null>(
    sessionStore.subscribe,
    sessionStore.getSnapshot,
    getServerSession,
  );
  const { token, user } = session ?? signedOutSession;
  const isAuthReady = session !== null;

  /**
   * Updates the access token after a successful automatic refresh.
   */
  const handleAccessTokenRefreshed = useCallback((newToken: string) => {
    localStorage.setItem("token", newToken);
    sessionStore.setSession({ ...sessionStore.getSnapshot(), token: newToken });
  }, [sessionStore]);

  /**
   * Clears all authentication information stored locally.
   */
  const clearAuthentication = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    sessionStore.setSession(signedOutSession);
  }, [sessionStore]);

  /**
   * Handles a session that can no longer be renewed.
   */
  const handleSessionExpired = useCallback(() => {
    clearAuthentication();
    router.replace("/login");
  }, [clearAuthentication, router]);

  /**
   * Registers the Axios response interceptor used by the automatic token
   * refresh mechanism.
   */
  useEffect(() => {
    const interceptorId = setupResponseInterceptor({
      onAccessTokenRefreshed: handleAccessTokenRefreshed,
      onSessionExpired: handleSessionExpired,
    });

    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, [handleAccessTokenRefreshed, handleSessionExpired]);

  /**
   * Stores authentication information after a successful login.
   *
   * @param newToken access token returned by the authentication API
   * @param userId authenticated user's ID
   * @param username authenticated username
   * @param role authenticated user's role
   */
  const setAuthentication = (
    newToken: string,
    userId: number,
    username: string,
    role: UserRole,
  ) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("userId", userId.toString());
    localStorage.setItem("username", username);
    localStorage.setItem("role", role);

    sessionStore.setSession({
      token: newToken,
      user: { userId, username, role },
    });
  };

  /**
   * Signs out the current authenticated session.
   *
   * The backend is notified so it can revoke the current refresh token and
   * remove the HttpOnly refresh token cookie.
   *
   * Local authentication data is always cleared, even if the logout request
   * fails.
   */
  const signOut = async (): Promise<void> => {
    try {
      await logout();
    } finally {
      clearAuthentication();
      router.replace("/login");
    }
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        isAuthReady,
        setAuthentication,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
