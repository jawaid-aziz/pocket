import { apiClient } from "./client";

export interface User {
  id: string;
  phone: string;
  name: string | null;
  email?: string | null;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export function requestOtp(
  phone: string,
  purpose: "SIGNUP" | "LOGIN_NEW_DEVICE",
  email?: string,
) {
  return apiClient<{ message: string }>(
    "/api/auth/otp/request",
    {
      method: "POST",
      body: JSON.stringify({ phone, purpose, email }),
    },
  );
}

export function verifyOtp(params: {
  phone: string;
  otpCode: string;
  purpose: "SIGNUP" | "LOGIN_NEW_DEVICE";
}) {
  return apiClient<{ otpToken: string }>("/api/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function signup(params: {
  phone: string;
  email: string;
  otpToken: string;
  pin: string;
  name?: string;
  deviceName?: string;
}) {
  return apiClient<AuthResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function loginNewDevice(params: {
  phone: string;
  otpToken: string;
  pin: string;
  deviceName?: string;
}) {
  return apiClient<AuthResponse>("/api/auth/login/device", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function verifyPinUnlock(params: { refreshToken: string; pin: string }) {
  return apiClient<{ accessToken: string }>("/api/auth/pin/verify", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function refreshAccessToken(refreshToken: string) {
  return apiClient<{ accessToken: string }>("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export function logout(refreshToken: string) {
  return apiClient<{ message: string }>("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export function getMe(token: string) {
  return apiClient<{ user: User }>("/api/auth/me", { token });
}
