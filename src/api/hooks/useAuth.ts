import { useMutation } from "@tanstack/react-query";
import * as authApi from "../auth";
import { useAuthStore } from "../../store/authStore";
import { saveRefreshToken } from "../../utils/secureStorage";
import { verifyOtp as verifyOtpApi } from "../auth";

export function useRequestOtp() {
  return useMutation({
    mutationFn: ({
      phone,
      purpose,
    }: {
      phone: string;
      purpose: "SIGNUP" | "LOGIN_NEW_DEVICE";
    }) => authApi.requestOtp(phone, purpose),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: verifyOtpApi,
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
  const setUnlocked = useAuthStore((s) => s.setUnlocked);

  return useMutation({
    mutationFn: authApi.verifyPinUnlock,
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      setUnlocked(true);
    },
  });
}
