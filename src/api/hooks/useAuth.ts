import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as authApi from "../auth";
import { fetchMe } from "../account";
import { useAuthStore } from "../../store/authStore";
import { getRefreshToken, clearRefreshToken, saveRefreshToken } from "../../utils/secureStorage";
import { useWalletStore } from "../../store/walletStore"; // adjust path if different

export function useRequestOtp() {
  return useMutation({
    mutationFn: ({
      phone,
      purpose,
      email,
    }: {
      phone: string;
      purpose: "SIGNUP" | "LOGIN_NEW_DEVICE";
      email?: string;
    }) => authApi.requestOtp(phone, purpose, email),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: authApi.verifyOtp,
  });
}

export function useSignup() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: authApi.signup,
    onSuccess: async (data) => {
      await saveRefreshToken(data.refreshToken);
      setSession(data.user, data.accessToken);
    },
  });
}

export function useLoginNewDevice() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: authApi.loginNewDevice,
    onSuccess: async (data) => {
      await saveRefreshToken(data.refreshToken);
      setSession(data.user, data.accessToken);
    },
  });
}

export function usePinUnlock() {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const setUnlocked = useAuthStore((s) => s.setUnlocked);
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: authApi.verifyPinUnlock,
    onSuccess: async (data) => {
      setAccessToken(data.accessToken);
      // Mark the session authenticated immediately — otherwise a failed
      // getMe below leaves isAuthenticated false and every dashboard query
      // stays disabled forever (useMe/useTransactions gate on it).
      setAuthenticated(true);
      setUnlocked(true);
      // Best-effort user refresh; the dashboard's useMe refetches it anyway.
      try {
        const { user } = await fetchMe();
        setSession(user, data.accessToken);
      } catch {
        // Non-fatal — access token is set, user can still proceed
      }
    },
  });
}

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession);
  const resetWallet = useWalletStore((s) => s.reset);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        await authApi.logout(refreshToken).catch(() => {});
      }
    },
    onSettled: async () => {
      await clearRefreshToken();
      clearSession();
      resetWallet();
      // Drop all cached queries so the next user starts with a clean slate.
      queryClient.clear();
    },
  });
}