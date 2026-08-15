import {
  getRefreshToken,
  clearRefreshToken,
  saveRefreshToken,
} from "../utils/secureStorage";
import { useAuthStore } from "../store/authStore";
import { useWalletStore } from "../store/walletStore";
import { router } from "expo-router";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

interface ApiOptions extends RequestInit {
  token?: string;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Single-flight refresh so concurrent 401s share one refresh call.
let refreshPromise: Promise<string | null> | null = null;

function forceLogout() {
  clearRefreshToken().catch(() => {});
  useAuthStore.getState().clearSession();
  useWalletStore.getState().reset();
  // Kick the user out of the app instead of leaving a zombie tab open
  // with disabled queries and stale data.
  router.replace("/login");
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
          // No refresh token on file — treat as signed out rather than
          // keeping a stale accessToken that can never be refreshed.
          forceLogout();
          return null;
        }

        const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.accessToken || !data.refreshToken) {
          // Refresh token revoked or expired — force a clean logout
          forceLogout();
          return null;
        }

        useAuthStore.getState().setAccessToken(data.accessToken);
        // Persist the rotated refresh token so the next refresh uses the new one.
        await saveRefreshToken(data.refreshToken);
        return data.accessToken as string;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const doFetch = (accessToken?: string) =>
    fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...fetchOptions.headers,
      },
    });

  let response = await doFetch(token);

  // Access token expired — refresh once and retry the request.
  if (response.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      response = await doFetch(newToken);
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      data.error || `Request failed: ${response.status}`,
      response.status,
    );
  }

  return data as T;
}